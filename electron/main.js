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
        portsObject[Object.keys(portsObject).length] = {"port": "FAKE-PORT", "name": "Fake Interface"};
        event.sender.send("SerialPortsListResponse", JSON.stringify(portsObject))
    });
});

let arduinoSerialPort = null;
let fakePortUsed = false;

ipc.on("UseDevice", function(event, devicePort) {
    // then try and connect to the device by opening a SerialPort to the arduino and sending the alive word to the arduino
    let port = new SerialPort(devicePort, {
        baudRate: 115200
    })
    arduinoSerialPort = port;
    let parser = port.pipe(new Readline({ delimiter:"\r\n" }));
    
    fakePortUsed = false;

    parser.on("data", function(data) {
        console.log(data);
        interfacePort = devicePort;
        // then open the controller window and close the index window
        ControllerWindow = createWindow(800, 600, "pages/controller.html", true, false);
        ControllerWindow.once('ready-to-show', () => {
            ControllerWindow.show();
        })
        IndexWindow.close();
    })
});
ipc.on("UseFakeDevice", function(event, devicePort) {
    fakePortUsed = true;
    // then open the controller window and close the index window
    ControllerWindow = createWindow(800, 600, "pages/controller.html", true, false);
    ControllerWindow.once('ready-to-show', () => {
        ControllerWindow.show();
    })
    IndexWindow.close();
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
            fs.appendFileSync(folderPathToCheck + "\\fixtures.json", '{\n\t"success":true,\n\t"fixtures": [\n\n\t]\n}');
            event.sender.send("SettingsGetFixturesResponse", JSON.stringify({"success":false}))
        }
    }
    else {
        // then create a folder
        fs.mkdirSync(folderPathToCheck);
        event.sender.send("SettingsGetFixturesResponse", JSON.stringify({"success":false}))
    }
})

ipc.on("SettingsSaveFixtures", function(event, data) {
    // then save the fixtures to the json file
    let folderPath = path.join(app.getPath("home"), "Documents", "dmxProject");
    filePath = folderPath + "\\fixtures.json";
    fs.writeFileSync(filePath, '{\n\t"success":true,\n\t"fixtures":' + data + '\n}');
    event.sender.send("SettingsSaveFixturesResponse", true);
})

ipc.on("SettingsGetPrograms", function(event, data) {
    // then check if there is a folder in the documents called dmxProject
    let folderPathToCheck = path.join(app.getPath("home"), "Documents", "dmxProject");
    if(fs.existsSync(folderPathToCheck)) {
        // then as the folder is there then check if there is a subfolder called programs
        if(fs.existsSync(folderPathToCheck + "\\programs")) {
            // if there is then read all of the separate files in that folder
            let files = fs.readdirSync(folderPathToCheck + "\\programs");
            let programFiles = [];
            for(var i = 0; i < files.length; i++) {
                if(path.extname(files[i]) === ".json") {
                    programFiles.push(files[i]);
                }
            }
            let returnObject = {"success": true, "programs": programFiles}
            event.sender.send("SettingsGetProgramsResponse", JSON.stringify(returnObject));
        }
        else {
            // then make a new folder
            fs.mkdirSync(folderPathToCheck + "\\programs")
            event.sender.send("SettingsGetProgramsResponse", JSON.stringify({"success":false}))
        }
    }
    else {
        // then create a folder
        fs.mkdirSync(folderPathToCheck);
        event.sender.send("SettingsGetProgramsResponse", JSON.stringify({"success":false}))
    }
})

ipc.on("SettingsGetProgramFileContents", function(event, data) {
    // then get the file name
    let fileName = JSON.parse(data).fileName;
    // then as the file should still be there then just read it
    let folderPathToCheck = path.join(app.getPath("home"), "Documents", "dmxProject", "programs");
    let programFileContents = fs.readFileSync(folderPathToCheck + "\\" + fileName, "utf8");
    // then send the contents back to the controler process
    event.sender.send("SettingsGetProgramFileContentsResponse", programFileContents);

})

// THE DMX PART
ipc.on("WriteToDmxChannel", function(event, data) {
    if(fakePortUsed == false) {
        arduinoSerialPort.write(data);
    }
    else {
        console.log("FAKE-PORT USED")
    }
    console.log(data);
})