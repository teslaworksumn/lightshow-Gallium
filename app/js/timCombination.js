/* eslint-disable */

const path = parent.require('path');
const xmlReader = parent.require('xml2js');
const fs = parent.require('fs');

/*
function printUsage() {
    console.log("Usage:", process.argv[0], process.argv[1],"new_file_name base_file \[additional_file ...\]");
    console.log("\tnew_file_name:\t\tThe name you want the combined .tim file to have");
    console.log("\tbase_file:\t\tThe file you wish to build off of");
    console.log("\tadditional_file:\tThe file you wish to add to base_file.  There can be as many as you want");
    console.log("\nBasic utility to combine multiple Vixen 3 sequence files (.tim) into one file for easy exporting as a CSV from Vixen 3");
} // Change this

function isTimFile(filename) {
    return path.extname(filename) === '.tim';
}

let args = process.argv;

if (args.length < 4) {
    console.log("ERROR: This utility requires at least 4 arguments");
    printUsage();
    return;
} else {
    for (let i = 2; i < args.length; i += 1) {
        // error out if  a given file is not a .tim file
        if (!isTimFile(args[i])) {
            console.log("ERROR: File", args[i], "is not a .tim file.  Check the file name and try again");
            return;
        }
    }
}
*/


module.exports = {
    // Combines a given list of .tim files into a single .tim file
    //
    // files is a list of filenames pointing to .tim files
    // files[0] is the name of the final output
    // files[1] is the base file on which all other files will be merged into
    // files past files[1] will all be merged onto the base of file[1] and then
    // saved into a file called files[0]
    async combineTimFiles(files) {
        const baseXML = fs.readFileSync(files[1]);
        let baseData;
        xmlReader.Parser().parseString(baseXML, (err, result) => {
            baseData = JSON.parse(JSON.stringify(result, null, 2));
        });


        for (let i = 2; i < files.length; i += 1) {
            const additionalDataXML = fs.readFileSync(files[i]);
            let additionalData;

            xmlReader.Parser().parseString(additionalDataXML, (err, result) => {
                additionalData = JSON.parse(JSON.stringify(result, null, 2));
            });

            const additionalDataModels = additionalData.TimedSequenceData._dataModels[0]['d1p1:anyType'];
            const additionalDataNodes = additionalData.TimedSequenceData._effectNodeSurrogates[0].EffectNodeSurrogate;

            for (let j = 1; j < additionalDataModels.length; j += 1) {
                baseData.TimedSequenceData._dataModels[0]['d1p1:anyType'].push(additionalDataModels[j]);
            }
            for (let k = 0; k < additionalDataNodes.length; k += 1) {
                baseData.TimedSequenceData._effectNodeSurrogates[0].EffectNodeSurrogate.push(additionalDataNodes[k]);
            }
        }

        const builder = new xmlReader.Builder();
        const newTimFile = builder.buildObject(baseData);
        fs.writeFileSync(files[0], newTimFile);
    },
};

/* eslint-enable */
