const table = document.getElementById('tableBody');
table.value = [];
const playButton = document.getElementById('runShow');
const ShowElementConstructor = parent.require('./js/showElement.js');
let showElements = [];


// directory of the current show contained in the iframe.value attribute
const showDir = window.parent.document.getElementById('frame').value;
const showDataPath = path.join(showDir, 'show.json');

// the json file containing the playlist of the show
const showData = JSON.parse(fse.readFileSync(showDataPath));

const playlistElements = showData.Playlist;

// push all playlist items (and associated audio if applicable)
// names onto table to be rendered for each show
for (let i = 0; i < playlistElements.length; i += 1) {
    let filename = playlistElements[i].split(path.sep);
    filename = filename[filename.length - 1];

    const tableItem = document.createElement('tr');
    elementName = document.createElement('td');
    elementName.innerText = filename;

    tableItem.appendChild(elementName);

    const sequencePath = path.join(showDir, filename);
    const sequence = JSON.parse(fse.readFileSync(sequencePath));
    let audioPath = sequence['Audio File'];
    table.value.push(sequencePath);
    // value will contain an array of file paths for each element in the show

    // only add audio filename if there is associated audio
    if (audioPath) {
        audioPath = audioPath.split(path.sep);
        audioPath = audioPath[audioPath.length - 1];

        audioColumn = document.createElement('td');
        audioColumn.innerText = audioPath;
        tableItem.appendChild(audioColumn);
    }

    table.appendChild(tableItem);
}

function stopAllShowElements() {
    for (let j = 0; j < showElements.length; j += 1) {
        stopPlaying(showElements[j]);
    }
}

playButton.onclick = async function () {
    // value property contains the boolean isPlaying
    if (playButton.value === 'notPlaying') {
        playButton.innerText = 'Stop';
        playButton.value = 'playing';
        playButton.style.backgroundColor = 'red';
        playButton.style.borderColor = 'red';
        // create show elements with sequence json path
        showElements = [];
        for (let k = 0; k < table.rows.length; k += 1) {
            showElements.push(new ShowElementConstructor());
            showElements[k].setSequenceJson(table.value[k]);
            // TODO make this a promise or something, so we can set up all asyncronously
            // eslint-disable-next-line no-await-in-loop
            const duration = await showElements[k].setUpSequence();
            showElements[k].setElementLength(duration * 1000);
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
window.parent.document.getElementById('frame').onload = stopAllShowElements;
