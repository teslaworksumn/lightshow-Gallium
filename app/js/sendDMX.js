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

function stopUniverse(universe) {
    if (universe === null || typeof universe === 'undefined') return;
    if (universe.dev.isOpen) {
       universe.close();
    }
}

function stopPlaying(showElement) {
    if (showElement === null || typeof showElement === 'undefined') return;

    const audio = showElement.getAudio();
    if (audio) audio.kill();
    
    const timer = showElement.getTimer();
    if (timer) timer.clearInterval();
    
    stopUniverse(showElement.getUniverse());
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
    stopUniverse(showElement.getUniverse());
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
             console.log(err);
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
                    stopUniverse(elements[k - 1].getUniverse())
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
