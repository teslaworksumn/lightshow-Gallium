const remote = require('electron').remote;
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;

const path = parent.require('path');

const cancelButton = document.getElementById('cancelButton');
const addElement = document.getElementById('chooseFirstFile');
const test = document.getElementById('ok');
const submitButton = document.getElementById('submitButton');

const form = document.querySelector('form');

const audioExtensions = ['mp3', 'wav', 'flac', 'ogg'];
const sequenceExtensions = ['csv', 'tim'];

function clearVariableContent() {
    // clear contents that will be changed everytime the input changes
    document.getElementById('variableContent').innerHTML = '';
}

function makeCenteredDiv() {
    const div = document.createElement('div');
    div.classList.add('centeredDiv');

    return div;
}

function addAudioSelect(div) {
    const audioSelect = document.createElement('input');
    const audioSelectLabel = document.createElement('label');

    audioSelect.type = 'button';
    audioSelect.value = 'Choose Associated Audio File';
    audioSelect.id = 'audioSelect';

    audioSelect.addEventListener('click', () => {
        dialog.showOpenDialog({
            title: 'Choose an Audio File',
            filters: [
                { name: 'Audio', extensions: audioExtensions },
                { name: 'All Files', extensions: ['*'] },
            ],
        }, (fileNames) => {
            if (fileNames !== undefined) {
                const filename = path.basename(fileNames[0]);
                audioSelectLabel.innerText = filename;

                // adds the filepath chosen to the button as an attribute for
                // sending this information back to the parent window
                audioSelect.setAttribute('filepath', fileNames[0]);
            }
        });
    });

    const centeredDiv = makeCenteredDiv();
    centeredDiv.appendChild(audioSelect);
    centeredDiv.appendChild(audioSelectLabel);

    div.appendChild(centeredDiv);
}

// Returns a dropdown menu with an option for every one of the values in the
// array passed in as the parameter options. If the values passed in are
// numbers, the dropdown option values will be numbers and the text will be
// strings.
function makeTimeFrameLengthDropdown(options) {
    const dropdown = document.createElement('select');
    dropdown.id = 'timeFrameLength';

    for (const option of options) {
        const dropdownOption  = document.createElement('option');

        dropdownOption.value = option;
        dropdownOption.text = option.toString();

        dropdown.appendChild(dropdownOption);
    }

    return dropdown;
}

function handleCsvSequence() {
    const contentSpace = document.getElementById('variableContent');

    // create options for 25, 50, and 100 ms CSV inputs
    const timeFrameLengthInput = makeTimeFrameLengthDropdown([25, 50, 100]);

    const span = document.createElement('span');
    span.innerText = 'CSV Time Interval (ms):';

    const centeredDiv = makeCenteredDiv();
    centeredDiv.appendChild(span);
    centeredDiv.appendChild(timeFrameLengthInput);

    contentSpace.appendChild(centeredDiv);

    addAudioSelect(contentSpace);

    submitButton.disabled = false;
}

function addNewSubTimFileSelect(div) {
    const subTimSelect = document.createElement('input');
    subTimSelect.type = 'button';
    subTimSelect.value = 'Choose .tim file(s)';
    subTimSelect.id = 'subTimSelect';

    const subTimSelectLabel = document.createElement('label');

    subTimSelect.addEventListener('click', () => {
        dialog.showOpenDialog({
            title: 'Choose a .tim File',
            filters: [
                { name: '.tim', extensions: ['tim'] },
                { name: 'All Files', extensions: ['*'] },
            ],
            properties: ['multiSelections'],
        }, (fileNames) => {
            if (fileNames !== undefined) {
                const filepaths = [];
                for (const filepath of fileNames) {
                    const filename = path.basename(filepath);
                    subTimSelectLabel.innerText += `${filename}\n`;

                    filepaths.push(filepath);
                }

                // put the array into an HTML attribute, making sure to wrap
                // the filepaths in quotes
                subTimSelect.setAttribute('filepath', `[${filepaths.map(x => `"${x}"`)}]`);
            }
        });
    });

    const span = document.createElement('span');
    span.innerText = 'Choose one or more partial child .tim files:';

    const centeredDiv = makeCenteredDiv();
    centeredDiv.appendChild(span);
    centeredDiv.appendChild(subTimSelect);
    centeredDiv.appendChild(subTimSelectLabel);

    div.append(centeredDiv);
}

