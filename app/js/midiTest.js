var navigator = parent.require('web-midi-api');
const DMX = parent.require('dmx');
const fs = parent.require('fs');

const KEY_PRESSED = "90";
const KEY_RELEASED = "80";

const INVALID = -1;
const NUM_KEYS = 12; // keys in an octave

const ON_OFF = 0;
const FADE = 1;
const PULSE = 2;
const CHASE = 3;

var midi;
var inputs;
var outputs;
var midiPort;

var numChannels = INVALID;
var keysDown = {};

var keyboardCharactersDown = {};

const select = document.getElementById("midiSelect");
const refresh = document.getElementById("midiRefresh");
const setMidi = document.getElementById("midiSet");
const midiName = document.getElementById("selectedMidiController");
const setChannelCount = document.getElementById("setChannelCount");
const midiControl = document.getElementById("midiControl");
const keyboardControl = document.getElementById("keyboardControl");
const useMidi = document.getElementById("useMidi");
const useKeyboard = document.getElementById("useKeyboard");

const input = document.querySelector('input');

useMidi.onclick = function showMidiControl() {
    midiControl.setAttribute("style", "display: block");
    keyboardControl.setAttribute("style", "display: none");

    // only listen for keypress events when the keyboard input option is chosen
    document.removeEventListener('keydown', keyboardToDmx);
    document.removeEventListener('keyup', keyboardToDmx);
}

useKeyboard.onclick = function showMidiControl() {
    keyboardControl.setAttribute("style", "display: block");
    midiControl.setAttribute("style", "display: none");

    showKeyboardTable();

    // captures when keys are pressed
    document.addEventListener('keydown', keyboardToDmx);
    document.addEventListener('keyup', keyboardToDmx);
}

midiControl.setAttribute("style", "display:none");
keyboardControl.setAttribute("style", "display:none");


function showKeyboardTable() {
    const table = document.getElementById("keyboardTable");

    // NUM_KEYS is just chosen for now - option to be changed for later?
    for (let i = 0; i < NUM_KEYS; i++) {
        const row = document.createElement("tr");
        const keyCol = document.createElement("td");

        const keyInput = document.createElement("input");
        keyInput.setAttribute("type", "text");
        keyInput.setAttribute("placeholder", "keyboard key");
        keyCol.appendChild(keyInput);

        const channelCol = document.createElement("td");
        const channelInput = document.createElement("input");
        channelInput.setAttribute("type", "text");
        channelInput.setAttribute("placeholder", "channel1,channel2, ...");
        channelCol.appendChild(channelInput);

        row.appendChild(keyCol);
        row.appendChild(channelCol);
        table.appendChild(row);
    }

    addEffectSelect("keyboardTable");
}

function mapChannelsKeyboard() {
    const table = document.getElementById("keyboardTable");
    let keys = [];
    let channels = [];

    for (var i = 0, row; row = table.rows[i]; i++) {
        let keyCol = row.cells[0];
        let key = keyCol.children[0].value;

        // only add if there is some input for keyboard character
        if (key) {
            keys.push(key);
        }

        let channelCol = row.cells[1];
        let channelInputs = channelCol.children[0].value;

        // only add if there is some input for channel list
        if (channelInputs) {
            channelInputs = channelInputs.split(/,/);
            let numberChannels = []
            for (let i = 0; i < channelInputs.length; i++) {
                if (!isNumber(channelInputs[i])) {
                    console.log("bad number here", channelInputs[i]);
                } else {
                    numberChannels.push(parseInt(channelInputs[i], 10));
                }
            }

            channels.push(numberChannels);
        }
    }

    //console.log("keys", keys);
    //console.log("channels", channels);

    // assign array of inputted channels to each keyboard character
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]; // keyboard character
        mapping[key] = channels[i];
        //keysDown[key] = 0;
    }

    // initialize DMX channel keys in keysDown
    for (let i = 0; i < channels.length; i++) {
        for (let j = 0; j < channels[i].length; j++) {
            let channel = channels[i][j];
            keysDown[channel] = 0;
        }
    }

    

    console.log("mapping", mapping);
    //console.log("keysDown", keysDown);
}

// add a row to the keyboard table, allowing for another input key
function addKeyboardKey() {
    const table = document.getElementById("keyboardTable");
    const row = document.createElement("tr");
    const keyCol = document.createElement("td");
    const inputCol = document.createElement("td");

    const keyInput = document.createElement("input");
    keyInput.setAttribute("type", "text");
    keyInput.setAttribute("placeholder", "keyboard key");
    keyCol.appendChild(keyInput);

    const channelCol = document.createElement("td");
    const channelInput = document.createElement("input");
    channelInput.setAttribute("type", "text");
    channelInput.setAttribute("placeholder", "channel1,channel2, ...");
    channelCol.appendChild(channelInput);

    const select = document.createElement("select");

    const option1 = document.createElement("option");
    option1.value = ON_OFF;
    option1.innerText = "on/off (standard)";
    select.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = FADE;
    option2.innerText = "fade";
    select.appendChild(option2);

    const option3 = document.createElement("option");
    option3.value = PULSE;
    option3.innerText = "pulse";
    select.appendChild(option3);

    const option4 = document.createElement("option");
    option4.value = CHASE;
    option4.innerText = "chase";
    select.appendChild(option4);

    channelCol.appendChild(select);

    row.appendChild(keyCol);
    row.appendChild(channelCol);
    table.appendChild(row);
}




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
        addEffectSelect("manualTable");
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
            mapping[i] = [validChannels[i % numChannels]];
            mapping[i].effect = ON_OFF;
        }
    }

    // ensure the object counting each key down keeps track of the channels that are mapped
    for (let i = 0; i < validChannels.length; i++) {
        keysDown[validChannels[i]] = 0;
    }
}

