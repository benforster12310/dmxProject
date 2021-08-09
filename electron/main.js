const { app, BrowserWindow, dialog, ipcMain } = require('electron');

function createWindow(width, height, file, maximised) {
    const win = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    }
    })
  
    win.loadFile(file);

    if(maximised) {
        win.maximize();
    }

    return win;

}

let IndexWindow = null;

// when ready create the main window
app.whenReady().then(() => {
    IndexWindow = createWindow(800, 600, "pages/index.html", true)
})

app.on('window-all-closed', function () {
    if(process.platform !== 'darwin') app.quit()
})


// then handle IPC events



