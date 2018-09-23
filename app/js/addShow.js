var fs = parent.require('fs');
var path = parent.require('path');

var win = parent.require('electron').remote.BrowserWindow;

function popWindow() {
    var popup = new win({ width: 600, height: 400 });
    popup.loadFile('./app/html/addShow.html');
}

function addNewShow() {
    var inputText = document.getElementById('showName').value;
    var showPath = path.join('./app/shows', inputText);
    var emptyShowPath = path.join('./app/config/emptyShow.json');

    if (fs.existsSync(showPath)) {
        alert('Yo, show ' + inputText + ' already exists')
    } else {
        fs.mkdirSync(showPath);
        alert("New show " + inputText + " added");
        fs.copyFileSync(emptyShowPath, path.join(showPath, 'show.json'));
        addShowToConfig(showPath);
    }
    closePopupWindow();
}

function closePopupWindow() {
    parent.require('electron').remote.getCurrentWindow().close();
}

function addShowToConfig(showPath) {
    var appConfigPath = path.join(parent.__dirname, '../config/shows.json');
    var data = JSON.parse(fs.readFileSync(appConfigPath));
    if (data) {
        var shows = data.shows;
    
        shows.push(showPath);
        fs.writeFileSync(appConfigPath, JSON.stringify(data, null, 2));
        
    }
}