function addEffectSelect(id) {
    const table = document.getElementById(id);

    // add selection option for different effects
    for (let i = 0, row; row = table.rows[i]; i++) {
        let col = row.cells[1];
        const select = document.createElement("select");

        const option1 = document.createElement("option");
        option1.value = ON_OFF;
        option1.innerText = "on/off (standard)";
        select.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = FADE;
        option2.innerText = "fade";
        select.appendChild(option2);

        const option3 = document.createElement("option");
        option3.value = PULSE;
        option3.innerText = "pulse";
        select.appendChild(option3);

        const option4 = document.createElement("option");
        option4.value = CHASE;
        option4.innerText = "chase";
        select.appendChild(option4);

        col.appendChild(select);
    }
}


function mapChannelsManual() {
    var table = document.getElementById("manualTable");
    for (var i = 0, row; row = table.rows[i]; i++) {
        let col = row.cells[1];
        let channels = col.children[0].value; // channel input
        channels = channels.split(/,/);
        for (let i = 0; i < channels.length; i++) {
            if (!isNumber(channels[i])) {
                console.log("very bad number here");
            }

            channels[i] = parseInt(channels[i], 10);
        }
        mapping[i] = channels;


        let effect = col.children[1].value; 
        mapping[i].effect = effect;
    }

    // sets up keysDown
    for (let i = 0; i < NUM_KEYS; i++) {
        let dmxChannels = mapping[i];
        for (let j = 0; j < dmxChannels.length; j++) {
            console.log("dmxChannels", dmxChannels);
            keysDown[dmxChannels[j]] = 0;
        }
    }
    console.log("keysDown", keysDown);
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
        document.getElementById("textNumChannels").innerText = "invalid number";
        numChannels = INVALID;
    } else {
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
    console.log("key");
    const channels = mapping[key];

    const channelData = {};
    console.log("channels", channels);
    for (let i = 0; i < channels.length; i++) {
        let dmxChannel = channels[i];
        channelData[dmxChannel] = brightness;
    }

    //channelData[channel] = brightness;
    console.log("channelData", channelData);

    console.log("mapping", mapping);

    // ensures that a proper value for total DMX channels has been set
    if (!isEmpty(keysDown)) {
        // key is pressed
        if (action == KEY_PRESSED) {
            //console.log(key);
            parent.universe.update(channelData);
            for (let i = 0; i < channels.length; i++) {
                //console.log("in here", channels[i]);
                let dmxChannel = channels[i];
                keysDown[dmxChannel] += 1;
            }
            console.log("before", keysDown);
            //keysDown[channel] += 1;

            //console.log("mapping", mapping);
            //console.log("mapping[key]", mapping[key]);
            //console.log("channel", channel);
        } else if (action == KEY_RELEASED) { // key is released
            for (let i = 0; i < channels.length; i++) {
                let dmxChannel = channels[i];
                channelData[dmxChannel] = 0; // turn off channels
                keysDown[dmxChannel] -= 1;
                
                // only turn off light if all keys associated with that channel are up
                if (keysDown[dmxChannel] == 0) {
                    parent.universe.update(channelData);
                }
            }
        }
    }
}

function keyboardToDmx(keyPress) {
    const key = keyPress.key; // keyboard character typed
    const channels = mapping[key];

    const channelData = {};

    // if a mapping for the key exists
    if (channels) {
        for (let i = 0; i < channels.length; i++) {
            let dmxChannel = channels[i];

            // turn on lights all the way because a keyboard is only a digital input
            channelData[dmxChannel] = 255; 
        }
    } else {
        return;
    }
    
    if (!(key in keyboardCharactersDown)) {
        keyboardCharactersDown[key] = 0;
    }

    console.log("kcd", keyboardCharactersDown);


    if (!isEmpty(keysDown)) {
        // only update if the key isn't already down
        if (keyPress.type === "keydown" && keyboardCharactersDown[key] === 0) {
            parent.universe.update(channelData);

            keyboardCharactersDown[key] = 1;

            for (let i = 0; i < channels.length; i++) {
                //console.log("in here", channels[i]);
                let dmxChannel = channels[i];
                keysDown[dmxChannel] += 1;
            }

            console.log("keysDown", keysDown);
        } else if (keyPress.type === "keyup") {

            keyboardCharactersDown[key] = 0;

            for (let i = 0; i < channels.length; i++) {
                let dmxChannel = channels[i];
                channelData[dmxChannel] = 0; // turn off channels
                keysDown[dmxChannel] -= 1;
                
                // only turn off light if all keys associated with that channel are up
                if (keysDown[dmxChannel] == 0) {
                    parent.universe.update(channelData);
                }
            }
        }
    }
}

function pulse() {

}

function fade() {

}

function chase() {

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




function startMidilights() {
    //parent.universe.updateAll(255);
}

function stopMidilights() {
    parent.universe.updateAll(0);
    keysDown = {};
    navigator.close(); // This will close MIDI inputs, otherwise Node.js will wait for MIDI input forever.
}

