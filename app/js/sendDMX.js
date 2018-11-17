const fs = parent.require('fs');
const DMX = parent.require('dmx');
const player = parent.require('play-sound')(opts = {});
const NanoTimer = parent.require('nanotimer');
const load = parent.require('audio-loader');
const { Howl, Howler } = parent.require('howler')

let canPlay = false; // bool check for if should go to next sequence

function startCanPlay() {
    canPlay = true;
}

function stopCanPlay() {
    canPlay = false;
}
function stopPlaying(showElement) {
    showElement.getAudio().stop();
    const universe = showElement.getUniverse();
    if (universe !== null && universe !== "undefined" && universe.dev.isOpen === true) {
        universe.close();
    }
    showElement.getTimer().clearInterval();
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
    const dmx = new DMX();
    const DRIVER = 'enttec-usb-dmx-pro';
    const SERIAL_PORT = '/dev/cu.usbserial-EN175330'; // hardcoded needs to be changed
    showElement.setUniverse(dmx.addUniverse(`${JSON.parse(fs.readFileSync(showElement.getSequenceJson())).Name}`, DRIVER, SERIAL_PORT));
    showElement.getAudio().play()
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
    }
}

function playAudio(showElement) {
    showElement.getAudio().play()
    // showElement.getUniverse().updateAll(0)
    const dmx = new DMX();
    const DRIVER = 'enttec-usb-dmx-pro';
    const SERIAL_PORT = '/dev/cu.usbserial-EN175330'; // hardcoded needs to be changed
    showElement.setUniverse(dmx.addUniverse(`${JSON.parse(fs.readFileSync(showElement.getSequenceJson())).Name}`, DRIVER, SERIAL_PORT));
    showElement.getUniverse().updateAll(0);
    showElement.setTimer(new NanoTimer());
    showElement.setStartTime(new Date());
    showElement.getTimer().setInterval(checkAudioFinish, [showElement], '20m');
}

function playElement(showElement) {
    const sequenceJSON = JSON.parse(fs.readFileSync(showElement.getSequenceJson()));
    if (sequenceJSON['Sequence Data Json'].length == 0) {
        playAudio(showElement)

    } else {
        playSequence(showElement);
    }
}

async function playShow(elements) {
    const i = 1;
    playElement(elements[0]);

    // recursively waits and plays elements of the show
    function playShowInSequence(ind) {
        let k = ind;
        if (canPlay) {
            setTimeout(() => {
                if (canPlay) {
                    if(elements[k-1].getUniverse()){
                        elements[k-1].getUniverse().close()
                    };
                    if (k < elements.length) {
                        playElement(elements[k]);
                        k += 1;
                        playShowInSequence(k);
                    }
                }
            }, elements[k-1].getElementLength());
        }
    }
    playShowInSequence(i)
}
  

  