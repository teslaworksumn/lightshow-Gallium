const fs = require('fs');
var path = require('path')
const DMX = require('dmx');
var player = require('play-sound')(opts = {})
var NanoTimer = require('nanotimer');


const dmx = new DMX();
const DRIVER = 'enttec-usb-dmx-pro';
const SERIAL_PORT = '/dev/cu.usbserial-EN175330';
var timer;
// const SERIAL_PORT = '/dev/ttyUSB0'; - Ubuntu
// const SERIAL_PORT ='/dev/cu.usbserial-6AVNHXS8' - MAC 
// const SERIAL_PORT ='COM4' - Windows

// Create a universe
//need to add error checking for DMX to make sure SERIAl PORT response, can be used and exists. 
// add automatic detection and maybe as the user / have a drop down if there is more that one dmx output.
// Maybe regex

function playSequence(sequenceJsonPath) {
    var sequenceJSON = JSON.parse(fs.readFileSync(sequenceJsonPath));
    var audioPath = sequenceJSON["Audio File"]
    var sequenceData = sequenceJSON["Sequence Data Json"];
    const universe = dmx.addUniverse(`${sequenceJSON["Name"]}`, DRIVER, SERIAL_PORT);

    player.play(audioPath, function (err) {
        if (err) throw err
    })

    timer = new NanoTimer();
    var start = +new Date();
    timer.setInterval(time, [universe, sequenceData, start], '50m')

}

function time(dmxuniverse, json, start) {
    var index = Math.ceil((new Date() - start) / 50);
    dmxuniverse.update(json[index])
}

function stopSequence() {
    timer.clearInterval();
    playback.pause();
}
