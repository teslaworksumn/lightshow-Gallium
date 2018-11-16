/* Functions that are not class-specific */

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
        const parent = window.parent;
        const path = parent.require('path');

        this.fse = parent.require('fs-extra');
        this.serialport = parent.require('serialport');

        this.settingsConfigPath = path.resolve('app/config/settings.json');

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

    // Gets all discovered DMX devices
    getDmxDevices() {
        return this.dmxDevices;
    }

    // Selects the device with the given index
    // Returns null if out of range
    // This updates future calls to getCurrentDmxDevice to get the returned device
    selectDevice(index) {
        if (index >= this.dmxDevices.length || index < 0) {
            return null;
        }

        this.selectedDevice = index;

        // Since we changed the selected device, save
        this.save();

        return getCurrentDmxDevice();
    }

    // Adds a DMX device. Can be done through polling devices or set through loading settings.
    addDmxDevice(location, manufacturer, portIdx) {
        // Add to devices array
        this.dmxDevices.push({
            index: portIdx,
            location,
            manufacturer,
        });
    }

    // Updates the devices array with all detected DMX serial devices
    refresh() {
        // See https://serialport.io/docs/api-stream#serialportlist
        this.serialport.list()
            .then((ports) => {
                let portIdx = 0;

                // Check each port to see if it matches our expected device
                ports.forEach((port) => {
                    const location = port.comName;
                    const manufacturer = port.manufacturer;

                    if (isDmxDevice(location, manufacturer)) {
                        this.addDmxDevice(location, manufacturer, portIdx);

                        portIdx += 1;
                    }
                });

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
        const settingsAsJson = JSON.stringify(this.settingsConfig, null, 2);
        this.fse.writeFileSync(this.settingsConfigPath, settingsAsJson);
    }

    // Loads settings from file
    load(onLoad) {
        // Make sure config file exists before using
        this.fse.pathExists(this.settingsConfigPath).then((exists) => {
            if (exists) {
                // Get settings
                this.settingsConfig = JSON.parse(this.fse.readFileSync(this.settingsConfigPath));
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
    window.Settings = Settings;
}
