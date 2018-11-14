const table = document.getElementById('tableBody');
const { dialog } = window.parent.require('electron').remote;
const addButton = document.getElementById('addShow');

// the directory of the current show is contained in the iframe.value attribute
const showDir = window.parent.document.getElementById('frame').value;
const showDataPath = path.join(showDir, 'show.json');

// the json file containing the playlist of the show
const showData = JSON.parse(fse.readFileSync(showDataPath));


//function to add a song
addButton.onclick = function addSong() {
  dialog.showOpenDialog({
    title: 'Choose an audio file',
    filters: [
      {name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'ogg']},
      {name: 'All', extensions: ['*']},
    ],
  }, (filenames) => {
    if(filenames !== undefined) {
      playlistElements.push(filenames[0]);
      fse.writeFileSync(showDataPath, JSON.stringify(showData,null, 2))
    }
  });
}

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
