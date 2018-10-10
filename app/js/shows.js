const button = document.getElementById('addShow');

button.onclick = function changePageSource() {
    window.parent.document.getElementById('frame').src = './html/addShow.html';
};

const appConfigPath = path.resolve('app/config/shows.json');
const appConfig = JSON.parse(fse.readFileSync(appConfigPath));
let activeShow = appConfig.activeShow;
const shows = appConfig.shows;
const table = document.getElementById('tableBody');

function onShowClick(newActiveShow) {
    activeShow = newActiveShow;
    fse.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
    window.parent.document.getElementById('frame').src = 'html/show.html';
}

if (JSON.stringify(shows) === JSON.stringify([])) {
    document.getElementById('noShows').style.display = 'block';
} else {
    document.getElementById('table').style.display = 'block';

    for (let i = 0; i < shows.length; i += 1) {
        if (shows[i]) {
            const tableItem = document.createElement('tr');
            tableItem.onmousedown = function writeShowToConfigFile() {
                onShowClick(shows[i]);
            };
            const showName = document.createElement('td');
            showName.innerText = shows[i].split('app')[1].split(path.sep)[2];
            tableItem.appendChild(showName);
            table.appendChild(tableItem);
        }
    }
}
