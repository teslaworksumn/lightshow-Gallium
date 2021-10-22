const navigator = parent.require('web-midi-api');
const DMX = parent.require('dmx');
const fs = parent.require('fs');

const KEY_PRESSED = '90';
const KEY_RELEASED = '80';

const INVALID = -1;
const NUM_KEYS = 12; // keys in an octave

const ON_OFF = 0;
const FADE = 1;
const PULSE = 2;
const CHASE = 3;

let midi;
let inputs;
let outputs;
let midiPort;

// constants used to help determine which stage of setting up the page is on
const FINISHED = 4;

let firstNote = -1;
let secondNote = -2;

// used to determine if the midi inputs are for setting up the keyboard or are
// regular presses
const settingUpCount = 0;
let isSettingUp = true;

let numChannels = INVALID;
let keysDown = {};

// dictionary containing channel mappings
// key: keyboard note
// value: array of DMX channel numbers
let mapping = {};

const keyboardCharactersDown = {};

const select = document.getElementById('midiSelect');
const refresh = document.getElementById('midiRefresh');
const setMidi = document.getElementById('midiSet');
const midiName = document.getElementById('selectedMidiController');
const setChannelCount = document.getElementById('setChannelCount');
const midiControl = document.getElementById('midiControl');
const keyboardControl = document.getElementById('keyboardControl');
const useMidi = document.getElementById('useMidi');
const useKeyboard = document.getElementById('useKeyboard');

function addMidiDevicesToSelect(allInputs) {
    // clear list of options before generating new ones
    while (select.childNodes.length > 0) {
        select.removeChild(select.lastChild);
    }

    allInputs.forEach((port) => {
        const option = document.createElement('option');
        option.value = port.id;
        option.innerText = port.name;

        select.appendChild(option);
    });
}

function onMIDISuccess(midiAccess) {
    midi = midiAccess;
    inputs = midi.inputs;
    outputs = midi.outputs;
    addMidiDevicesToSelect(inputs);
}

function onMIDIFailure(msg) {
    process.exit(1);
}

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

// Function that takes in a midi note number and converts it to a string
// representing the note name
function getNoteLetterFromMidi(midiNote) {
    const note = midiNote % NUM_KEYS;

    if (note === 0) {
        return 'C';
    } if (note === 1) {
        return 'C# / Db';
    } if (note === 2) {
        return 'D';
    } if (note === 3) {
        return 'D# / Eb';
    } if (note === 4) {
        return 'E';
    } if (note === 5) {
        return 'F';
    } if (note === 6) {
        return 'F# / Gb';
    } if (note === 7) {
        return 'G';
    } if (note === 8) {
        return 'G# / Ab';
    } if (note === 9) {
        return 'A';
    } if (note === 10) {
        return 'A# / Bb';
    } if (note === 11) {
        return 'B';
    }

    return 'Received MIDI note not in octave';
}

// Returns an HTML select element with lighting effects as options
function createEffectSelect() {
    const selectBox = document.createElement('select');

    const option1 = document.createElement('option');
    option1.value = ON_OFF;
    option1.innerText = 'on/off (standard)';
    selectBox.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = FADE;
    option2.innerText = 'fade';
    option2.setAttribute('disabled', ''); // TODO: make functional
    selectBox.appendChild(option2);

    const option3 = document.createElement('option');
    option3.value = PULSE;
    option3.innerText = 'pulse';
    option3.setAttribute('disabled', ''); // TODO: make functional
    selectBox.appendChild(option3);

    const option4 = document.createElement('option');
    option4.value = CHASE;
    option4.innerText = 'chase';
    option4.setAttribute('disabled', ''); // TODO: make functional
    selectBox.appendChild(option4);

    return selectBox;
}

