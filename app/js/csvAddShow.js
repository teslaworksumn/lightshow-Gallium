const { dialog } = window.parent.require('electron').remote;
const fs = window.parent.require('fs');
const os = window.parent.require('os');
const table = document.getElementById('tableBody');

// Ensure that an element can only be added once to the table
function rowIsUnique(rows, name) {
    for (let i = 0; i < rows.length; i += 1) {
        if (name === rows[i].innerText.split('\t')[0]) {
            alert(`You've already selected '${name}'`);
            return false;
        }
    }
    return true;
}

function associateAudio(element, tableItem) {
    dialog.showOpenDialog({
        title: 'Choose an Audio File',
        filters: [
            { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'ogg'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    }).then((result) => {
        console.log(result.canceled);
        console.log(result.filePaths);
        // make sure an audio file is selected
        if (result.filePaths !== undefined) {
            // add selected audio file to the table of elements
            let audioFilename = result.filePaths[0].split(path.sep);
            audioFilename = result.filePaths[0].split(path.sep)[audioFilename.length - 1];

            const domElement = element;
            domElement.innerText = audioFilename;
            tableItem.value.push(result.filePaths[0]);
        }
    }).catch((err) => {
        console.log(err);
    });
}

// // function associateAudio(element, tableItem) {
// //     dialog.showOpenDialog({
// //         title: 'Choose an Audio File',
// //         filters: [
// //             { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'ogg'] },
// //             { name: 'All Files', extensions: ['*'] },
// //         ],
// //     }, (fileNames) => {
//         // make sure an audio file is selected
//         // if (fileNames !== undefined) {
//         //     // add selected audio file to the table of elements
//         //     let audioFilename = fileNames[0].split(path.sep);
//         //     audioFilename = fileNames[0].split(path.sep)[audioFilename.length - 1];

//         //     const domElement = element;
//         //     domElement.innerText = audioFilename;
//         //     tableItem.value.push(fileNames[0]);
//         }
// //     });
// // }

document.getElementById('chooseCSV').addEventListener('click', () => {
    dialog.showOpenDialog({
        title: 'Choose a CSV Sequence',
        filters: [
            { name: 'CSV', extensions: ['csv'] },
            // Add below line if all files need to be seen when browsing
            // Currently, this file only works with CSV files so it makes
            // sense to only allow the selection of CSV files in this dialog
            // { name: 'All Files', extensions: ['*'] },
        ],
    }).then((result) => {
        console.log(result.canceled);
        console.log(result.filePaths);
        console.log('JOshing me', result.filePaths);
        // make sure a CSV file is selected
        if (result.filePaths !== undefined) {
            // add selected file to the table of elements
            const tableItem = document.createElement('tr');
            const elementName = document.createElement('td');
            let csvFilename = result.filePaths[0].split(path.sep);

            csvFilename = result.filePaths[0].split(path.sep)[csvFilename.length - 1];
            elementName.innerText = csvFilename;

            // add another cell in that row with a button to associate an
            // audio file with that sequence
            if (rowIsUnique(table.rows, csvFilename)) {
                const associateAudioButton = document.createElement('button');
                associateAudioButton.innerText = 'Associate Audio';
                const newColumn = document.createElement('td');
                newColumn.appendChild(associateAudioButton);

                const timeFrameLengthInput = document.createElement('select');
                const option25  = document.createElement('option');
                const option50  = document.createElement('option');
                const option100 = document.createElement('option');

                option25.value  = 25;
                option25.text   = '25';
                option50.value  = 50;
                option50.text   = '50';
                option100.value = 100;
                option100.text  = '100';

                timeFrameLengthInput.appendChild(option25);
                timeFrameLengthInput.appendChild(option50);
                timeFrameLengthInput.appendChild(option100);

                const timeFrameLength = document.createElement('td');
                timeFrameLength.appendChild(timeFrameLengthInput);

                const associatedAudioPath = '';
                associateAudioButton.addEventListener('click', () => {
                    associateAudio(newColumn, tableItem);
                });

                tableItem.appendChild(elementName);
                tableItem.appendChild(newColumn);
                tableItem.appendChild(timeFrameLength);

                /*
                 * value will contain array of paths either containing 1 element
                 * (the csv path name) or 2 (the csv path and associated audio)
                 */
                tableItem.value = [];
                tableItem.value.push(result.filePaths[0]); // metadata containing full path
                table.appendChild(tableItem);
            }
        }
    }).catch((err) => {
        console.log(err);
    });
});
// document.getElementById('chooseCSV').addEventListener('click', () => {
//     dialog.showOpenDialog({
//         title: 'Choose a CSV Sequence',
//         filters: [
//             { name: 'CSV', extensions: ['csv'] },

//             // Add below line if all files need to be seen when browsing
//             // Currently, this file only works with CSV files so it makes
//             // sense to only allow the selection of CSV files in this dialog
//             // { name: 'All Files', extensions: ['*'] },
//         ],
//     }, (fileNames) => {
//         console.log("JOshing me", fileNames);
//         // make sure a CSV file is selected
//         if (fileNames !== undefined) {
//             // add selected file to the table of elements
//             const tableItem = document.createElement('tr');
//             const elementName = document.createElement('td');
//             let csvFilename = fileNames[0].split(path.sep);

//             csvFilename = fileNames[0].split(path.sep)[csvFilename.length - 1];
//             elementName.innerText = csvFilename;

//             // add another cell in that row with a button to associate an
//             // audio file with that sequence
//             if (rowIsUnique(table.rows, csvFilename)) {
//                 const associateAudioButton = document.createElement('button');
//                 associateAudioButton.innerText = 'Associate Audio';
//                 const newColumn = document.createElement('td');
//                 newColumn.appendChild(associateAudioButton);

//                 const timeFrameLengthInput = document.createElement('select');
//                 const option25  = document.createElement('option');
//                 const option50  = document.createElement('option');
//                 const option100 = document.createElement('option');

//                 option25.value  = 25;
//                 option25.text   = '25';
//                 option50.value  = 50;
//                 option50.text   = '50';
//                 option100.value = 100;
//                 option100.text  = '100';

//                 timeFrameLengthInput.appendChild(option25);
//                 timeFrameLengthInput.appendChild(option50);
//                 timeFrameLengthInput.appendChild(option100);

//                 const timeFrameLength = document.createElement('td');
//                 timeFrameLength.appendChild(timeFrameLengthInput);

//                 const associatedAudioPath = '';
//                 associateAudioButton.addEventListener('click', () => {
//                     associateAudio(newColumn, tableItem);
//                 });

//                 tableItem.appendChild(elementName);
//                 tableItem.appendChild(newColumn);
//                 tableItem.appendChild(timeFrameLength);

//                 /*
//                  * value will contain array of paths either containing 1 element
//                  * (the csv path name) or 2 (the csv path and associated audio)
//                  */
//                 tableItem.value = [];
//                 tableItem.value.push(fileNames[0]); // metadata containing full path
//                 table.appendChild(tableItem);
//             }
//         }
//     });
// }, false);

document.getElementById('chooseAudio').addEventListener('click', () => {
    dialog.showOpenDialog({
        title: 'Choose an Audio File',
        filters: [
            { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'ogg'] },
            // Add if all files need to be seen when browsing
            // { name: 'All Files', extensions: ['*'] },
        ],
    }).then((result) => {
        console.log(result.canceled);
        console.log(result.filePaths);
        // ensure audio file is selected
        if (result.filePaths !== undefined) {
        // add selected file to the table of elements
            const tableItem = document.createElement('tr');
            const elementName = document.createElement('td');
            let audioFilename = result.filePaths[0].split(path.sep);

            audioFilename = result.filePaths[0].split(path.sep)[audioFilename.length - 1];
            elementName.innerText = audioFilename;

            if (rowIsUnique(table.rows, audioFilename)) {
                tableItem.appendChild(elementName);
                table.appendChild(tableItem);

                // add the audio path to the value attribute for later saving
                // the show json later
                tableItem.value = [];
                tableItem.value.push(result.filePaths[0]);
            }
        }
    }).catch((err) => {
        console.log(err);
    });
});

// document.getElementById('chooseAudio').addEventListener('click', () => {
//     dialog.showOpenDialog({
//         title: 'Choose an Audio File',
//         filters: [
//             { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'ogg'] },
//             // Add if all files need to be seen when browsing
//             // { name: 'All Files', extensions: ['*'] },
//         ],
//     }, (fileNames) => {
//         // ensure audio file is selected
//         if (fileNames !== undefined) {
//             // add selected file to the table of elements
//             const tableItem = document.createElement('tr');
//             const elementName = document.createElement('td');
//             let audioFilename = fileNames[0].split(path.sep);

//             audioFilename = fileNames[0].split(path.sep)[audioFilename.length - 1];
//             elementName.innerText = audioFilename;

//             if (rowIsUnique(table.rows, audioFilename)) {
//                 tableItem.appendChild(elementName);
//                 table.appendChild(tableItem);

//                 // add the audio path to the value attribute for later saving
//                 // the show json later
//                 tableItem.value = [];
//                 tableItem.value.push(fileNames[0]);
//             }
//         }
//     });
// }, false);

function isCSVSequence(filename) {
    const csv = '.csv';
    const extension = path.extname(filename);

    return csv === extension;
}

function saveCSVShow() {
    // for every table entry, create a sequence
    for (let i = 0; i < table.rows.length; i += 1) {
        const filepath = table.rows[i].value[0];

        if (isCSVSequence(filepath)) {
            const audiopath = table.rows[i].value[1];
            const timeFrameLength = table.rows[i].children[2].children[0].value;
            createSequenceJson(filepath, audiopath, timeFrameLength, visibleShowPath);
        } else {
            createSequenceJsonAudioOnly(filepath, visibleShowPath);
        }
    }

    // need to go to shows.html page for this show
    const iframe = window.parent.document.getElementById('frame');
    iframe.value = visibleShowPath; // set current show attribute to reference in other iframes
    iframe.src = './html/show.html';
}
