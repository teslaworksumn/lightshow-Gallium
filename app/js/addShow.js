const parent = window.parent;
const fse = parent.require('fs-extra');
const path = parent.require('path');

let visibleShowPath = '';

function returnToShows() {
    window.parent.document.getElementById('frame').src = './html/shows.html';
}

/*
 * Adds the path of a show to the config file kept by the program
 */
function addShowToConfig(showPath) {
    const appConfigPath = path.join(path.resolve(), 'app/config/shows.json');
    const data = JSON.parse(fse.readFileSync(appConfigPath));
    visibleShowPath = showPath;

    if (data) {
        const shows = data.shows;
        shows.push(showPath);
        fse.writeFileSync(appConfigPath, JSON.stringify(data, null, 2));
    }
}

function addNewShow() {
    const showName = document.getElementById('showName').value;
    const showsDir = path.resolve('app', 'shows');
    const showPath = path.join(showsDir, showName);

    // path.join makes Windows path correct
    const emptyShowPath = path.join(path.resolve(), 'app/config/emptyShow.json');

    if (fse.existsSync(showPath)) {
        alert(`Yo, show '${showName}' already exists`);
    } else {
        fse.mkdirSync(showPath);
        fse.copyFileSync(emptyShowPath, path.join(showPath, 'show.json'));

        const showJson = JSON.parse(fse.readFileSync(path.join(showPath, 'show.json')));

        // set information in the JSON file used as the show's settings
        showJson.Name = `${showName}`;
        showJson.GoogleScriptUrl = '';

        fse.writeFileSync(path.join(showPath, 'show.json'), JSON.stringify(showJson, null, 2));

        addShowToConfig(showPath);
        document.getElementById('validName').style.display = 'table';

        alert(`New show '${showName}' added`);
    }
}

function addNewElement() {

}
