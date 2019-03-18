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

// constants used to help determine which stage of setting up the page is on
const FINISHED = 4;

var firstNote = -1;
var secondNote = -2;

// used to determine if the midi inputs are for setting up the keyboard or are
// regular presses
var settingUpCount = 0;
var isSettingUp = true;

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


midiControl.setAttribute("style", "display:none");
keyboardControl.setAttribute("style", "display:none");


// Set GUI elements based on the type of input
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



function showKeyboardTable() {
    const keyboardDiv = document.getElementById("keyboardControl");
    const table = createMappingTable(-1, -1, "keyboard");

    // remove previous tables instead of adding to them
    const oldTable = keyboardDiv.querySelector("table");
    if (oldTable) {
        keyboardDiv.removeChild(oldTable);
    }

    keyboardDiv.appendChild(table);
}

function mapChannelsKeyboard() {
    const table = document.getElementById("keyboardTable");
    let keys = [];
    let channels = [];

    // extract all rows with channels mapped and push to appropriate arrays
    for (var i = 0, row; row = table.rows[i]; i++) {
        let keyCol = row.cells[0];
        let key = keyCol.children[0].value;

        // only add if there is some input for keyboard character
        if (key) {
            keys.push(key);
        }

        // second column is text box with key that is being mapped
        let channelCol = row.cells[1];

        // first child is text box with CSV separated DMX channels
        let channelInputs = channelCol.children[0].value;

        // only add if there is some input for channel list
        if (channelInputs) {
            channelInputs = channelInputs.split(/,/);
            let dmxChannels = []
            for (let i = 0; i < channelInputs.length; i++) {
                if (!isNumber(channelInputs[i])) {
                    console.log("bad number here", channelInputs[i]);
                } else {
                    dmxChannels.push(parseInt(channelInputs[i], 10));
                }
            }

            channels.push(dmxChannels);
        }
    }

    // assign array of inputted channels to each keyboard character
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]; // keyboard character
        mapping[key] = channels[i];
    }

    console.log("mapping", mapping);

    // initialize DMX channel keys in keysDown
    for (let i = 0; i < channels.length; i++) {
        for (let j = 0; j < channels[i].length; j++) {
            let channel = channels[i][j];
            keysDown[channel] = 0;
        }
    }

    console.log("mapping", mapping);
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
function showAutoMappingInterface(choice) {
    const autoDiv = document.getElementById("mapAuto");
    const manualDiv = document.getElementById("mapManual");
    const manualTypeDiv = document.getElementById("manualType");

    autoDiv.setAttribute("style", "display: block");
    manualDiv.setAttribute("style", "display: none");
    manualType.setAttribute("style", "display: none");
}

function hideElement(id) {
    if (typeof id === 'string') {
        const element = document.getElementById(id);
        element.setAttribute("class", "invisible");
    } else {
        id.setAttribute("class", "invisible");
    }
}

function showElement(id) {
    if (typeof id === 'string') {
        const element = document.getElementById(id);
        element.removeAttribute("class");
    } else {
        id.removeAttribute("class");
    }
}


function setupAutoMap() {

}

function setupManualMap() {
}

function setupOneOctave() {
    showOneOctaveTable();
    isSettingUp = false; // no prompting notes needed for this selection

    hideElement(keyboardControl);
    hideElement("prompts");
    hideElement("mapAuto");
}

function setupKeyRange() {
    hideElement(keyboardControl);
    hideElement("mapAuto");

    showElement("prompts");
    isSettingUp = true;
}

function showManualTypeInterface() {
    const manualType = document.getElementById("manualType");
    const autoDiv = document.getElementById("mapAuto");

    manualType.setAttribute("style", "display: block");
    autoDiv.setAttribute("style", "display: none");
}

// shows a table with notes from C to B
function showOneOctaveTable() {
    const C4 = 60;
    const B4 = 71;
    
    showMidiTable(C4, B4);
}

function showMidiTable(low, high) {
    const manualDiv = document.getElementById('mapManual');
    const table = createMappingTable(low, high, "midi");

    table.setAttribute("id", "manualTable");

    manualDiv.appendChild(table);
    manualDiv.setAttribute("style", "display: block");
}

// function promptNotes() {
//     const prompts = document.getElementById("prompts");

//     prompts.setAttribute("style", "display: block");
//     isSettingUp = true;
// }


// Returns an HTML table containing rows for every key between (inclusive)
// startNote and endNote
function createMappingTable(startNote, endNote, inputType) {
    const table = document.createElement("table");

    if (inputType === "midi") {
        // i <= endNote includes all notes in the range
        for (let i = startNote; i <= endNote; i++) {
            const row = document.createElement("tr");
            const keyCol = document.createElement("td");
            const inputCol = document.createElement("td");

            keyCol.innerText = getNoteLetterFromMidi(i);
            keyCol.value = i; // value is MIDI note number

            const channelInput = document.createElement("input");
            const select = createEffectSelect();
            inputCol.appendChild(channelInput);
            inputCol.appendChild(select);

            row.appendChild(keyCol);
            row.appendChild(inputCol);

            table.appendChild(row);
        }
    } else if (inputType === "keyboard") {
        for (let i = 0; i < NUM_KEYS; i++) {
            const row = document.createElement("tr");
            const keyCol = document.createElement("td");
            const inputCol = document.createElement("td");

            const noteInput = document.createElement("input");
            keyCol.appendChild(noteInput);

            const channelInput = document.createElement("input");
            const select = createEffectSelect();
            inputCol.appendChild(channelInput);
            inputCol.appendChild(select);

            row.appendChild(keyCol);
            row.appendChild(inputCol);

            table.appendChild(row);
            table.setAttribute("id", "keyboardTable");
        }
    }

    return table;
}

