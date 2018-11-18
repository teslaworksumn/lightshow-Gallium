const parent = window.parent;
const fs = parent.require('fs');
const path = parent.require('path');
const DMX = parent.require('dmx');
const player = parent.require('play-sound')(opts = {});
const NanoTimer = parent.require('nanotimer');

const dmx = new DMX();
let timer;

const DRIVER = 'enttec-usb-dmx-pro';

// Create a universe
let universe = null;

/* Manual control */

// Sets up the DMX universe with the given serial output location (string)
// Can be called multiple times
function setUniverse(output) {
    if (output === null) {
        document.getElementById('currentDeviceText').innerHTML = 'None';
        return;
    }

    // Create universe
    const serialPort = output;
    universe = dmx.addUniverse('DMX Output', DRIVER, serialPort);
    document.getElementById('currentDeviceText').innerHTML = `${serialPort}`;
}

// Sets a range of channels to be on or off. Range is inclusive on both ends
// channelStart is an int, channelEnd is an int, value is an int in range [0, 255]
// Channels are 0-indexed
function setRange(channelStart, channelEnd, value) {
    if (universe === null) return;

    const channels = {};
    for (let i = channelStart; i <= channelEnd; i += 1) {
        // DMX is 1-indexed. This should be the only place where the +1 is added
        channels[i + 1] = value;
    }

    universe.update(channels);
}

// Sets a DMX channel to be on or off
// Channel is an int, value is an int in range [0, 255]
// Channels are 0-indexed
function setChannel(channel, value) {
    if (universe === null) return;

    setRange(channel, channel, value);
}

// Sets all channels to be on or off
// value is an int in range [0, 255]
function setAll(value) {
    if (universe === null) return;

    universe.updateAll(value);
}

// When settings load, set our universe we are using
function settingsLoaded(newSettings) {
    if (newSettings === null) return;

    const device = newSettings.getCurrentDmxDevice();
    if (device === null) return;

    const dmxOutput = device.location;
    if (dmxOutput === null) return;

    setUniverse(dmxOutput);
}

// This function is defined in index.html.
// Register a listener for when new settings are loaded
// See https://en.wikipedia.org/wiki/Observer_pattern
window.galliumGlobals.addSettingsChangedObserver(settingsLoaded);

// Initialize with current settings
settingsLoaded(window.galliumGlobals.currentSettings);
