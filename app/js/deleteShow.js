const parent = window.parent;
const fse = parent.require('fs-extra');
const path = parent.require('path');

function returnToShows() {
    window.parent.document.getElementById('frame').src = './html/shows.html';
}

function deleteShowInConfig(showPath) {
    const appConfigPath = path.join(path.resolve(), 'app/config/shows.json');
    const data = JSON.parse(fse.readFileSync(appConfigPath));

    if (data) {
        const shows = data.shows;
        // iterates until it finds existing path and deletes it
        for (let i = 0; i < shows.length; i += 1) {
            if (shows[i] && shows[i] === showPath) {
                shows.splice(i, 1);
            }
        }

        fse.writeFileSync(appConfigPath, JSON.stringify(data, null, 2));
    }
}

function deleteShow() {
    const inputText = document.getElementById('showName').value;
    const showsDir = path.resolve('app', 'shows');

    const showPath = path.join(showsDir, inputText);

    // path.join makes Windows path correct
    const emptyShowPath = path.join('./app/config/emptyShow.json');
    if (fse.existsSync(showPath)) {
        alert(`Deleting show ${inputText}`);
        fse.remove(showPath);
        deleteShowInConfig(showPath);

        returnToShows();
    } else {
        alert(`show ${inputText} doesn't exist`);
    }
}
