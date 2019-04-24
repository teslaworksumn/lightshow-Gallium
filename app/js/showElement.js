/* eslint "no-unused-expressions":  "off" */
const parent = window.parent;
const fs = parent.require('fs');
const { Howl } = parent.require('howler');

function ShowElement() {
    this.sequenceJsonPath;
    this.sequenceData;
    this.audio;
    this.timer;
    this.startTime;
    this.elementLength;
    this.audioPath;
    this.interval;
}

ShowElement.prototype.getSequenceJson = function () {
    return this.sequenceJsonPath;
};

ShowElement.prototype.setSequenceJson = function (sequenceJsonPath) {
    this.sequenceJsonPath = sequenceJsonPath;
};

ShowElement.prototype.getInterval = function () {
    return this.interval;
};

ShowElement.prototype.setInterval = function (interval) {
    this.interval = interval;
};

ShowElement.prototype.getSequenceData = function () {
    return this.sequenceData;
};

ShowElement.prototype.setSequenceData = function (sequenceData) {
    this.sequenceData = sequenceData;
};

ShowElement.prototype.getAudio = function () {
    return this.audio;
};

ShowElement.prototype.setAudio = function (audio) {
    this.audio = audio;
};

ShowElement.prototype.getTimer = function () {
    return this.timer;
};

ShowElement.prototype.setTimer = function (timer) {
    this.timer = timer;
};

ShowElement.prototype.getAudioPath = function () {
    return this.audioPath;
};

ShowElement.prototype.getStartTime = function () {
    return this.startTime;
};

ShowElement.prototype.setStartTime = function (startTime) {
    this.startTime = startTime;
};

ShowElement.prototype.getElementLength = function () {
    return this.elementLength;
};

ShowElement.prototype.setElementLength = function (elementLength) {
    this.elementLength = elementLength;
};

ShowElement.prototype.setUpSequence = async function () {
    const sequenceJSON = JSON.parse(fs.readFileSync(this.sequenceJsonPath));
    this.audioPath = sequenceJSON['Audio File'];
    this.sequenceData = sequenceJSON['Sequence Patched Data Json'];
    this.interval = sequenceJSON['Time Frame Length'];
    if (this.audioPath) {
        this.audio = new Howl({
            src: [this.audioPath],
        });
        const audioTag = new Audio(this.audioPath);
        return new Promise(((resolve, reject) => {
            audioTag.addEventListener('durationchange', () => {
                // convert to milliseconds by multiplying by 1000
                resolve(audioTag.duration * 1000);
            });
        }));
    }

    // Didn't have an audio path
    return new Promise((resolve, reject) => {
        // result is in milliseconds
        resolve(sequenceJSON['Sequence Length']);
    });
};

ShowElement.prototype.getDuration = function (url) {
    const audioTag = new Audio(url);
    return new Promise(((resolve, reject) => {
        audioTag.addEventListener('durationchange', () => {
            resolve(audioTag.duration);
        });
    }));
};

module.exports = ShowElement;
