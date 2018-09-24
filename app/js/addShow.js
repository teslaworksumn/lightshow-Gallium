const parent = window.parent;
const fs = parent.require('fs');
const path = parent.require('path');
const Win = parent.require('electron').remote.BrowserWindow;

function popWindow() {
    const Popup = new Win({ width: 600, height: 400 });
    Popup.loadFile('./app/html/addShow.html');
}

function closePopupWindow() {
    parent.require('electron').remote.getCurrentWindow().close();
}

function addShowToConfig(showPath) {
    const appConfigPath = path.join(path.resolve(), '../config/shows.json');
    const data = JSON.parse(fs.readFileSync(appConfigPath));
    if (data) {
        const shows = data.shows;
        shows.push(showPath);
        fs.writeFileSync(appConfigPath, JSON.stringify(data, null, 2));
    }
}

function addNewShow() {
    const inputText = document.getElementById('showName').value;
    const showPath = path.join('./app/shows', inputText);
    const emptyShowPath = path.join('./app/config/emptyShow.json');

    if (fs.existsSync(showPath)) {
        alert(`Yo, show ${inputText} already exists`);
    } else {
        fs.mkdirSync(showPath);
        alert(`New show ${inputText} added`);
        fs.copyFileSync(emptyShowPath, path.join(showPath, 'show.json'));
        addShowToConfig(showPath);
    }
    closePopupWindow();
}
