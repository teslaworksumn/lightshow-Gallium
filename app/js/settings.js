const parent = window.parent;

const fse = parent.require('fs-extra');
const path = parent.require('path');
const serialport = parent.require('serialport');

// Filters whether the device with the given location and manufacturer is indeed a DMX device
function isDmxDevice(location, manufacturer) {
    // Ignore devices with no location or manufacturer
    if (location === undefined || manufacturer === undefined) {
        return false;
    }

    // For now, all other devices are viable. This can get filtered later
    // TODO actually filter (or decide if we don't need it)
    return true;
}

// Checks if these are the same device
function sameDevice(devA, devB) {
    if (devA === null && devB === null) return true;
    if (devA === null || devB === null) return false;

    return devA.location === devB.location;
}

class Settings {
    constructor(onLoad) {
        this.settingsConfigPath = path.resolve('app/config/settings.json');
        this.dmxSelection = document.getElementById('dmxDeviceSelection');

        this.dmxDevices = [];
        this.selectedDevice = 0;
        this.settingsConfig = null;

        this.load(onLoad);
    }

    /* DMX device selection */

    // Gets the currently selected DMX device. Returns null if none selected or out of range
    getCurrentDmxDevice() {

        // Check that we are in range
        if (this.selectedDevice >= this.dmxDevices.length || this.selectedDevice < 0) {
            return null;
        }

        // Return device
        return this.dmxDevices[this.selectedDevice];
    }

    // Handles when the <select> for the dmx devices has its value change
    dmxDeviceOnChange() {
        this.selectedDevice = parseInt(this.dmxSelection.value, 10);

        if (Number.isNaN(this.selectedDevice)) {
            alert(`Selected device '${this.selectedDevice}' somehow not a number!`);
            this.selectedDevice = 0;
        }

        // Save change to file
        this.save();
    }

    // Resets the HTML elements relating to the DMX selection
    // Also resets the related dmxDevices array
    resetDmxHtml() {
        // Array must match the DOM
        this.dmxDevices = [];

        // Remove all options from combo box
        while (this.dmxSelection.firstChild) {
            this.dmxSelection.removeChild(this.dmxSelection.firstChild);
        }
    }

    // Adds an option to the DMX device selection, linking to the devices[] array through the index
    addDeviceToHTML(index, textValue) {
        if (!this.dmxSelection) return; // Not on Settings page (required)

        // Create new element
        const newOption = document.createElement('option');
        newOption.value = String(index);
        newOption.innerHTML = textValue;

        // Add to selection box
        this.dmxSelection.appendChild(newOption);
    }

    // Adds a DMX device. Can be done through polling devices or set through loading settings.
    addDmxDevice(location, manufacturer, portIdx) {
        // Add to devices array
        this.dmxDevices.push({
            location,
            manufacturer,
        });

        // Add reference to HTML
        this.addDeviceToHTML(portIdx, `${location} (${manufacturer})`);
    }

    // Updates the devices array with all detected DMX serial devices
    getDmxDevices() {
        // See https://serialport.io/docs/api-stream#serialportlist
        serialport.list()
            .then((ports) => {
                let portIdx = 0;
                const oldSelectedDevice = this.getCurrentDmxDevice();

                // Reset the html stuff
                this.resetDmxHtml();

                // Check each port to see if it matches our expected device
                ports.forEach((port) => {
                    const location = port.comName;
                    const manufacturer = port.manufacturer;

                    if (isDmxDevice(location, manufacturer)) {
                        this.addDmxDevice(location, manufacturer, portIdx);

                        portIdx += 1;
                    }
                });

                // We updated our list. Try to keep selecting the current device
                if (oldSelectedDevice !== null) {
                    for (let i = 0; i < this.dmxDevices; i += 1) {
                        if (this.sameDevice(this.dmxDevices[i], oldSelectedDevice)) {
                            this.dmxSelection.selectedIndex = i;
                            break;
                        }
                    }
                }

                // We updated, so save
                this.save();
            })
            .catch((err) => {
                alert(`Problem detecting DMX devices: ${err}`);
                throw err;
            });
    }

    /* General settings handling */

    // Saves settings to settings.json
    save() {
        // Get page data
        const currentDmxDevice = this.getCurrentDmxDevice();

        // Update settings
        this.settingsConfig = {
            dmxDevice: JSON.stringify(currentDmxDevice, null, 2),
        };

        // Write to file
        fse.writeFileSync(this.settingsConfigPath, JSON.stringify(this.settingsConfig, null, 2));
    }

    // Loads settings from file
    load(onLoad) {
        // Make sure config file exists before using
        fse.pathExists(this.settingsConfigPath).then((exists) => {
            if (exists) {
                // Get settings
                this.settingsConfig = JSON.parse(fse.readFileSync(this.settingsConfigPath));

                // Set HTML elements
                const currentDmxDevice = JSON.parse(this.settingsConfig.dmxDevice);
                if (currentDmxDevice !== null) {
                    const loc = currentDmxDevice.location;
                    const man = currentDmxDevice.manufacturer;
                    this.addDmxDevice(loc, man, 0);
                }
            } else {
                // File doesn't exist, so create an empty config file there (save with defaults)
                this.save();
            }

            // Let our caller know we are done loading
            if (onLoad) {
                onLoad();
            }
        });
    }
}

// If this is being run in the browser, module isn't defined.
// We want the module.exports though for other pieces to get the settings.
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Settings;
} else {
    const settings = new Settings();
    window.Settings = settings;
    settings.getDmxDevices();
}
