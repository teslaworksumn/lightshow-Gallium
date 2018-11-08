

/* Fading setup */
let isFading = false;
let currentFade = 0;
const fadeDuration = 5000;
const fadeInterval = 50;
let fadeChange = 255.0 * fadeInterval / fadeDuration;

// Returns the value for the element with the given id, parsed as an int.
// If failed to parse or find, returns default value
function getIntFromElementById(id, defaultVal) {
    const val = parseInt(document.getElementById(id).value, 10);

    if (Number.isNaN(val)) {
        alert(`Hey, ${val} isn't an int! (${id})`);
        return defaultVal;
    }

    return val;
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

// Sets up all of the button.onclick methods for the DMX page
function setupButtons() {
    /* Single channels */

    document.getElementById('channelOn').onclick = function channelOn() {
        const channel = getIntFromElementById('singleChannel', -1);
        if (channel !== -1) {
            setChannel(channel, 255);
        }
    };
    document.getElementById('channelOff').onclick = function channelOff() {
        const channel = getIntFromElementById('singleChannel', -1);
        if (channel !== -1) {
            setChannel(channel, 0);
        }
    };

    /* Range of channels */

    document.getElementById('rangeOn').onclick = function rangeOn() {
        const start = getIntFromElementById('rangeStart', -1);
        if (start === -1) return;

        const end = getIntFromElementById('rangeEnd', -1);
        if (end === -1) return;

        setRange(start, end, 255);
    };
    document.getElementById('rangeOff').onclick = function rangeOff() {
        const start = getIntFromElementById('rangeStart', -1);
        if (start === -1) return;

        const end = getIntFromElementById('rangeEnd', -1);
        if (end === -1) return;

        setRange(start, end, 0);
    };

    /* Box */

    document.getElementById('boxOn').onclick = function boxOn() {
        const boxIdx = getIntFromElementById('boxNumber', -1);
        if (boxIdx === -1) return;

        const startIdx = boxIdx * 16;
        const endIdx = startIdx + 15;
        setRange(startIdx, endIdx, 255);
    };

    document.getElementById('boxOff').onclick = function boxOff() {
        const boxIdx = getIntFromElementById('boxNumber', -1);
        if (boxIdx === -1) return;

        const startIdx = boxIdx * 16;
        const endIdx = startIdx + 15;
        setRange(startIdx, endIdx, 0);
    };

    /* All channels */

    document.getElementById('allOn').onclick = function allOn() { setAll(255); };
    document.getElementById('allOff').onclick = function allOff() { setAll(0); };
    document.getElementById('fadeOn').onclick = function fadeOn() {
        // Reset and enable fade
        currentFade = 0;
        isFading = true;
    };
    document.getElementById('fadeOff').onclick = function fadeOff() {
        // Reset and disable fade
        currentFade = 0;
        isFading = false;
    };
}

// Sets up the page
function setupDmxPage() {
    setInterval(updateFade, fadeInterval);
    setupButtons();
}

setupDmxPage();
