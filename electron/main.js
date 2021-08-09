const { app, BrowserWindow, dialog } = require('electron');
var ipc = require("electron").ipcMain;

const SerialPort = require("serialport");

// list the vendorId for arduino and then create a list of the productids with the descriptions on them
let arduinoVendorId = 2341
let arduinoProductIds = {
    "0001":  "Uno",
	"0036":  "Leonardo Bootloader",
	"0010":  "Mega 2560",
	"003b":  "Serial Adapter",
	"003d":  "Due Programming Port",
	"003e":  "Due",
	"003f":  "Mega ADK",
	"0042":  "Mega 2560 R3",
	"0043":  "Uno R3",
	"0044":  "Mega ADK R3",
	"0045":  "Serial R3",
	"0049":  "ISP",
	"8036":  "Leonardo",
	"8038":  "Robot Control Board"
}


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

ipc.on("SerialPortsList", function(event, data) {
    let portsObject = {};
    SerialPort.list().then(function(data) {
        // then go through each device
        for(var i = 0; i < data.length; i++) {
            // then check if the device is made by arduino
            if(data[i].vendorId == arduinoVendorId) {
                // then add it to the portsList with the description
                portsObject[Object.keys(portsObject).length] = {"port": data[i].path, "name": arduinoProductIds[data[i].productId]}
            }
        }
        event.sender.send("SerialPortsListResponse", JSON.stringify(portsObject))
    });
});

ipc.on("IsConnected", function(event, portToCheck) {
    let portsObject = {};
    SerialPort.list().then(function(data) {
        // then go through each device
        let found = false;
        for(var i = 0; i < data.length; i++) {
            // then check if the device is made by arduino
            if(data[i].vendorId == arduinoVendorId) {
                // then check if its path is the same as the portToCheck
                if(data[i].path == portToCheck) {
                    found = true;
                    event.sender.send("IsConnectedResponse", true);
                }
            }
        }
        if(found == false) {
            event.sender.send("IsConnectedResponse", false)
        }
        
    });
});