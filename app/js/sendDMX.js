const fs = parent.require('fs');
const DMX = parent.require('dmx');
const player = parent.require('play-sound')(opts = {});
const NanoTimer = parent.require('nanotimer');
const load = parent.require('audio-loader');
const { Howl, Howler } = parent.require('howler');
const Settings = parent.require('./js/settings');


let canPlay = false; // bool check for if should go to next sequence

function startCanPlay() {
    canPlay = true;
}

function stopCanPlay() {
    canPlay = false;
}
function stopPlaying(showElement) {
    showElement.getAudio().kill();
    showElement.getTimer().clearInterval();
    if (showElement.getUniverse()) {
        showElement.getUniverse().close();
    }
}

function update(showElement) {
    const index = Math.ceil((new Date() - showElement.getStartTime()) / 50); // HARDCODE
    showElement.getUniverse().update(showElement.getSequenceData()[index]);
    // console.log(index, '   ', showElement.getSequenceData().length);
    if (index > showElement.getSequenceData().length) { // check for end of song
        stopPlaying(showElement);
    }
}

function playSequence(showElement) {
    if (showElement.getUniverse()) { // make sure all callbacks are finished
        showElement.getUniverse().close();
    }
    const dmx = new DMX();
    const DRIVER = 'enttec-usb-dmx-pro';
    const SERIAL_PORT = parent.parent.settings.getCurrentDmxDevice().location; 
    showElement.setUniverse(dmx.addUniverse(`${JSON.parse(fs.readFileSync(showElement.getSequenceJson())).Name}`, DRIVER, SERIAL_PORT));
    showElement.getAudio().play();
    showElement.setTimer(new NanoTimer());
    showElement.setStartTime(new Date());
    showElement.getTimer().setInterval(update, [showElement], '20m');
}
function checkAudioFinish(showElement) {
    const index = Math.ceil((new Date() - showElement.getStartTime()) / 50); // HARDCODE
    if (showElement.getElementLength()) {
        if (index > showElement.getElementLength()) { // check for end of song
            stopPlaying(showElement);
        }
    }};

function playAudio(showElement) {
    showElement.getAudio().play();
    // showElement.getUniverse().updateAll(0)
    const dmx = new DMX();
    const DRIVER = 'enttec-usb-dmx-pro';
    const SERIAL_PORT = parent.parent.settings.getCurrentDmxDevice().location; 
    showElement.setUniverse(dmx.addUniverse(`${JSON.parse(fs.readFileSync(showElement.getSequenceJson())).Name}`, DRIVER, SERIAL_PORT));
    showElement.getUniverse().updateAll(0);
    showElement.setTimer(new NanoTimer());
    showElement.setStartTime(new Date());
    showElement.getTimer().setInterval(update, [showElement], '50m');
}

function playShow(elements) {
    const i = 1;
    playSequence(elements[0]);

    // recursively waits and plays elements of the show

    function playShowInSequence(ind) {
        let k = ind;
        if (canPlay) {
            setTimeout(() => {
                if (canPlay) {
                    if (elements[k - 1].getUniverse()) {
                        elements[k - 1].getUniverse().close();
                    }
                    playSequence(elements[k]);
                    k += 1;
                    if (k < elements.length) {
                        playShowInSequence(k);
                    }
                }
            }, elements[k - 1].getSequenceLength());
        }
    }
    playShowInSequence(i);
}
