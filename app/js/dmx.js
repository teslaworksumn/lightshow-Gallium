const DMX = parent.require('dmx');

/* Fading setup */
let isFading = false;
let currentFade = 0;
const fadeDuration = 5000;
const fadeInterval = 50;
let fadeChange = 255.0 * fadeInterval / fadeDuration;

// Limits
const MAX_CHANNEL = 512; // Inclusive

// Returns the value for the element with the given id, parsed as an int.
// If failed to parse or find, returns default value
function getIntFromElementById(id, defaultVal) {
    const element = document.getElementById(id);
    const val = parseInt(element.value, 10);

    // Check for invalid input (non-integers). The equality check catches floats
    if (Number.isNaN(val) || val !== Number(element.value)) {
        // Fail by passing the default value back. It will be handled by the caller
        return defaultVal;
    }

    return val;
}

// Sets all channels to be on or off
// value is an int in range [0, 255]
function setAll(value) {
    parent.parent.universe.updateAll(value);
}

// Updates the current fade amount. Only changes if isFading is set
function updateFade() {
    if (isFading) {
        currentFade += fadeChange;

        if (currentFade < 0) {
            currentFade = 0;
            fadeChange = -fadeChange;
        }
        if (currentFade > 255) {
            currentFade = 255;
            fadeChange = -fadeChange;
        }

        // Divide by 1 to make it an int
        setAll(parseInt(currentFade, 10));
    }
}

// Sets the background color for an element with the given id
function setBackground(id, color) {
    document.getElementById(id).style.backgroundColor = color;
}

function setRange(channelStart, channelEnd, value) {
    const channels = {};
    for (let i = channelStart; i <= channelEnd; i += 1) {
        // DMX is 1-indexed. This should be the only place where the +1 is added
        channels[i] = value;
    }
    parent.parent.universe.update(channels);
}


// Sets a DMX channel to be on or off
// Channel is an int, value is an int in range [0, 255]
// Channels are 0-indexed
function setChannel(channel, value) {
    setRange(channel, channel, value);
}

// Sets a range of DMX channels to the given value
function setChannelRange(value) {
    const start = getIntFromElementById('rangeStart', -1);

    if (start < 1 || start > MAX_CHANNEL) {
        setBackground('rangeStart', 'red');
        return;
    }

    const end = getIntFromElementById('rangeEnd', -1);
    if (end < 1 || end > MAX_CHANNEL) {
        setBackground('rangeEnd', 'red');
        return;
    }

    if (end < start) {
        setBackground('rangeStart', 'red');
        setBackground('rangeEnd', 'red');
        return;
    }

    setRange(start, end, value);
}

// Sets a single DMX channel to the given value
function setSingleChannel(value) {
    const channel = getIntFromElementById('singleChannel', -1);
    if (channel < 1 || channel > MAX_CHANNEL) {
        setBackground('singleChannel', 'red');
        return;
    }

    setChannel(channel, value);
}


// Sets the channels in a box to the given value
function setBox(value) {
    const boxIdx = getIntFromElementById('boxNumber', -1);
    if (boxIdx < 0 || boxIdx > MAX_CHANNEL) {
        setBackground('boxNumber', 'red');
        return;
    }

    const startIdx = boxIdx * 16;
    const endIdx = startIdx + 15;
    setRange(startIdx, endIdx, value);
}

// Sets whether we are fading or not
function setFade(newIsFading) {
    // Reset and enable fade
    currentFade = 0;
    isFading = newIsFading;
}

// Handles when a text input's value changes
function onInputChange(id) {
    // If the user starts typing in a text box, reset the background from red to white
    setBackground(id, 'white');
}

// Sets up all of the button hooks for the DMX page
function setupButtons() {
    /* Clicking */

    // Single channels
    document.getElementById('channelOn').onclick = function channelOn() { setSingleChannel(255); };
    document.getElementById('channelOff').onclick = function channelOff() { setSingleChannel(0); };

    // Range of channels
    document.getElementById('rangeOn').onclick = function rangeOn() { setChannelRange(255); };
    document.getElementById('rangeOff').onclick = function rangeOff() { setChannelRange(0); };

    // Box
    document.getElementById('boxOn').onclick = function boxOn() { setBox(255); };
    document.getElementById('boxOff').onclick = function boxOff() { setBox(0); };

    // All channels
    document.getElementById('allOn').onclick = function allOn() { setAll(255); };
    document.getElementById('allOff').onclick = function allOff() { setAll(0); };

    document.getElementById('fadeOn').onclick = function fadeOn() { setFade(true); };
    document.getElementById('fadeOff').onclick = function fadeOff() { setFade(false); };

    /* Changing inputs */

    document.getElementById('singleChannel').oninput = function singleChannelOnChange() { onInputChange('singleChannel'); };
    document.getElementById('rangeStart').oninput = function rangeStartOnChange() { onInputChange('rangeStart'); };
    document.getElementById('rangeEnd').oninput = function rangeEndOnChange() { onInputChange('rangeEnd'); };
    document.getElementById('boxNumber').oninput = function boxNumberOnChange() { onInputChange('boxNumber'); };
}

// Sets up the page
function setupDmxPage() {
    setInterval(updateFade, fadeInterval);
    setupButtons();
}

setupDmxPage();
