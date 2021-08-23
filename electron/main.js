const { app, BrowserWindow, dialog } = require('electron');
var ipc = require("electron").ipcMain;
var fs = require("fs");
var path = require("path");

const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

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

var interfacePort = null;


function createWindow(width, height, file, maximised, show) {
    const win = new BrowserWindow({
      width: width,
      height: height,
      show: show,
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
let ControllerWindow = null;

// when ready create the main window
app.whenReady().then(() => {
    IndexWindow = createWindow(800, 600, "pages/index.html", true, true);
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
        // THEN ADD A FAKE PORT
        portsObject[Object.keys(portsObject).length] = {"port": "FAKE-PORT", "name": "Fake Interface"};
        event.sender.send("SerialPortsListResponse", JSON.stringify(portsObject))
    });
});

ipc.on("IsConnected", function(event, portToCheck) {
    // RETURNING TRUE HERE
    event.sender.send("IsConnectedResponse", true);
    // NOT RETURNING TRUE HERE
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
                    // USED TO RETURN TRUE HERE
                    //event.sender.send("IsConnectedResponse", true);
                    // DIDNT USED TO RETURN TRUE HERE
                }
            }
        }
        if(found == false) {
            // USED TO RETURN FALSE HERE
            //event.sender.send("IsConnectedResponse", false);
            // DIDNT USED TO RETURN FALSE HERE
        }
        
    });
});

ipc.on("UseDevice", function(event, devicePort) {
    // then try and connect to the device by opening a SerialPort to the arduino and sending the alive word to the arduino
    let port = new SerialPort(devicePort, {
        baudRate: 9600
    })
    let parser = port.pipe(new Readline({ delimiter:"\r\n" }));

    // USED TO BE AN START OF THE PARSER EVENT FOR DATA
    //parser.on("data", function(data) {
    // USED TO BE THE END OF THE PARSER EVENT FOR DATA
    // THEN SET DATA TO TRUE
    data = "true";
        if(data == "ready") {
            console.log("Recieved Ready Message");
            // then send the alive word to the arduino
            port.write("alive\n");
        }
        else if(data == "true") {
            // then store the port in the interfacePort variable
            interfacePort = devicePort;
            // then open the controller window and close the index window
            ControllerWindow = createWindow(800, 600, "pages/controller.html", true, false);
            ControllerWindow.once('ready-to-show', () => {
                ControllerWindow.show();
            })
            IndexWindow.close();
        }
        else {
            // then send a message back and say it failed
            event.sender.send("UseDeviceResponse", false);
        }
    // USED TO BE AN END OF THE PARSER EVENT FOR DATA
    //})
    // DIDNT USED TO BE THE END OF THE PARSER EVENT FOR DATA
});



// THEN HANDLE THE IPC REQUESTS FROM THE CONTROLLER JS PAGE
ipc.on("OpenManageFixturesWindow", function(event, data) {
    // then create a new window
    createWindow(800, 600, "pages/manageFixtures.html", true);
});


// THEN HANDLE THE IPC REQUESTS FROM THE manageFixtures JS PAGE
ipc.on("SettingsGetFixtures", function(event, data) {
    // then check if there is a folder in the documents called dmxProject
    let folderPathToCheck = path.join(app.getPath("home"), "Documents", "dmxProject");
    if(fs.existsSync(folderPathToCheck)) {
        // then as the folder is there then check if there is a fixtures.json file in there
        if(fs.existsSync(folderPathToCheck + "\\fixtures.json")) {
            // then read the contents of the file
            let fixturesJson = fs.readFileSync(folderPathToCheck + "\\fixtures.json", "utf8");
            event.sender.send("SettingsGetFixturesResponse", fixturesJson);
        }
        else {
            // then make a new file
            fs.appendFileSync(folderPathToCheck + "\\fixtures.json", '{\n\t"success":true\n}');
            event.sender.send("SettingsGetFixturesResponse", JSON.stringify({"success":false}))
        }
    }
    else {
        // then create a folder
        fs.mkdirSync(folderPathToCheck);
        event.sender.send("SettingsGetFixturesResponse", JSON.stringify({"success":false}))
    }
})