const fs = require('fs');

const DMX = require('dmx');

const dmx = new DMX();

const DRIVER = 'enttec-usb-dmx-pro';
const SERIAL_PORT = '/dev/ttyUSB0';

// Create a universe
const universe = dmx.addUniverse('demo', DRIVER, SERIAL_PORT);

// Run some command. Send to max out all channels

// fs.chmodSync(SERIAL_PORT, 666);

const a = new DMX.Animation();
const b = new DMX.Animation();

a.add({
    1: 255,
    2: 255,
    3: 255,
    4: 255,
    5: 255,
    6: 255,
    7: 255,
    8: 255,
    9: 255,
    10: 255,
    11: 255,
    12: 255,
    13: 255,
    14: 255,
    15: 255,
    16: 255,
}, 3000);

b.add({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 0,
}, 3000);

// a.run(universe);


let on = false;
setInterval(() => {
    if (on) {
        on = false;
        universe.updateAll(0);
        // a.run(universe);
        // console.log('off');
    } else {
        on = true;
        universe.updateAll(250);
        // b.run(universe);
        // console.log('on');
    }
}, 3000);
