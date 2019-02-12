var navigator = parent.require('web-midi-api');
const DMX = parent.require('dmx');
const fs = parent.require('fs');

const KEY_PRESSED = "90";
const KEY_RELEASED = "80";

const INVALID = -1;
const NUM_KEYS = 12; // keys in an octave

var midi;
var inputs;
var outputs;
var midiPort;

var numChannels = INVALID;
var keysDown = {};

const select = document.getElementById("midiSelect");
const refresh = document.getElementById("midiRefresh");
const setMidi = document.getElementById("midiSet");
const midiName = document.getElementById("selectedMidiController");
const setChannelCount = document.getElementById("setChannelCount");

// dictionary containing channel mappings
// key: keyboard note
// value: array of DMX channel numbers
var mapping = {};

refresh.onclick = function refreshMidiDevices() {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

setMidi.onclick = function setMidiDevice() {
    const midiSelection = select.value;

    inputs.forEach(function (port) {
        if (midiSelection == port.id) {
            midiName.innerText = port.name;
            port.onmidimessage = onMidiIn;
        }
    });
}

// show the relevant portion of the UI
function showMappingInterface(choice) {
    const autoDiv = document.getElementById("mapAuto");
    const manualDiv = document.getElementById("mapManual");

    if (choice.value === "automatic") {
        autoDiv.setAttribute("style", "display: block");
        manualDiv.setAttribute("style", "display: none");
    } else if (choice.value === "manual") {
        manualDiv.setAttribute("style", "display: block");
        autoDiv.setAttribute("style", "display: none");
    }
}

// Maps every key to 1 DMX channel
// DMX channels may repeat so that every key has exactly 1 channel of DMX output
function mapChannelsAuto() {
    let emptyChannels = document.getElementById("autoEmptyChannels").value;
    const label = document.getElementById("autoErrorText");
    emptyChannels = emptyChannels.split(/,/);

    var validChannels = [];

    for (let i = 0; i < emptyChannels.length; i++) {
        if (!isNumber(emptyChannels[i])) {
            label.innerText = "Invalid number entered.  Ensure only integers and commas are entered"

            return;
        }

        emptyChannels[i] = parseInt(emptyChannels[i], 10);
    }

    label.innerText = "";

    if (numChannels === INVALID) {
        label.innerText = "Enter a valid number of DMX channels and try again"
    } else {
        // create an array consisting of the lowest channel numbers that haven't been excluded
        // need numChannels number of valid channels
        let totalChannels = 0;
        let currentChannelNum = 1; // DMX is 1-indexed
        while (totalChannels < numChannels) {
            if (emptyChannels.includes(currentChannelNum)) {
                currentChannelNum++;
            } else {
                validChannels.push(currentChannelNum);
                totalChannels++;
                currentChannelNum++;
            }
        }

        // add the DMX channel for a key to a mapping
        // DMX channels can repeat
        for (let i = 0; i < NUM_KEYS; i++) {
            mapping[i] = validChannels[i % numChannels];
        }
    }

    // ensure the object counting each key down keeps track of the channels that are mapped
    for (let i = 0; i < validChannels.length; i++) {
        keysDown[validChannels[i]] = 0;
    }
}

function mapChannelsManual() {
    
}

function isNumber(value) {
    value = parseInt(value, 10);
    if (Number.isNaN(value) || value !== Number(value)) {
        return false;
    }

    return true;
}


setChannelCount.onclick = function setNumChannels() {
    numChannels = document.getElementById("numChannels").value;
    numChannels = parseInt(numChannels, 10);
    const channelInt = parseInt(numChannels, 10);

    // ensures the value entered is a number
    if (!isNumber(channelInt)) {
    //if (Number.isNaN(channelInt) || channelInt !== Number(channelInt)) {
        document.getElementById("textNumChannels").innerText = "invalid number";
        numChannels = INVALID;

        // ensures no keys lights can be pressed when an improper DMX channel
        // count is inputted
        //keysDown = {};
    } else {
        /*
        for (let i = 1; i <= numChannels; i++) {
            keysDown[i] = 0;
        }
        */

        document.getElementById("textNumChannels").innerText = channelInt;
    }
}

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);



function onMIDIFailure(msg){
  console.log('Failed to get MIDI access - ' + msg);
  process.exit(1);
}

function onMIDISuccess(midiAccess) {
    midi = midiAccess;
    inputs = midi.inputs;
    outputs = midi.outputs;
    addMidiDevicesToSelect(inputs);
}

function addMidiDevicesToSelect(inputs) {
    // clear list of options before generating new ones
    while(select.childNodes.length > 0) {
        select.removeChild(select.lastChild);
    }

    inputs.forEach(function (port) {
        const option = document.createElement("option");
        option.value = port.id;
        option.innerText = port.name;

        select.appendChild(option);
    });
}

/*
function testOutputs() {
  console.log('Testing MIDI-Out ports...');
  outputs.forEach(function(port){
    //console.log('id:', port.id, 'manufacturer:', port.manufacturer, 'name:', port.name, 'version:', port.version);
    console.log(port);
    port.open();
    port.send([0x90, 60, 0x7f]);
  });
  setTimeout(stopOutputs, 1000);
}
*/

function stopOutputs() {
  outputs.forEach(function(port){
    port.send([0x80, 60, 0]);
  });
  testInputs();
}

function onMidiIn(ev) {
    midiToDmx(ev.data);
}

// takes MIDI input data and turns on lights accordingly
function midiToDmx(data) {
    const action = data[0].toString(16);
    const key = data[1] % NUM_KEYS; // returns number from 0-11 to index into the mapping dictionary
    const brightness = data[2] * 2; // multiply by 2 to get 0-255 values

    // mapping is looked up and returned based on previous mapping calculation
    const channel = mapping[key];


    const channelData = {};
    channelData[channel] = brightness;

    // ensures that a proper value for total DMX channels has been set
    if (!isEmpty(keysDown)) {
        // key is pressed
        if (action == KEY_PRESSED) {
            console.log(key);
            parent.universe.update(channelData);
            keysDown[channel] += 1;
        } else if (action == KEY_RELEASED) { // key is released
            channelData[channel] = 0;
            keysDown[channel] -= 1;

            // only turn off light if all keys associated with that channel are up
            if (keysDown[channel] == 0) {
                parent.universe.update(channelData);
            }
        }
    }
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

function createMapping(configFilePath) {
    //fse
}


/* Features to add
 * automatic/manual key to channel mapping
 * ripple effect when some keys are pressed
 * fade effect when keys are pressed
 * select which DMX channels are being used
 */






/*
function testInputs() {
  console.log('Testing MIDI-In ports...');
  inputs.forEach(function(port){
    console.log('id:', port.id, 'manufacturer:', port.manufacturer, 'name:', port.name, 'version:', port.version);
    port.onmidimessage = onMidiIn;
  });
}
*/


function startMidilights() {
    //parent.universe.updateAll(255);
}

function stopMidilights() {
    parent.universe.updateAll(0);
    navigator.close(); // This will close MIDI inputs, otherwise Node.js will wait for MIDI input forever.
}

