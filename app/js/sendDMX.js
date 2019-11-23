const fs = parent.require('fs');
const DMX = parent.require('dmx');
const NanoTimer = parent.require('nanotimer');
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
    const audio = showElement.getAudio();
    if (audio) {
        audio.stop();
    }

    showElement.getTimer().clearInterval();
}

function update(showElement) {
    const index = Math.ceil((new Date() - showElement.getStartTime()) / showElement.getInterval());
    parent.parent.universe.update(showElement.getSequenceData()[index]);
    if (index > showElement.getSequenceData().length) { // check for end of song
        stopPlaying(showElement);
    }
}

function playSequence(showElement) {
    if (showElement.audioPath) {
        showElement.getAudio().play();
    }
    showElement.setTimer(new NanoTimer());
    showElement.setStartTime(new Date());
    showElement.getTimer().setInterval(update, [showElement], '20m');
}

function checkAudioFinish(showElement) {
    const index = Math.ceil((new Date() - showElement.getStartTime()) / 50);
    if (showElement.getElementLength()) {
        if (index > showElement.getElementLength()) { // check for end of song
            stopPlaying(showElement);
        }
    }
}

function playAudio(showElement) {
    if (showElement.audioPath) {
        showElement.getAudio().play();
    }
    parent.parent.universe.updateAll(0);
    showElement.setTimer(new NanoTimer());
    showElement.setStartTime(new Date());
    showElement.getTimer().setInterval(checkAudioFinish, [showElement], '20m');
}

function playElement(showElement) {
    const sequenceJSON = JSON.parse(fs.readFileSync(showElement.getSequenceJson()));
    if (sequenceJSON['Sequence Data Json'].length === 0) {
        playAudio(showElement);
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
                    if (k < elements.length) {
                        playElement(elements[k]);
                        k += 1;
                        playShowInSequence(k);
                    }
                }
            }, elements[k - 1].getElementLength());
        }
    }
    playShowInSequence(i);
}
