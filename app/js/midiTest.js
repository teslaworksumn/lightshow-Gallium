var navigator = parent.require('web-midi-api');
const DMX = parent.require('dmx');

const KEY_PRESSED = "90";
const KEY_RELEASED = "80";

var midi;
var inputs;
var outputs;
var midiPort;

var numChannels = 0;
var keysDown = {};

const select = document.getElementById("midiSelect");
const refresh = document.getElementById("midiRefresh");
const setMidi = document.getElementById("midiSet");
const midiName = document.getElementById("selectedMidiController");
const setChannelCount = document.getElementById("setChannelCount");

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


setChannelCount.onclick = function setNumChannels() {
    numChannels = document.getElementById("numChannels").value;
    const channelInt = parseInt(numChannels, 10);

    // ensures the value entered is a number
    if (Number.isNaN(channelInt) || channelInt !== Number(channelInt)) {
        document.getElementById("textNumChannels").innerText = "invalid number";

        // ensures no keys lights can be pressed when an improper DMX channel
        // count is inputted
        keysDown = {};
    } else {
        for (let i = 1; i <= numChannels; i++) {
            keysDown[i] = 0;
        }

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
    const key = data[1];
    const brightness = data[2] * 2; // multiply by 2 to get 0-255 values

    // DMX channels are 1 indexed so 1 needs to be added
    const channel = (key % parseInt(numChannels)) + 1;

    const channelData = {};
    channelData[channel] = brightness;

    // ensures that a proper value for total DMX channels has been set
    if (!isEmpty(keysDown)) {
        // key is pressed
        if (action == KEY_PRESSED) {
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

