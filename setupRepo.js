const fse = require('fs-extra');
const path = require('path');

const repoRoot = __dirname;

// removes everything in directory but leaves direcory intact OR creates
// directory if it doesn't exist
fse.emptyDirSync(path.join(repoRoot, '/app/shows'));
