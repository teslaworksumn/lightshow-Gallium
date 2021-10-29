// let isCollapsed = false;

import { DMX } from 'dmx';
const dmx = new DMX();
const DRIVER = 'enttec-usb-dmx-pro';
var universe;

function settingsLoaded() {
    if (settings.getCurrentDmxDevice() === null) {
        document.getElementById('currentDeviceText').innerHTML = 'None';
    } else {
        document.getElementById('currentDeviceText').innerHTML = `${settings.getCurrentDmxDevice().location}`;
        if (universe) {
            universe.close();
        }
        universe = dmx.addUniverse("dmx", DRIVER, settings.getCurrentDmxDevice().location);
    }
}

import { Settings } from "./settings.js";
settings = new Settings(settingsLoaded);


function changeFrame(src) {
    var frame = document.getElementById("frame");
    frame.src = src;
}

var logo = document.getElementById('logo');

logo.onclick = function () {
    changeFrame("html/default.html");
}