function handleTimSequence() {
    const contentSpace = document.getElementById('variableContent');

    // create options to create CSVs of 25 or 100 ms time intervals from the
    // .tim files
    const timeFrameLengthInput = makeTimeFrameLengthDropdown([25, 100]);

    const span = document.createElement('span');
    span.innerText = 'CSV Time Interval (ms):';

    const centeredDiv = makeCenteredDiv();
    centeredDiv.appendChild(span);
    centeredDiv.appendChild(timeFrameLengthInput);

    contentSpace.appendChild(centeredDiv);

    addAudioSelect(contentSpace);
    addNewSubTimFileSelect(contentSpace);

    submitButton.disabled = false;
}

function handleSequenceSelection(extension) {
    clearVariableContent();

    if (extension === 'csv') {
        handleCsvSequence();
    } else if (extension === 'tim') {
        handleTimSequence();
    } else {
        // somehow an extension got through that isn't supported
    }
}

function handleAudioSelection() {
    submitButton.disabled = false;
}

addElement.addEventListener('click', () => {
    // Allow selection of a sequence file or an audio file and based on the
    // extension of the file chosen, determine what options to show next to the
    // user.
    dialog.showOpenDialog({
        title: 'Choose an Audio or Sequence File',
        filters: [
            { name: 'Audio and Sequence', extensions: audioExtensions.concat(sequenceExtensions) },
            { name: 'Audio', extensions: audioExtensions },
            { name: 'Sequence', extensions: sequenceExtensions },
            { name: 'All Files', extensions: ['*'] },
        ],
    }, (fileNames) => {
        if (fileNames !== undefined) {
            const fullFilepath = fileNames[0].split(path.sep);

            const filename = path.basename(fileNames[0]);

            // get the extension and then remove the period at the beginning
            const extension = path.extname(filename).slice(1);

            const label = document.getElementById('initialElementLabel');

            if (sequenceExtensions.includes(extension)) {
                handleSequenceSelection(extension);
            } else if (audioExtensions.includes(extension)) {
                handleAudioSelection(extension);
            } else {
                // picked unsupported filename
                alert('You chose an unsupported file type.  Try again.');
                return;
            }

            // adds the filepath chosen to the button as an attribute for
            // sending this information back to the parent window
            addElement.setAttribute('filepath', fileNames[0]);

            label.innerText = filename;
        }
    });
});

form.addEventListener('submit', (e) => {
    // on form submission, prevent default
    e.preventDefault();

    // the first file determines which inputs are created and need to get values from
    // form.elements[0];
    const filepath = form.elements[0].getAttribute('filepath');
    const extension = path.extname(filepath);

    // object to send back to the main process full of all the information it
    // needs
    const newElement = {};

    if (extension === '.csv') {
        newElement.type = 'csv';
        newElement.sequencePath = filepath;
        newElement.timeFrameLength = document.getElementById('timeFrameLength').value;
        newElement.audioPath = document.getElementById('audioSelect').getAttribute('filepath');
    } else if (extension === '.tim') {
        newElement.type = 'tim';
        newElement.mainTimPath = filepath;

        newElement.timeFrameLength = document.getElementById('timeFrameLength').value;
        newElement.audioPath = document.getElementById('audioSelect').getAttribute('filepath');
        newElement.subTimFiles = document.getElementById('subTimSelect').getAttribute('filepath');
    } else if (audioExtensions.includes(extension.slice(1))) { // slice removes leading period
        newElement.type = 'audio';
        newElement.audioPath = filepath;
    } else {
        // picked unsupported filename
        return;
    }

    ipcRenderer.send('newElement', newElement);

    const window = remote.getCurrentWindow();
    window.close();
});


cancelButton.addEventListener('click', () => {
    const window = remote.getCurrentWindow();
    window.close();
});
