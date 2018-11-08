const parent = window.parent;
const serialport = parent.require('serialport');

const dmxSelection = document.getElementById('dmxDeviceSelection');
let dmxDevices = [];

function resetDmxHtml() {
    // Array must match the DOM
    dmxDevices = [];

    // Remove all options from combo box
    while (dmxSelection.firstChild) {
        dmxSelection.removeChild(dmxSelection.firstChild);
    }

    // Create default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '-1';
    defaultOption.innerHTML = 'None';

    // Add in default option
    dmxSelection.appendChild(defaultOption);
}

// Adds an option to the DMX device selection, linking to the devices[] array through the index
function addDeviceToHTML(index, textValue) {
    // Create new element
    const newOption = document.createElement('option');
    newOption.value = String(index);
    newOption.innerHTML = textValue;

    // Add to selection box
    dmxSelection.appendChild(newOption);
}

// Filters whether the device with the given location and manufacturer is indeed a DMX device
function isDmxDevice(location, manufacturer) {
    // Ignore devices with no location or manufacturer
    if (location === undefined || manufacturer === undefined)
        return false;

    // For now, all other devices are viable. This can get filtered later
    // TODO actually filter (or decide if we don't need it)
    return true;
}

// Updates the devices array with all detected DMX serial devices
function getDmxDevices() {
    // See https://serialport.io/docs/api-stream#serialportlist
    serialport.list()
        .then((ports) => {
            let portIdx = 0;

            // Reset the html stuff
            resetDmxHtml();

            // Check each port to see if it matches our expected device
            ports.forEach((port) => {
                const location = port.comName;
                const manufacturer = port.manufacturer;

                if (isDmxDevice(location, manufacturer)) {
                    // Add to devices array
                    dmxDevices.push({
                        location,
                        manufacturer,
                    });

                    // Add reference to HTML
                    addDeviceToHTML(portIdx, `${location} / ${manufacturer}`);

                    portIdx += 1;
                }
            });
        })
        .catch((err) => {
            alert(`Problem detecting DMX devices: ${err}`);
            throw err;
        });
}

// Initial load of devices
getDmxDevices();
