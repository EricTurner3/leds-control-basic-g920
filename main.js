"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var remoteMain = require("@electron/remote/main");
var server_1 = require("./server");
var electron_log_1 = require("electron-log");
electron_log_1.default.info('Hello, log');
// electronLog.warn('Some problem appears');
// Initialize remote module
remoteMain.initialize();
var myServer = new server_1.ExpressServer();
var args = process.argv.slice(1), serve = args.some(function (val) { return val === '--serve'; });
var win = null;
var screenOptions = {
    // set the window height / width
    width: 1157,
    height: 732,
    /// remove the window frame, so it will rendered without frames
    frame: false,
    // and set the transparency to true, to remove any kind of background
    transparent: true,
    // resizable: false,
    maximizable: false,
    resizable: true,
    minWidth: 1157,
    minHeight: 732,
    // icon: __dirname + '/src/assets/icons/favicon.ico',
    webPreferences: {
        webSecurity: false,
        // devTools: false,
        nodeIntegration: true,
        allowRunningInsecureContent: (serve),
        contextIsolation: false,
        enableRemoteModule: true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
};
function createWindow() {
    // Create the browser window.
    win = new electron_1.BrowserWindow(screenOptions);
    if (serve) {
        win.webContents.openDevTools();
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        myServer.close();
        win = null;
    });
    return win;
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', function () { return setTimeout(createWindow, 400); });
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map