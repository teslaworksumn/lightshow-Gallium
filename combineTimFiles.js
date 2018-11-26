const path = require("path");

function printUsage() {
    console.log("Usage:", process.argv[0], process.argv[1], "new_file_name base_file \[additional_file ...\]");
    console.log("\tnew_file_name:\t\tThe name you want the combined .tim file to have");
    console.log("\tbase_file:\t\tThe file you wish to build off of");
    console.log("\tadditional_file:\tThe file you wish to add to base_file.  There can be as many as you want");
    console.log("\nBasic utility to combine multiple Vixen 3 sequence files (.tim) into one file for easy exporting as a CSV from Vixen 3");
}

function isTimFile(filename) {
    return path.extname(filename) === '.tim';
}


if (process.argv.length < 4) {
    console.log("ERROR: This utility requires at least 4 arguments");
    printUsage();
} else {
    let args = process.argv;
    for (let i = 2; i < args.length; i += 1) {
        // error out if  a given file is not a .tim file
        if (!isTimFile(args[i])) {
            console.log("ERROR: File", args[i], "is not a .tim file.  Check the file name and try again");
            return;
        }
    }
}
