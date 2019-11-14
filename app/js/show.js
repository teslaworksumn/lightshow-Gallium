const table = document.getElementById('tableBody');
table.value = [];
const playButton = document.getElementById('runShow');
const addElementButton = document.getElementById('addElement');
const ShowElementConstructor = parent.require('./js/showElement.js');
const url = parent.require('url');
let showElements = [];

const { remote } = parent.require('electron');

const { ipcMain } = parent.require('electron').remote;

function getShowDataPath() {
    // directory of the current show contained in the iframe.value attribute
    const showDir = window.parent.document.getElementById('frame').value;

    return path.join(showDir, 'show.json');
}

function getShowData() {
    const showDataPath = getShowDataPath();

    // the json file containing the playlist of the show
    return JSON.parse(fse.readFileSync(showDataPath));
}

// Return the array of playlist elements found in the current show's metadata
// file 'show.json'
function getUpdatedPlaylistElements() {
    return getShowData().Playlist;
}

// Returns an HTML button that, upon being clicked, will remove the row from
// the table of show elements and will remove the element from the show's
// metadata and deletes the element's sequence data off disk, completely
// removing all traces of the element from the show
function makeDeleteButton() {
    const deleteRowButton = document.createElement('button');

    deleteRowButton.innerText = 'X';

    // deletes the row the button is in from the table
    deleteRowButton.addEventListener('click', (event) => {
        // event.target will be the input element.
        const td = event.target.parentNode;
        const tr = td.parentNode; // the row to be removed

        const path = tr.getAttribute('sequencePath');

        // remove the sequence from the show's playlist object
        const playlist = getUpdatedPlaylistElements();
        const index = playlist.indexOf(path);
        playlist.splice(index, 1);

        const showData = getShowData();
        showData.Playlist = playlist;

        const showDataPath = getShowDataPath();

        // write the updated playlist back to disk
        fse.writeFileSync(showDataPath, JSON.stringify(showData, null, 2));

        // remove the sequence data file from disk
        fse.remove(path);

        tr.parentNode.removeChild(tr);
    });

    return deleteRowButton;
}

// Create and return a checkbox that will grey out a row in the table that the
// checkbox is in if it is checked
function makeCheckbox() {
    const checkbox = document.createElement('input');
    checkbox.type  = 'checkbox';

    // Default should play checkboxes to true. If an element should not be
    // played, the box should be unchecked.
    checkbox.checked = true;

    // grey out a row if the show play checkbox is not checked
    checkbox.addEventListener('change', (event) => {
        const row = event.target.parentNode.parentNode;
        if (event.target.checked) {
            row.classList.remove('greyout');
        } else {
            row.classList.add('greyout');
        }
    });

    return checkbox;
}

// Create and return a table cell containing a checkbox
function makeShouldPlayCol() {
    const shouldPlay = document.createElement('td');
    const checkbox = makeCheckbox();

    shouldPlay.appendChild(checkbox);

    return shouldPlay;
}

function makeEditRowCol() {
    const col = document.createElement('td');
    const deleteButton = makeDeleteButton();

    col.appendChild(deleteButton);

    return col;
}

// Create a return a table cell containing the basename of the given filepath
// argument
function makeCellWithText(filepath) {
    const cell = document.createElement('td');

    if (filepath) {
        const filename = path.basename(filepath);
        cell.innerText = filename;
    }

    return cell;
}

function makeRow(sequencePath, audioPath) {
    const row        = document.createElement('tr');
    const shouldPlay = makeShouldPlayCol();
    const sequence   = makeCellWithText(sequencePath);
    const audio      = makeCellWithText(audioPath);
    const editCol    = makeEditRowCol();

    row.appendChild(shouldPlay);
    row.appendChild(sequence);
    row.appendChild(audio);
    row.appendChild(editCol);

    return row;
}

function makeInitialTable() {
    const playlistElements = getUpdatedPlaylistElements();

    // push all playlist items (and associated audio if applicable)
    // names onto table to be rendered for each show
    for (let i = 0; i < playlistElements.length; i += 1) {
        const sequencePath = playlistElements[i];
        const sequence = JSON.parse(fse.readFileSync(sequencePath));

        const name = sequence.Name;
        const audioPath = sequence['Audio File'];

        let row;

        // if the show element is just an audio file, only populate the audio
        // column in the table
        if (audioPath && name === path.basename(audioPath)) {
            row = makeRow(null, audioPath);
        } else {
            row = makeRow(name, audioPath);
        }

        row.setAttribute('sequencePath', sequencePath);

        table.appendChild(row);
    }
}

