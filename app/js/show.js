const ShowRunnerConstructor = parent.require('./js/ShowRunner.js');
const ShowRunner = new ShowRunnerConstructor();

const table = document.getElementById('tableBody');
const playButton = document.getElementById('runShow');
const repeat = document.getElementById('repeatPlay');

// directory of the current show contained in the iframe.value attribute
const showDir = window.parent.document.getElementById('frame').value;
const showDataPath = path.join(showDir, 'show.json');

// the json file containing the playlist of the show
const showData = JSON.parse(fse.readFileSync(showDataPath));
const playlistElements = showData.Playlist;

// push all playlist items (and associated audio if applicable)
// names onto table to be rendered for each show
table.value = [];
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

playButton.onclick = async function () {
    ShowRunner.setupShowRunner(table.value);

    if (playButton.value === 'notPlaying') {
        playButton.innerText = 'Stop';
        playButton.value = 'playing';
        playButton.style.backgroundColor = 'red';
        playButton.style.borderColor = 'red';

        ShowRunner.setCanPlay(true); // lock to determine ability to play
        ShowRunner.setRepeat(repeat.checked);
        ShowRunner.playShow();
    } else {
        playButton.innerText = 'Play';
        playButton.value = 'notPlaying';
        playButton.style.backgroundColor = 'green';
        playButton.style.borderColor = 'green';

        ShowRunner.setCanPlay(false); // lock to stop play of show
        ShowRunner.stopAllShowElements();
    }
};

window.parent.document.getElementById('frame').onload = ShowRunner.stopAllShowElements();
