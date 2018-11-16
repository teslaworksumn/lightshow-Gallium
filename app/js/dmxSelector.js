
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

    let selectedDevice = parseInt(dmxSelection.value, 10);

    if (Number.isNaN(selectedDevice)) {
        alert(`Selected device '${selectedDevice}' somehow not a number!`);
        selectedDevice = 0;
    }

    window.parent.currentSettings.selectDevice(selectedDevice);
}

// Called when settings are updated
function settingsChanged(newSettings) {
    // Get all found dmx devices
    const devices = newSettings.getDmxDevices();

    // Update the HTML
    resetDmxHtml();
    if (devices !== null) {
        for (let i = 0; i < devices; i += 1) {
            addDeviceToHTML(devices[i])
        }
    }

    // TODO stay on last selected element
}

window.parent.addSettingsChangedObserver(settingsChanged);