function stopAllShowElements() {
    for (let j = 0; j < showElements.length; j += 1) {
        stopPlaying(showElements[j]);
    }
}

function openModal() {
    let win = new remote.BrowserWindow({
        parent: remote.getCurrentWindow(),
        modal: true,
        height: 400,
        width: 800,
        frame: false,
    });

    const currentDir = path.resolve();

    const modalHtml = url.format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(currentDir, 'app/html/addElement.html'),
    });

    win.setMenu(null); // remove menu bar

    win.loadURL(modalHtml);

    win.on('closed', () => {
        win = null;
    });
}

ipcMain.on('newElement', (event, arg) => {
    const currentShowPath = iframe.value;

    if (arg.type === 'csv') {
        const sequencePath = arg.sequencePath;
        const audioPath = arg.audioPath;
        const timeFrameLength = arg.timeFrameLength;

        const row = makeRow(sequencePath, audioPath);

        const sequenceJsonPath = createSequenceJson(sequencePath,
            audioPath,
            timeFrameLength,
            currentShowPath);
        row.setAttribute('sequencePath', sequenceJsonPath);

        table.appendChild(row);
    } else if (arg.type === 'tim') {
        const sequencePath = arg.sequencePath;
        const audioPath = arg.audioPath;
        const timeFrameLength = arg.timeFrameLength;
        const subTimFiles = JSON.parse(arg.subTimFiles);

        // TODO add support for adding tim files
        // If subfiles are specified, they will have to be combined into the
        // large tim file specified. Add support for creating the large tim
        // file if one does not already exist.  Once the sub tim files are
        // combined, they will need to be converted to csv with the tim
        // combination logic.
        //
        // Something like create sequenceJsonFromTim(put the args here)
        // Then append it to the table with
        // const row = makeRow(sequencePath, audioPath);
        // table.appendChild(row);
    } else if (arg.type === 'audio') {
        const audioPath = arg.audioPath;

        const row = makeRow(null, audioPath);

        const sequenceJsonPath = createSequenceJsonAudioOnly(audioPath, currentShowPath);
        row.setAttribute('sequencePath', sequenceJsonPath);

        table.appendChild(row);
    } else {
        // error: received unsupported type
    }
});

playButton.onclick = async function () {
    // value property contains the boolean isPlaying
    if (playButton.value === 'notPlaying') {
        playButton.innerText = 'Stop';
        playButton.value = 'playing';
        playButton.style.backgroundColor = 'red';
        playButton.style.borderColor = 'red';
        // create show elements with sequence json path
        showElements = [];

        const playlistElements = getUpdatedPlaylistElements();

        for (let i = 0; i < table.rows.length; i += 1) {
            // only add this row to be played if the should play checkbox is checked
            if (!table.rows[i].cells[0].children[0].checked) {
                // eslint-disable-next-line no-continue
                continue;
            }

            const showElement = new ShowElementConstructor();
            showElement.setSequenceJson(playlistElements[i]);

            // TODO make this a promise or something, so we can set up all asyncronously
            // eslint-disable-next-line no-await-in-loop
            const duration = await showElement.setUpSequence();
            showElement.setElementLength(duration * 1000);

            showElements.push(showElement);
        }

        startCanPlay(); // lock to determine ability to play
        playShow(showElements);
    } else {
        playButton.innerText = 'Play';
        playButton.value = 'notPlaying';
        playButton.style.backgroundColor = 'green';
        playButton.style.borderColor = 'green';
        stopCanPlay(); // lock to stop play of show
        stopAllShowElements();
    }
};

addElementButton.onclick = function () {
    const row         = document.createElement('tr');
    const elementName = document.createElement('td');
    const shouldPlay  = document.createElement('td');

    openModal();
};

window.parent.document.getElementById('frame').onload = stopAllShowElements;

makeInitialTable();
