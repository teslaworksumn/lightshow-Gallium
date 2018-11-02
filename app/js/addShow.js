const parent = window.parent;
const fse = parent.require('fs-extra');
const path = parent.require('path');

function returnToShows() {
    window.parent.document.getElementById('frame').src = './html/shows.html';
}
function popWindow(){
    //File explorer code goes here
    alert(`Yay, things are looking good!`)
}
function addSequence(){
    //Adding the Sequence to show config? which one? Is it different from shows.json?
}

function addShowToConfig(showPath) {
    const appConfigPath = path.join(path.resolve(), 'app/config/shows.json');
    const data = JSON.parse(fse.readFileSync(appConfigPath));

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
        alert(`Yo, show ${showName} already exists`);
    } else {
        fse.mkdirSync(showPath);
        alert(`New show ${showName} added`);
        fse.copyFileSync(emptyShowPath, path.join(showPath, 'show.json'));
        addShowToConfig(showPath);
    }

    returnToShows();
}
