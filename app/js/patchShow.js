const label = document.getElementById('patchLabel');

const showPath = iframe.value;
let patchPath = '';

// This function ensures that a file patch.json exists in the current show
// directory, copying in a blank patch if one does not already exist.
function ensurePatchExists() {
    const emptyPatchPath = path.join(path.resolve(),
        'app/config/emptyPatch.json');
    const newPatchPath = path.join(showPath, 'patch.json');

    if (!fse.existsSync(newPatchPath)) {
        fse.copyFileSync(emptyPatchPath, newPatchPath);
    }
    return newPatchPath;
}

// Returns a promise that ensures that a patch.json exists.  Used to start the
// promise chain used in patchShow()
function getPatch() {
    // write JSON file to patch.json
    return new Promise(((resolve, reject) => {
        const path = ensurePatchExists();
        resolve(path);
    }));
}

// Applies the patch to a specific sequenceFile and write the result back to
// the sequenceFile
//
// For every frame in the sequence, apply the patch
// sequence[i] is a frame
// patch[j] is one channel mapping
function applyPatch(sequenceFile) {
    const patchFile = fse.readJsonSync(patchPath);
    const patch = patchFile.patch;

    const sequenceJson = JSON.parse(fse.readFileSync(sequenceFile));
    const originalSequence = sequenceJson['Sequence Data Json'];

    // only apply the patch to sequences and not audio files
    if (originalSequence.length === 0) {
        return;
    }

    const sequence = sequenceJson['Sequence Patched Data Json'];

    for (let i = 0; i < sequence.length; i += 1) {
        for (let j = 0; j < patch.length; j += 1) {
            sequence[i][patch[j].dmxChannel] = originalSequence[i][patch[j].internalChannel];
        }
    }

    sequenceJson['Sequence Patched Data Json'] = sequence;

    fse.writeFileSync(sequenceFile, JSON.stringify(sequenceJson, null, 2));
}

// Applies the patch to the entire show playlist.  The current show is known
// through the showPath global variable
function applyPatchToShow() {
    const showJsonPath = path.join(showPath, 'show.json');
    const show = JSON.parse(fse.readFileSync(showJsonPath));
    const showPlaylist = show.Playlist;

    for (let i = 0; i < showPlaylist.length; i += 1) {
        label.innerText = `Applying patch to element ${i}/${showPlaylist.length}`;
        applyPatch(showPlaylist[i]);
    }
}

function getUrl() {
    const showJsonPath = path.join(showPath, 'show.json');
    const data = JSON.parse(fse.readFileSync(showJsonPath));

    return data.GoogleScriptUrl;
}

// Uses promises to ensure that things happen in a specific order.
// In order:
//  1. Ensure that a patch.json file exists in the show directory
//  2. Get the JSON output of the patch from the Layout Google Sheet
//  3. Ensure the JSON output (the patch) is actually JSON
//  4. Write the patch to patch.json
//  5. Apply the patch to the entire show
function patchShow() {
    getPatch().then((path) => {
        patchButton.setAttribute('disabled', '');
        label.innerText = 'Fetching Google Sheet...';

        // use the url found in each show's settings file
        const GScriptUrl = getUrl();

        patchPath = path;

        return fetch(GScriptUrl);
    }).then((response) => {
        label.innerText = 'Converting response to JSON...';

        return response.json();
    }).then((patchJson) => {
        label.innerText = 'Saving patch...';

        return fse.writeFileSync(patchPath, JSON.stringify(patchJson, null, 2));
    })
        .then(() => {
            applyPatchToShow();
        })
        .then(() => {
            label.innerText = 'Ready!';
            patchButton.removeAttribute('disabled', '');
        })
        .catch((err) => {
            label.innerText = 'Error occured. Try again';
            patchButton.removeAttribute('disabled', '');
        });
}
