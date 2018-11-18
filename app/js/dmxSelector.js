
// Checks if these are the same device
function sameDevice(devA, devB) {
    if (devA === null && devB === null) return true;
    if (devA === null || devB === null) return false;

    return devA.location === devB.location;
}

// Resets the HTML elements relating to the DMX selection
// Also resets the related dmxDevices array
function resetDmxHtml() {
    const dmxSelection = document.getElementById('dmxDeviceSelection');
    if (!dmxSelection) return; // Not on Settings page (required)

    // Remove all options from combo box
    while (dmxSelection.firstChild) {
        dmxSelection.removeChild(this.dmxSelection.firstChild);
    }
}

// Adds an option to the DMX device selection, linking to the devices[] array through the index
function addDeviceToHTML(device) {
    if (!device) return; // Has to be valid device

    const dmxSelection = document.getElementById('dmxDeviceSelection');
    if (!dmxSelection) return; // Not on Settings page (required)

    // Create new element
    const newOption = document.createElement('option');
    newOption.value = String(device.index);
    newOption.innerHTML = `${device.location} (${device.manufacturer})`;

    // Add to selection box
    this.dmxSelection.appendChild(newOption);
}

// Handles when the <select> for the dmx devices has its value change
function dmxDeviceOnChange() {
    const dmxSelection = document.getElementById('dmxDeviceSelection');
    if (!dmxSelection) return; // Not on Settings page (required)

    let deviceIdx = parseInt(dmxSelection.value, 10);

    if (Number.isNaN(deviceIdx)) {
        alert(`Selected device '${deviceIdx}' somehow not a number!`);
        deviceIdx = 0;
    }

    window.galliumGlobals.currentSettings.selectDevice(deviceIdx);
}

// Called when settings are updated
function settingsChanged(newSettings, oldSettings) {
    // We need both to be not null
    if (!newSettings) return;
    if (!oldSettings) return;

    // Get all found dmx devices
    const devices = newSettings.getDmxDevices();

    // Get the last dmx device we were selecting
    const lastSelected = oldSettings.getCurrentDmxDevice();

    // Clear the select element
    resetDmxHtml();

    // Repopulate select element
    if (devices !== null) {
        for (let i = 0; i < devices.length; i += 1) {
            const device = devices[i];

            // Add to selector box
            addDeviceToHTML(device);

            // Select if this was the last selected device
            if (sameDevice(lastSelected, device)) {
                newSettings.selectDevice(i);
            }
        }
    }
}

window.galliumGlobals.addSettingsChangedObserver(settingsChanged);
