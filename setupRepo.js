const fse = require('fs-extra');
const path = require('path');

/*
 * Ensures that shows.json exists whether run to set up the repo or when the
 * app is started.  If the file is not present, create a new blank shows.json.
 */

const currentDir = path.resolve();
const repoRoot = currentDir.split('app')[0];

fse.ensureDirSync(path.join(repoRoot, 'app/shows'));
fse.ensureDirSync(path.join(repoRoot, 'app/config'));
fse.ensureFileSync(path.join(repoRoot, 'app/config/emptyShow.json'));

const showsJsonPath = path.join(repoRoot, 'app/config/shows.json');
const data = JSON.stringify({ activeShow: '', shows: [] }, null, 2);

if (!fse.existsSync(showsJsonPath)) {
    fse.writeFileSync(showsJsonPath, data);
}
