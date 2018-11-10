const parent = window.parent;
const fs = parent.require('fs');
const path = parent.require('path');
const DMX = parent.require('dmx');
const player = parent.require('play-sound')(opts = {});
const NanoTimer = parent.require('nanotimer');

const Settings = parent.require('./js/settings');

const dmx = new DMX();
let settings;
let timer;

const DRIVER = 'enttec-usb-dmx-pro';

// Create a universe
let universe = null;

/* Manual control */

// Sets up the DMX universe with the given device
// Can be called multiple times
function setUniverse(device) {
    if (device === null) return;

    const serialPort = device.location;
    universe = dmx.addUniverse('DMX Output', DRIVER, serialPort);
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

/* Sequences */
function updateSequence(json, start) {
    const index = Math.ceil((new Date() - start) / 50);

    // Make sure the universe is still set before updating
    if (universe !== null) {
        universe.update(json[index]);
    }
}

// Plays the sequence located at the given path
function playSequence(sequenceJsonPath) {
    if (universe === null) return;

    // Load sequence
    const sequenceJSON = JSON.parse(fs.readFileSync(sequenceJsonPath));
    const audioPath = sequenceJSON['Audio File'];
    const sequenceData = sequenceJSON['Sequence Data Json'];

    // Play
    player.play(audioPath, (err) => {
        if (err) throw err;
    });

    // Set update timer
    timer = new NanoTimer();
    const start = +new Date();
    timer.setInterval(updateSequence, [sequenceData, start], '50m');
}

// Stops playing the currently running sequence
function stopSequence() {
    timer.clearInterval();
    playback.pause();
}

// When settings load, set our universe we are using
function settingsLoaded() {
    setUniverse(settings.getCurrentDmxDevice());
}

// Make this down here, since we get linter errors otherwise
settings = new Settings(settingsLoaded);