function makeTableHeader() {
    const row = document.createElement('tr');
    const keyCol = document.createElement('td');
    const dmxCol = document.createElement('td');
    const effectCol = document.createElement('td');

    keyCol.innerText = 'Key';
    dmxCol.innerText = 'DMX Channels';
    effectCol.innerText = 'Effect';

    row.appendChild(keyCol);
    row.appendChild(dmxCol);
    row.appendChild(effectCol);

    return row;
}

function makeTableRow(type, note = null) {
    const row = document.createElement('tr');
    const keyCol = document.createElement('td');
    const dmxCol = document.createElement('td');
    const effectCol = document.createElement('td');

    if (type === 'midi') {
        keyCol.innerText = getNoteLetterFromMidi(note);
        keyCol.value = note; // value is MIDI note number
    } else if (type === 'keyboard') {
        const noteInput = document.createElement('input');
        noteInput.onkeypress = function () {
            noteInput.setAttribute('class', 'changed');
        };
        keyCol.appendChild(noteInput);
    }

    const channelInput = document.createElement('input');

    // visual indicator that the mapping hasn't been saved
    channelInput.onkeypress = function () {
        channelInput.setAttribute('class', 'changed');
    };
    dmxCol.appendChild(channelInput);

    const selectEffect = createEffectSelect();
    effectCol.appendChild(selectEffect);

    row.appendChild(keyCol);
    row.appendChild(dmxCol);
    row.appendChild(effectCol);

    return row;
}

// Returns an HTML table containing rows for every key between (inclusive)
// startNote and endNote
function createMappingTable(startNote, endNote, inputType) {
    const table = document.createElement('table');

    const headerRow = makeTableHeader();
    table.appendChild(headerRow);

    if (inputType === 'midi') {
        // i <= endNote includes all notes in the range
        for (let i = startNote; i <= endNote; i += 1) {
            const row = makeTableRow('midi', i);
            table.appendChild(row);
        }
    } else if (inputType === 'keyboard') {
        for (let i = 0; i < NUM_KEYS; i += 1) {
            const row = makeTableRow('keyboard');
            table.appendChild(row);
        }

        table.setAttribute('id', 'keyboardTable');
    }

    return table;
}

function showKeyboardTable() {
    const keyboardDiv = document.getElementById('keyboardControl');
    const table = createMappingTable(-1, -1, 'keyboard');

    // remove previous tables instead of adding to them
    const oldTable = keyboardDiv.querySelector('table');
    if (oldTable) {
        keyboardDiv.removeChild(oldTable);
    }

    keyboardDiv.appendChild(table);
}

function isNumber(value) {
    const integerValue = parseInt(value, 10);
    if (Number.isNaN(integerValue) || integerValue !== Number(integerValue)) {
        return false;
    }

    return true;
}

function mapChannelsKeyboard() {
    const table = document.getElementById('keyboardTable');
    const keys = [];
    const channels = [];

    // extract all rows with channels mapped and push to appropriate arrays
    // start at index 1 to skip header row
    for (let i = 1; i < table.rows.length; i += 1) {
        const row = table.rows[i];
        const keyCol = row.cells[0];
        const keyInput = keyCol.children[0];
        const key = keyInput.value;

        // only add if there is some input for keyboard character
        if (key) {
            keys.push(key);
        }

        // second column is text box with key that is being mapped
        const channelCol = row.cells[1];
        const channelInput = channelCol.children[0];

        // first child is text box with CSV separated DMX channels
        let channelInputs = channelInput.value;

        // only add if there is some input for channel list
        if (channelInputs) {
            channelInputs = channelInputs.split(/,/);
            const dmxChannels = [];
            for (let a = 0; a < channelInputs.length; a += 1) {
                if (isNumber(channelInputs[a]) && key) {
                    dmxChannels.push(parseInt(channelInputs[a], 10));
                    keyInput.setAttribute('class', 'set');
                    channelInput.setAttribute('class', 'set');
                } else {
                    channelInput.setAttribute('class', 'invalid');
                }
            }

            channels.push(dmxChannels);
        }
    }

    // assign array of inputted channels to each keyboard character
    for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i]; // keyboard character
        mapping[key] = channels[i];
    }

    // initialize DMX channel keys in keysDown
    for (let i = 0; i < channels.length; i += 1) {
        for (let j = 0; j < channels[i].length; j += 1) {
            const channel = channels[i][j];
            keysDown[channel] = 0;
        }
    }
}

