const parent = window.parent;

const fs = parent.require('fs');
const DMX = parent.require('dmx');

const dmx = new DMX();

const DRIVER = 'enttec-usb-dmx-pro';
const SERIAL_PORT = '/dev/ttyUSB0';

// Create a universe
const universe = dmx.addUniverse('demo', DRIVER, SERIAL_PORT);

// Sets a DMX channel to be on or off
// Channel is an int, value is an int in range [0, 255]
// Channels are 0-indexed
function setChannel(channel, value) {
    setRange(channel, channel, value);
}

// Sets a range of channels to be on or off. Range is inclusive on both ends
// channelStart is an int, channelEnd is an int, value is an int in range [0, 255]
// Channels are 0-indexed
function setRange(channelStart, channelEnd, value) {
    console.log("Setting DMX channels in range [" + (channelStart+1) + ", " + (channelEnd+1) + "] to " + value);

    let channels = {};
    for (var i = channelStart; i <= channelEnd; i++) {
        // DMX is 1-indexed. This should be the only place where the +1 is added
        channels[i+1] = value;
    }
    
    universe.update(channels);
}

// Sets all channels to be on or off
// value is an int in range [0, 255]
function setAll(value) {
    console.log("Setting all channels to " + value);

    universe.updateAll(value);
}


// Run some command. Send to max out all channels
// fs.chmodSync(SERIAL_PORT, 666);
