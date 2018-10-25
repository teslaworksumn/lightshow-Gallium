var path = require('path')
var fse = require('fse')

function csvToArray(csv) {
    rows = csv.split("\n");

    return rows.map(function (row) {
        return row.split(",");
    });
};

function array2DToJson(array) {
    let json = []
    for (let i = 0; i < array.length; i++) {
        let timeframe = {}
        for (let j = 0; j < array[i].length; j++) {
            if (j == array[i].length - 1) {
                timeframe[j + 1] = array[i][j].split('\r')[0]
            }
            else {
                timeframe[j + 1] = array[i][j];
            }
        }
        json.push(timeframe);
    }
    return json
}


function createSequenceJson(csvFilePath, audioFilePath, timeFrameLength, showPath) {
    var csv = fse.readFileSync(csvFilePath, "utf8");
    var csvFilePathSplit = csvFilePath.split(path.sep);
    var csvFileName = csvFilePathSplit[csvFilePathSplit.length - 1];
    var array = csvToArray(csv);
    var jsonSequenceData = array2DToJson(array);
    const emptySequencePath = path.join(path.resolve(), '../config/emptySequence.json');
    const newSequencePath = path.join(showPath, `${csvFileName}.json`);
    fse.copyFileSync(emptySequencePath, newSequencePath);

    const sequenceJson = JSON.parse(fse.readFileSync(newSequencePath));
    sequenceJson["Name"] = csvFileName;
    sequenceJson["Audio File"] = audioFilePath;
    sequenceJson["Sequence Data Json"] = jsonSequenceData;
    sequenceJson["Time Frame Length"] = timeFrameLength;
    sequenceJson["Sequence Length"] = timeFrameLength * array.length;

    fse.writeFileSync(newSequencePath, JSON.stringify(sequenceJson, null, 2))

    const showJsonPath = path.join(showPath, 'show.json')
    const showJson = JSON.parse(fse.readFileSync(showJsonPath));
    showJson.Playlist.push(newSequencePath)
    fse.writeFileSync(showJsonPath, JSON.stringify(showJson, null, 2));
}