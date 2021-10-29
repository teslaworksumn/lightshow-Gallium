const { app, BrowserWindow } = require('electron');
const path = require('path');
const firstRun = require('electron-first-run');
const group = require('./app/js/linuxAddUserToDialoutGroup');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 700,
        backgroundColor: '#000000',
        minHeight: 600,
        minWidth: 800,
        icon: path.join(__dirname, 'app/img/tesla_gear.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // enableRemoteModule: true,
          },
    });

    // and load the index.html of the app.
    win.loadFile('./app/index.html');

    // Open the DevTools.
    // win.webContents.openDevTools()

    const isFirstRun = firstRun();
    if (isFirstRun) {
        group.addUserToGroup();
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow());

app.whenReady().then(() => {
    createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// app.allowRendererProcessReuse = false;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
