/* eslint "no-unused-expressions":  "off" */
const fs = parent.require('fs');
const DMX = parent.require('dmx');
const { Howl } = parent.require('howler')

function ShowElement() {
    this.sequenceJsonPath;
    this.sequenceData;
    this.audio;
    this.universe;
    this.timer;
    this.startTime;
    this.elementLength;
    this.audioPath;
}

ShowElement.prototype.getSequenceJson = function () {
    return this.sequenceJsonPath;
};
ShowElement.prototype.setSequenceJson = function (sequenceJsonPath) {
    this.sequenceJsonPath = sequenceJsonPath;
};
ShowElement.prototype.getUniverse = function () {
    return this.universe;
};
ShowElement.prototype.setUniverse = function (universe) {
    this.universe = universe;
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

    this.sequenceData = sequenceJSON['Sequence Data Json'];

    this.audio = new Howl({
        src: [this.audioPath]
    });

    var audioTag = new Audio(this.audioPath);
    return new Promise(function (resolve, reject) {
        audioTag.addEventListener('durationchange', function () {
            resolve(audioTag.duration);
        });
    });

}

ShowElement.prototype.getDuration = function (url) {
    var audioTag = new Audio(url);
    return new Promise(function (resolve, reject) {
        audioTag.addEventListener('durationchange', function () {
            resolve(audioTag.duration);
        });
    });
};

module.exports = ShowElement;