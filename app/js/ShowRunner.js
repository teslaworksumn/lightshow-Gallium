const fs = parent.require('fs');
const NanoTimer = parent.require('nanotimer');
const ShowElementConstructor = parent.require('./js/ShowElement.js');

function ShowRunner() {
    this.canPlay = false; // bool check for if should go to next sequence
    this.repeat = false;
    this.showElements = [];
    this.showLength = 0;
}

ShowRunner.prototype.setupShowRunner = async function (sequencePathArray) {
    // create show elements with sequence json path
    for (let i = 0; i < sequencePathArray.length; i += 1) {
        this.showElements.push(new ShowElementConstructor());
        this.showElements[i].setSequenceJson(sequencePathArray[i]);
        // TODO make this a promise or something, so we can set up all asyncronously
        // eslint-disable-next-line no-await-in-loop
        const duration = await this.showElements[i].setUpSequence();
        this.showElements[i].setElementLength(duration);
    }

    const elementsLength = this.showElements.map(x => x.elementLength);
    this.showLength = elementsLength.reduce((total, elementLength) => total + elementLength, 0);
};


ShowRunner.prototype.setCanPlay = function (canPlay) {
    this.canPlay = canPlay;
};

ShowRunner.prototype.setRepeat = function (repeat) {
    this.repeat = repeat;
};

ShowRunner.prototype.stopPlaying = function (showElement) {
    // only stop audio if there is audio
    if (showElement.getAudio()) {
        showElement.getAudio().stop();
    }
    showElement.getTimer().clearInterval();
};

ShowRunner.prototype.stopAllShowElements = function () {
    for (let j = 0; j < this.showElements.length; j += 1) {
        this.stopPlaying(this.showElements[j]);
    }
};

ShowRunner.prototype.update = function (showElement) {
    const index = Math.ceil((new Date() - showElement.getStartTime()) / showElement.getInterval());
    parent.parent.universe.update(showElement.getSequenceData()[index]);
    if (index > showElement.getSequenceData().length) { // check for end of song
        this.stopPlaying(showElement);
    }
};

ShowRunner.prototype.playSequence = function (showElement) {
    if (showElement.audioPath) {
        showElement.getAudio().play();
    }
    showElement.setTimer(new NanoTimer());
    showElement.setStartTime(new Date());
    showElement.getTimer().setInterval(this.update, [showElement], '20m');
};

ShowRunner.prototype.checkAudioFinish = function (showElement) {
    const index = Math.ceil((new Date() - showElement.getStartTime()) / 50);
    if (showElement.getElementLength()) {
        if (index > showElement.getElementLength()) { // check for end of song
            this.stopPlaying(showElement);
        }
    }
};

ShowRunner.prototype.playAudio = function (showElement) {
    if (showElement.audioPath) {
        showElement.getAudio().play();
    }
    parent.parent.universe.updateAll(0);
    showElement.setTimer(new NanoTimer());
    showElement.setStartTime(new Date());
    showElement.getTimer().setInterval(this.checkAudioFinish, [showElement], '20m');
};

ShowRunner.prototype.playElement = function (showElement) {
    const sequenceJSON = JSON.parse(fs.readFileSync(showElement.getSequenceJson()));
    if (sequenceJSON['Sequence Data Json'].length === 0) {
        this.playAudio(showElement);
    } else {
        this.playSequence(showElement);
    }
};

ShowRunner.prototype.repeatShow = function (showElement) {

};

ShowRunner.prototype.triggerShow = function () {
    const i = 1;
    this.playElement(this.showElements[0]);
    // recursively waits and plays elements of the show
    function playSequenceInShow(ind) {
        let k = ind;
        if (this.canPlay) {
            setTimeout(() => {
                if (this.canPlay) {
                    if (k < elements.length) {
                        this.playElement(this.showElements[k]);
                        k += 1;
                        playShowInSequence(k);
                    }
                }
            }, this.showElements[k - 1].getElementLength());
        }
    }
    playSequenceInShow(i);
};

ShowRunner.prototype.playShow = async function () {
    if (this.repeat && this.canPlay) {
        setTimeout(() => {
            this.setCanPlay(false);
            this.stopAllShowElements();
            this.setCanPlay(true);
            this.playShow(this.showElements);
        }, this.showLength);
    }

    this.triggerShow();
};

module.exports = ShowRunner;
