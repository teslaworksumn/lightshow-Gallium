const fs = require('fs');
const path = require('path');
const DMX = require('dmx');
const player = require('play-sound')(opts = {});
const NanoTimer = require('nanotimer');


const dmx = new DMX();
const DRIVER = 'enttec-usb-dmx-pro';
const SERIAL_PORT = '/dev/cu.usbserial-EN175330';
let timer;
// const SERIAL_PORT = '/dev/ttyUSB0'; - Ubuntu
// const SERIAL_PORT ='/dev/cu.usbserial-6AVNHXS8' - MAC
// const SERIAL_PORT ='COM4' - Windows

// Create a universe
// need to add error checking for DMX to make sure SERIAl PORT response, can be used and exists.
// add automatic detection and maybe as the user /
// have a drop down if there is more that one dmx output.
// Maybe regex

function time(dmxuniverse, json, start) {
    const index = Math.ceil((new Date() - start) / 50);
    dmxuniverse.update(json[index]);
}

function playSequence(sequenceJsonPath) {
    const sequenceJSON = JSON.parse(fs.readFileSync(sequenceJsonPath));
    const audioPath = sequenceJSON['Audio File'];
    const sequenceData = sequenceJSON['Sequence Data Json'];
    const universe = dmx.addUniverse(`${sequenceJSON.Name}`, DRIVER, SERIAL_PORT);

    player.play(audioPath, (err) => {
        if (err) throw err;
    });

    timer = new NanoTimer();
    const start = +new Date();
    timer.setInterval(time, [universe, sequenceData, start], '50m');
}

function stopSequence() {
    timer.clearInterval();
    playback.pause();
}
