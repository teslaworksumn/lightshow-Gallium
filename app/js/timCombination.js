const path = parent.require("path");
const xmlReader = parent.require('xml2js');
const fs = parent.require('fs')

// function printUsage() {
//     console.log("Usage:", process.argv[0], process.argv[1], "new_file_name base_file \[additional_file ...\]");
//     console.log("\tnew_file_name:\t\tThe name you want the combined .tim file to have");
//     console.log("\tbase_file:\t\tThe file you wish to build off of");
//     console.log("\tadditional_file:\tThe file you wish to add to base_file.  There can be as many as you want");
//     console.log("\nBasic utility to combine multiple Vixen 3 sequence files (.tim) into one file for easy exporting as a CSV from Vixen 3");
// } // Change this

// function isTimFile(filename) {
//     return path.extname(filename) === '.tim';
// }

// let args = process.argv;

// if (args.length < 4) {
//     console.log("ERROR: This utility requires at least 4 arguments");
//     printUsage();
//     return;
// } else {
//     for (let i = 2; i < args.length; i += 1) {
//         // error out if  a given file is not a .tim file
//         if (!isTimFile(args[i])) {
//             console.log("ERROR: File", args[i], "is not a .tim file.  Check the file name and try again");
//             return;
//         }
//     }
// }



module.exports = {
    combineTimFiles: async function (files) {
        var baseXML = fs.readFileSync(files[1]);
        var baseData;
        xmlReader.Parser().parseString(baseXML, function (err, result) {
            baseData = JSON.parse(JSON.stringify(result, null, 2));
        });


        for (let i = 2; i < files.length; i += 1) {
            var additionalDataXML = fs.readFileSync(files[i]);
            var additionalData;
            xmlReader.Parser().parseString(additionalDataXML, function (err, result) {
                additionalData = JSON.parse(JSON.stringify(result, null, 2));
            });
            var additionalDataModels = additionalData["TimedSequenceData"]["_dataModels"][0]["d1p1:anyType"][0];
            for (var j = 0; j < additionalDataModels.length; j++) {
                baseData["TimedSequenceData"]["_dataModels"][0]["d1p1:anyType"].push(additionalDataModels[j])
            }

            var additionalDataNodes = additionalData["TimedSequenceData"]["_effectNodeSurrogates"][0]["EffectNodeSurrogate"]
            for (var k = 0; k < additionalDataNodes.length; k++) {
                baseData["TimedSequenceData"]["_effectNodeSurrogates"][0]["EffectNodeSurrogate"].push(additionalDataNodes[k])
            }
        }

        var builder = new xmlReader.Builder();
        var newTimFile = builder.buildObject(baseData);
        fs.writeFileSync(files[0], newTimFile)
    }
}