// add a row to the keyboard table, allowing for another input key
function addKeyboardKey() {
    const table = document.getElementById('keyboardTable');
    const row = makeTableRow('keyboard');
    table.appendChild(row);
}

refresh.onclick = function refreshMidiDevices() {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
};

// Helper function to show an element on the screen
// if id is a string, use it to find the element in the DOM and show it
// else, it is the object itself and can just show it immediately
function showElement(id) {
    if (typeof id === 'string') {
        const element = document.getElementById(id);
        if (element) {
            element.removeAttribute('class');
        }
    } else if (id) {
        id.removeAttribute('class');
    }
}

// Helper function to remove an element from the screen
// if id is a string, use it to find the element in the DOM and hide it
// else, it is the object itself and can just hide it immediately
function hideElement(id) {
    if (typeof id === 'string') {
        const element = document.getElementById(id);
        if (element) {
            element.setAttribute('class', 'invisible');
        }
    } else if (id) {
        id.setAttribute('class', 'invisible');
    }
}

function showMidiTable(low, high) {
    const manualDiv = document.getElementById('mapManual');
    const table = createMappingTable(low, high, 'midi');
    table.setAttribute('id', 'manualTable');

    // if an old table exists, remove it before adding the new one
    const oldTable = manualDiv.querySelector('table');
    if (oldTable) {
        manualDiv.removeChild(oldTable);
    }

    manualDiv.appendChild(table);
    showElement(manualDiv);
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// takes MIDI input data and turns on lights accordingly
function midiToDmx(data) {
    const action = data[0].toString(16);
    let key = data[1]; // returns number from 0-11 to index into the mapping dictionary
    const brightness = data[2] * 2; // multiply by 2 to get 0-255 values

    if (isSettingUp) {
        // only do something on key presses
        if (action === KEY_PRESSED) {
            if (firstNote === -1 && secondNote === -2) {
                firstNote = data[1]; // get raw MIDI note number
                const lowPrompt = document.getElementById('promptLowNote');
                lowPrompt.innerText += ' Success!';

                showElement('promptHighNote');
            } else if (secondNote === -2) {
                secondNote = data[1]; // get raw MIDI note number

                hideElement('prompts');

                // reverse low note and high note if they were entered backwards
                if (firstNote > secondNote) {
                    const temp = firstNote;
                    firstNote = secondNote;
                    secondNote = temp;
                }

                showMidiTable(firstNote, secondNote);
            }
        } else if (action === KEY_RELEASED && firstNote > 0 && secondNote > 0) {
            if (isSettingUp) {
                isSettingUp = false;
            }
        }
    } else {
        // ensure that key is in the range of keys being mapped
        // otherwise, increase/decrease key until it falls in that range
        if (key < firstNote) {
            while (key < firstNote) {
                key += NUM_KEYS;
            }
        }
        if (key > secondNote) {
            while (key > secondNote) {
                key -= NUM_KEYS;
            }
        }

        // mapping is looked up and returned based on previous mapping calculation
        const channels = mapping[key];

        // if the selected range is less than an octave, some keys aren't going to be mapped
        // this gets rid of the error from attempting to access the length of something that
        // doesn't exist
        if (secondNote - firstNote < NUM_KEYS - 1) {
            if (!channels) {
                return;
            }
        }

        const channelData = {};
        for (let i = 0; i < channels.length; i += 1) {
            const dmxChannel = channels[i];
            channelData[dmxChannel] = brightness;
        }

        // ensures that a proper value for total DMX channels has been set
        if (!isEmpty(keysDown)) {
            if (action === KEY_PRESSED) {
                parent.universe.update(channelData);
                for (let i = 0; i < channels.length; i += 1) {
                    const dmxChannel = channels[i];
                    keysDown[dmxChannel] += 1;
                }
            } else if (action === KEY_RELEASED) {
                for (let i = 0; i < channels.length; i += 1) {
                    const dmxChannel = channels[i];
                    channelData[dmxChannel] = 0; // turn off channels
                    keysDown[dmxChannel] -= 1;

                    // only turn off light if all keys associated with that channel are up
                    if (keysDown[dmxChannel] === 0) {
                        parent.universe.update(channelData);
                    }
                }
            }
        }
    }
}

function onMidiIn(ev) {
    midiToDmx(ev.data);
}

setMidi.onclick = function setMidiDevice() {
    const midiSelection = select.value;

    inputs.forEach((port) => {
        if (midiSelection === port.id) {
            midiName.innerText = port.name;
            port.onmidimessage = onMidiIn; // eslint-disable-line no-param-reassign
        }
    });
};

function resetPrompts() {
    const lowPrompt = document.getElementById('promptLowNote');
    lowPrompt.innerText = lowPrompt.innerText.replace(' Success!', '');

    firstNote = -1;
    secondNote = -2;
}

function setupAutoMap() {
    showElement('mapAuto');
    hideElement('mapManual');
    hideElement('manualType');
    hideElement('prompts');

    isSettingUp = false;
    resetPrompts();

    // one octave of keys
    firstNote = 60;
    secondNote = 71;
}

function setupManualMap() {
    resetPrompts();
    showElement('manualType');
    hideElement('mapAuto');
    isSettingUp = true;
}

// shows a table with notes from C to B
function showOneOctaveTable() {
    const C4 = 60;
    const B4 = 71;

    showMidiTable(C4, B4);
}

function setupOneOctave() {
    showOneOctaveTable();
    isSettingUp = false; // no prompting notes needed for this selection

    // the one octave that is being used
    firstNote = 60;
    secondNote = 71;

    hideElement(keyboardControl);
    hideElement('prompts');
    hideElement('mapAuto');
}

function setupKeyRange() {
    resetPrompts();
    hideElement(keyboardControl);
    hideElement('mapAuto');
    hideElement('mapManual');

    showElement('prompts');
    isSettingUp = true;
}

// Maps every key to 1 DMX channel
// DMX channels may repeat so that every key has exactly 1 channel of DMX output
function mapChannelsAuto() {
    let emptyChannels = document.getElementById('autoEmptyChannels').value;
    const label = document.getElementById('autoErrorText');
    emptyChannels = emptyChannels.split(/,/);

    const validChannels = [];

    // reset mapping when switching between mapping types
    mapping = {};

    for (let i = 0; i < emptyChannels.length; i += 1) {
        if (!isNumber(emptyChannels[i])) {
            if (emptyChannels[i] === '') {
                break;
            }
            label.innerText = 'Invalid number entered.  Ensure only integers and commas are entered';

            return;
        }

        emptyChannels[i] = parseInt(emptyChannels[i], 10);
    }

    label.innerText = '';

    if (numChannels === INVALID) {
        label.innerText = 'Enter a valid number of DMX channels and try again';
    } else {
        // create an array consisting of the lowest channel numbers that haven't been excluded
        // need numChannels number of valid channels
        let totalChannels = 0;
        let currentChannelNum = 1; // DMX is 1-indexed
        while (totalChannels < numChannels) {
            if (emptyChannels.includes(currentChannelNum)) {
                currentChannelNum += 1;
            } else {
                validChannels.push(currentChannelNum);
                totalChannels += 1;
                currentChannelNum += 1;
                if (totalChannels === numChannels) {
                    alert('Successful Channel Mapping');
                }
            }
        }

        // add the DMX channel for a key to a mapping
        // DMX channels can repeat
        for (let i = firstNote; i <= secondNote; i += 1) {
            mapping[i] = [validChannels[i % numChannels]];
            mapping[i].effect = ON_OFF;
        }
    }

    // ensure the object counting each key down keeps track of the channels that are mapped
    for (let i = 0; i < validChannels.length; i += 1) {
        keysDown[validChannels[i]] = 0;
    }
}

function mapChannelsManual() {
    const table = document.getElementById('manualTable');

    // reset mapping when changing mapping type
    mapping = {};

    // start at index 1 to skip header row
    for (let i = 1; i < table.rows.length; i += 1) {
        const row = table.rows[i];
        const noteNameCell = row.cells[0];
        const note = noteNameCell.value;

        const dmxCol = row.cells[1];
        const dmxInput = dmxCol.children[0];
        let channels = dmxInput.value; // channel input
        channels = channels.split(/,/);
        for (let j = 0; j < channels.length; j += 1) {
            if (isNumber(channels[j])) {
                channels[j] = parseInt(channels[j], 10);
                dmxInput.setAttribute('class', 'set');
            }
        }

        mapping[note] = channels;

        const effectCol = row.cells[2];
        const effect = effectCol.children[0].value;
        mapping[note].effect = effect;
    }

    // sets up keysDown
    // for every MIDI note
    for (let i = firstNote; i <= secondNote; i += 1) {
        const dmxChannels = mapping[i];
        for (let j = 0; j < dmxChannels.length; j += 1) {
            keysDown[dmxChannels[j]] = 0;
        }
    }
}

setChannelCount.onclick = function setNumChannels() {
    numChannels = document.getElementById('numChannels').value;
    numChannels = parseInt(numChannels, 10);
    const channelInt = parseInt(numChannels, 10);

    // ensures the value entered is a number
    if (!isNumber(channelInt)) {
        document.getElementById('textNumChannels').innerText = 'invalid number';
        numChannels = INVALID;
    } else {
        document.getElementById('textNumChannels').innerText = channelInt;
    }
};

function stopOutputs() {
    outputs.forEach((port) => {
        port.send([0x80, 60, 0]);
    });
    testInputs();
}

function keyboardToDmx(keyPress) {
    const key = keyPress.key; // keyboard character typed
    const channels = mapping[key];
    const channelData = {};

    // if a mapping for the key exists
    if (channels) {
        for (let i = 0; i < channels.length; i += 1) {
            const dmxChannel = channels[i];

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

    if (!isEmpty(keysDown)) {
        // only update if the key isn't already down
        if (keyPress.type === 'keydown' && keyboardCharactersDown[key] === 0) {
            parent.universe.update(channelData);

            keyboardCharactersDown[key] = 1;

            for (let i = 0; i < channels.length; i += 1) {
                const dmxChannel = channels[i];
                keysDown[dmxChannel] += 1;
            }
        } else if (keyPress.type === 'keyup') {
            keyboardCharactersDown[key] = 0;

            for (let i = 0; i < channels.length; i += 1) {
                const dmxChannel = channels[i];
                keysDown[dmxChannel] -= 1;

                // only turn off light if all keys associated with that channel are up
                if (keysDown[dmxChannel] === 0) {
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

function allOn() {
    parent.universe.updateAll(255);
}

function allOff() {
    parent.universe.updateAll(0);
    keysDown = {};
}

// Set GUI elements based on the type of input
useMidi.onclick = function showMidiControl() {
    showElement(midiControl);
    hideElement(keyboardControl);

    // only listen for keypress events when the keyboard input option is chosen
    document.removeEventListener('keydown', keyboardToDmx);
    document.removeEventListener('keyup', keyboardToDmx);
};

useKeyboard.onclick = function showMidiControl() {
    showElement(keyboardControl);
    hideElement(midiControl);

    showKeyboardTable();

    // captures when keys are pressed
    document.addEventListener('keydown', keyboardToDmx);
    document.addEventListener('keyup', keyboardToDmx);
};