// Function that takes in a midi note number and converts it to a string
// representing the note name
function getNoteLetterFromMidi(midiNote) {
    const note = midiNote % NUM_KEYS;

    if (note === 0) {
        return 'C';
    } else if (note === 1) {
        return 'C# / Db';
    } else if (note === 2) {
        return 'D';
    } else if (note === 3) {
        return 'D# / Eb'
    } else if (note === 4) {
        return 'E';
    } else if (note === 5) {
        return 'F';
    } else if (note === 6) {
        return 'F# / Gb';
    } else if (note === 7) {
        return 'G';
    } else if (note === 8) {
        return "G# / Ab";
    } else if (note === 9) {
        return "A";
    } else if (note === 10) {
        return "A# / Bb";
    } else if (note === 11) {
        return "B";
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
        console.log("length", emptyChannels.length, emptyChannels);
        if (!isNumber(emptyChannels[i])) {
            if (emptyChannels[i] === "") {
                return;
            }
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

// Returns an HTML select element with lighting effects as options
function createEffectSelect() {
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

    return select;
}


function mapChannelsManual() {
    var table = document.getElementById("manualTable");
    console.log(table);
    for (var i = 0, row; row = table.rows[i]; i++) {
        let noteNameCell = row.cells[0];
        let note = noteNameCell.value;

        let col = row.cells[1];
        let channels = col.children[0].value; // channel input
        console.log("channels", channels);
        channels = channels.split(/,/);
        for (let i = 0; i < channels.length; i++) {
            if (!isNumber(channels[i])) {
                console.log("very bad number here");
            } else {
                channels[i] = parseInt(channels[i], 10);
            }
        }

        mapping[note] = channels;

        let effect = col.children[1].value; 
        mapping[note].effect = effect;
    }
    
    console.log("mapping", mapping);

    // sets up keysDown
    // for every MIDI note
    for (let i = firstNote; i <= secondNote; i++) {
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
    const key = data[1]; // returns number from 0-11 to index into the mapping dictionary
    const brightness = data[2] * 2; // multiply by 2 to get 0-255 values

    console.log("getting MIDI", isSettingUp);


    if (isSettingUp) {
        // only do something on key presses
        if (action === KEY_PRESSED) { 
            if (firstNote === -1 && secondNote === -2) {
                console.log("press 1");
                firstNote = data[1]; // get raw MIDI note number
                console.log("firstNote", firstNote);
                const lowPrompt = document.getElementById("promptLowNote");
                lowPrompt.innerText += " Success!";

                const highPrompt = document.getElementById("promptHighNote");
                highPrompt.setAttribute("style", "display: block");
            } else if (secondNote === -2) {
                console.log("press 2");
                secondNote = data[1]; // get raw MIDI note number
                console.log("secondNote", secondNote);

                const prompts = document.getElementById("prompts");
                prompts.setAttribute("class", "invisible");

                showMidiTable(firstNote, secondNote);
            }
        } else if (action === KEY_RELEASED && firstNote > 0 && secondNote > 0) {
            if (isSettingUp) {
                isSettingUp = false;
            }
        }
    } else {
        // mapping is looked up and returned based on previous mapping calculation
        const channels = mapping[key];

        const channelData = {};
        for (let i = 0; i < channels.length; i++) {
            let dmxChannel = channels[i];
            channelData[dmxChannel] = brightness;
        }

        // ensures that a proper value for total DMX channels has been set
        if (!isEmpty(keysDown)) {
            if (action == KEY_PRESSED) {
                parent.universe.update(channelData);
                for (let i = 0; i < channels.length; i++) {
                    let dmxChannel = channels[i];
                    keysDown[dmxChannel] += 1;
                }
                console.log("before", keysDown);
            } else if (action == KEY_RELEASED) {
                for (let i = 0; i < channels.length; i++) {
                    let dmxChannel = channels[i];
                    channelData[dmxChannel] = 0; // turn off channels
                    keysDown[dmxChannel] -= 1;
                    
                    console.log("after", keysDown);
                    // only turn off light if all keys associated with that channel are up
                    if (keysDown[dmxChannel] === 0) {
                        console.log("dmxChannel", dmxChannel);
                        parent.universe.update(channelData);
                    }
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
    
    // add to array if the key isn't already in there
    if (!(key in keyboardCharactersDown)) {
        keyboardCharactersDown[key] = 0;
    }

    // console.log("kcd", keyboardCharactersDown);


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

            console.log("Down", keysDown);
        } else if (keyPress.type === "keyup") {

            keyboardCharactersDown[key] = 0;

            for (let i = 0; i < channels.length; i++) {
                let dmxChannel = channels[i];
                keysDown[dmxChannel] -= 1;

                console.log("up", keysDown);
                // only turn off light if all keys associated with that channel are up
                if (keysDown[dmxChannel] === 0) {
                    console.log("turning off", dmxChannel);
                    channelData[dmxChannel] = 0; // turn off channels
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

/* Features to add
 * automatic/manual key to channel mapping
 * ripple effect when some keys are pressed
 * fade effect when keys are pressed
 * select which DMX channels are being used
 */

function allOn() {
    parent.universe.updateAll(255);
}

function allOff() {
    parent.universe.updateAll(0);
    keysDown = {};
    navigator.close(); // This will close MIDI inputs, otherwise Node.js will wait for MIDI input forever.
}

