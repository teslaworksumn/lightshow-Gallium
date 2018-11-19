function csvToArray(csv) {
    rows = csv.split('\n');

    return rows.map(row => row.split(','));
}

function array2DToJson(array) {
    const json = [];
    for (let i = 0; i < array.length; i += 1) {
        const timeframe = {};
        for (let j = 0; j < array[i].length; j += 1) {
            if (j === array[i].length - 1) {
                timeframe[j + 1] = array[i][j].split('\r')[0];
            } else {
                timeframe[j + 1] = array[i][j];
            }
        }
        json.push(timeframe);
    }
    return json;
}

/*
 * Makes a sequence JSON file for only audio files
 * Leaves the JSON key 'Sequence Data Json' blank because it is only an audio file
 */
function createSequenceJsonAudioOnly(audioPath, showPath) {
    const audioFilePathSplit = audioPath.split(path.sep);
    const audioFileName = audioFilePathSplit[audioFilePathSplit.length - 1];
    const audioFileNameWithoutExtension = audioFileName.replace(/\.[^/.]+$/, ''); // removes the extension with regex
    const emptySequencePath = path.join(path.resolve(), 'app/config/emptySequence.json');
    const newSequencePath = path.join(showPath, `${audioFileNameWithoutExtension}.json`);

    fse.ensureFileSync(newSequencePath);
    fse.copySync(emptySequencePath, newSequencePath);
    const sequenceJson = JSON.parse(fse.readFileSync(newSequencePath));

    sequenceJson.Name = audioFileName;
    sequenceJson['Audio File'] = audioPath;

    fse.writeFileSync(newSequencePath, JSON.stringify(sequenceJson, null, 2));

    const showJsonPath = path.join(showPath, 'show.json');
    const showJson = JSON.parse(fse.readFileSync(showJsonPath));
    showJson.Playlist.push(newSequencePath);
    fse.writeFileSync(showJsonPath, JSON.stringify(showJson, null, 2));
}

/*
 * Makes a sequence JSON file for sequences
 * Includes the path to associated audio (if any)
 */
function createSequenceJson(csvFilePath, audioFilePath, timeFrameLength, showPath) {
    const csv = fse.readFileSync(csvFilePath, 'utf8');
    const csvFilePathSplit = csvFilePath.split(path.sep);
    const csvFileName = csvFilePathSplit[csvFilePathSplit.length - 1];
    const csvFileNameWithoutExtension = csvFileName.replace(/\.[^/.]+$/, ''); // removes the extension with regex
    const array = csvToArray(csv);
    const jsonSequenceData = array2DToJson(array);
    const emptySequencePath = path.join(path.resolve(), 'app/config/emptySequence.json');
    const newSequencePath = path.join(showPath, `${csvFileNameWithoutExtension}.json`);

    fse.ensureFileSync(newSequencePath);
    fse.copySync(emptySequencePath, newSequencePath);

    const sequenceJson = JSON.parse(fse.readFileSync(newSequencePath));
    sequenceJson.Name = csvFileName;

    // ensure the 'Audio File' key exists even if there is no associated audio
    if (audioFilePath !== undefined) {
        sequenceJson['Audio File'] = audioFilePath;
    } else {
        sequenceJson['Audio File'] = '';
    }
    sequenceJson['Sequence Data Json'] = jsonSequenceData;
    sequenceJson['Sequence Patched Data Json'] = jsonSequenceData; // initially patched data is the same as original data
    sequenceJson['Time Frame Length'] = timeFrameLength;
    sequenceJson['Sequence Length'] = timeFrameLength * array.length;

    fse.writeFileSync(newSequencePath, JSON.stringify(sequenceJson, null, 2));

    const showJsonPath = path.join(showPath, 'show.json');
    const showJson = JSON.parse(fse.readFileSync(showJsonPath));
    showJson.Playlist.push(newSequencePath);
    fse.writeFileSync(showJsonPath, JSON.stringify(showJson, null, 2));
}
