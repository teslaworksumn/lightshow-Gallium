/* eslint "no-unused-expressions":  "off" */


function ShowElement() {
    this.sequenceJsonPath;
    this.sequenceData;
    this.audio;
    this.universe;
    this.timer;
    this.startTime;
    this.sequenceLength;
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
ShowElement.prototype.getStartTime = function () {
    return this.startTime;
};
ShowElement.prototype.setStartTime = function (startTime) {
    this.startTime = startTime;
};
ShowElement.prototype.getSequenceLength = function () {
    return this.sequenceLength;
};
ShowElement.prototype.setSequenceLength = function (sequenceLength) {
    this.sequenceLength = sequenceLength;
};

module.exports = ShowElement;
