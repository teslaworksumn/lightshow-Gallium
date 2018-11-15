const csvButton = document.getElementById('addShowFromCSV');
const profileButton = document.getElementById('addShowFromProfile');
const manualButton = document.getElementById('manuallyAddShow');
const deleteShowButton = document.getElementById('deleteShow');

csvButton.onclick = function addShowCSV() {
    window.parent.document.getElementById('frame').src = './html/csvAddShow.html';
};
profileButton.onclick = function addShowProfile() {
    window.parent.document.getElementById('frame').src = './html/profileAddShow.html';
};
manualButton.onclick = function addShowManual() {
    window.parent.document.getElementById('frame').src = './html/manualAddShow.html';
};
deleteShowButton.onclick = function changePageSource() {
    window.parent.document.getElementById('frame').src = './html/deleteShow.html';
};

const appConfigPath = path.resolve('app/config/shows.json');
const appConfig = JSON.parse(fse.readFileSync(appConfigPath));
let activeShow = appConfig.activeShow;
const shows = appConfig.shows;
const table = document.getElementById('tableBody');

function onShowClick(newActiveShow) {
    activeShow = newActiveShow;
    const iframe = window.parent.document.getElementById('frame');

    fse.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));

    // Set the current show as an iframe attribute to access in other pages
    iframe.value = activeShow;
    iframe.src = 'html/show.html';
}


// Scan through the shows/ directory to see if there are any shows that already
// exist and add them to app/config so they are also displayed on the show page
function scanForShows() {
    const showsDir = path.resolve('app/shows');
    if (fse.existsSync(showsDir)) {
        let directories = fse.readdirSync(showsDir);
        for (let i = 0; i < directories.length; i++) {
            const showPath = path.resolve('app/shows/', directories[i]); 

            // only add to list of showsif the showPath doesn't already exist
            if (!appConfig.shows.includes(showPath)) {
                appConfig.shows.push(showPath);
            }
        }
    }
}

scanForShows();

// Display tables elements only if there are elements in the shows config
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
            const showSplitName = shows[i].split(path.sep);
            const pathShowName = showSplitName[showSplitName.length - 1];
            showName.innerText = pathShowName;
            tableItem.appendChild(showName);
            table.appendChild(tableItem);
        }
    }
}
