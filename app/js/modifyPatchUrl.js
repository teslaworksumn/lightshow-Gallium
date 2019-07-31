// const fse = parent.require('fs-extra');
// const path = parent.require('path');

const editButton = document.getElementById('editUrl');
const saveButton = document.getElementById('saveUrl');
const cancelButton = document.getElementById('cancelUrl');
const display = document.getElementById('patchingUrlDisplay');
const input = document.getElementById('patchingUrlInput');

// anonymous namespace
{

// show settings file
const showPath = iframe.value;
const settingsFile = path.join(showPath, 'show.json');

let url = '';

// Make the url editible. Put the text into an input box where a new value can
// be typed in. Show the appropriate buttons
editButton.addEventListener('click', () => {
    display.classList.add('invisible');

    input.value = url;
    input.classList.remove('invisible');

    editButton.classList.add('invisible');
    saveButton.classList.remove('invisible');
    cancelButton.classList.remove('invisible');
});

// Get the text value out of the input and save it to the settings file
saveButton.addEventListener('click', () => {
    const data = JSON.parse(fse.readFileSync(settingsFile));
    data['GoogleScriptUrl'] = input.value;

    fse.writeFileSync(settingsFile, JSON.stringify(data, null, 2));

    refreshUrl();
    showDisplay();
});

// Remove the text input box and restore the value of the previous url. Does
// not save any input
cancelButton.addEventListener('click', () => {
    refreshUrl();
    showDisplay();
});

// Ensure the displayed url value is up-to-date with the value in the settings
// file
function refreshUrl() {
    // parse JSON data out of config file
    const data = JSON.parse(fse.readFileSync(settingsFile));
    url = data['GoogleScriptUrl'];

    display.innerText = url;
}

// Show the elements that are necessary for displaying a show's url. Only
// certain buttons should be shown
function showDisplay() {
    display.classList.remove('invisible');
    input.classList.add('invisible');

    editButton.classList.remove('invisible');
    saveButton.classList.add('invisible');
    cancelButton.classList.add('invisible');
}

// set the displayed value when the page is loaded
refreshUrl();

} // anonymous namespace
