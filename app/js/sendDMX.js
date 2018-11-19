const fs = parent.require('fs');
const DMX = parent.require('dmx');
const player = parent.require('play-sound')(opts = {});
const NanoTimer = parent.require('nanotimer');

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
    // const SERIAL_PORT = '/dev/cu.usbserial-EN175330'; // hardcoded needs to be changed
    const SERIAL_PORT = '/dev/ttyUSB0'; // hardcoded needs to be changed

    const sequenceJSON = JSON.parse(fs.readFileSync(showElement.getSequenceJson()));
    const audioPath = sequenceJSON['Audio File'];

    showElement.setSequenceData(sequenceJSON['Sequence Patched Data Json']);
    showElement.setUniverse(dmx.addUniverse(`${sequenceJSON.Name}`, DRIVER, SERIAL_PORT));
    showElement.setAudio(player.play(audioPath, (err) => {
        if (err) {
            // console.log('no audio found at:', audioPath);
        }
    }));

    showElement.setSequenceLength(sequenceJSON['Sequence Length']);
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