const showPath = iframe.value;

// This function ensures that a file patch.json exists in the current show directory
function ensurePatchExists() {
    const emptyPatchPath = path.join(path.resolve(), 'app/config/emptyPatch.json');
    const newPatchPath = path.join(showPath, 'patch.json');

    if (!fse.existsSync(newPatchPath)) {
        fse.copySync(emptyPatchPath, newPatchPath);
    }

    return newPatchPath;
}

// This function will either call a Google script that will return a JSON file
// of all the channels in the form {internalChannel: XX, dmxChannel: XX} and be
// written to a file called patchedChannels.json in the current show's config
// page
//
// OR
//
// will directly access the layout spreadsheet and write the same information
// to the same file as above
function getPatch() {
    // write JSON file to patch.json

    return ensurePatchExists();

    //fse.copySync(emptyPatchPath, )

    //sequenceJson.Name = audioFileName;
    //sequenceJson['Audio File'] = audioPath;
//
    //fse.writeFileSync(newSequencePath, JSON.stringify(sequenceJson, null, 2));
}

function applyPatch(sequenceFile, patchPath) {
    const patchFile = JSON.parse(fse.readFileSync(patchPath)); 
    const patch = patchFile['patch'];
    const sequenceJson = JSON.parse(fse.readFileSync(sequenceFile));
    const sequence = sequenceJson['Sequence Patched Data Json'];


    console.log(sequenceFile);

    // for every frame
    //   for every patch
    //     apply the patch

    // patch[i] is a patch
    // sequence[j] is one of the frames

    sequenceBefore = sequence[0];
    console.log(sequence[0]);
    for (let i = 0; i < sequence.length; i++) {
        for (let j = 0; j < patch.length; j++) {
            if (i == 0) {
                // DMX is 1 indexed - j needs to be j + 1
                sequence[i][(j + 1).toString()] = sequence[patch[j].dmxChannel];
                console.log(sequence[patch[j].dmxChannel]);
                console.log(sequence[i][(j + 1).toString()]);
            }
        }
        //patchedData.push(frame);
    }
    console.log(sequence[0]);

    console.log(sequenceBefore === sequence[0]);


    //console.log(patchedData);
}

function applyPatchToShow(patchPath) {
    // for ever sequence in the playlist
    // apply patch to sequence
    const showJsonPath = path.join(showPath, 'show.json');
    console.log("show", showJsonPath);
    const show = JSON.parse(fse.readFileSync(showJsonPath));
    const showPlaylist = show['Playlist'];

    //for (let i = 0; i < showPlaylist.length; i++) {
        applyPatch(showPlaylist[0], patchPath);
    //}
}


function patchShow() {
    patchPath = getPatch();
    applyPatchToShow(patchPath);
}

