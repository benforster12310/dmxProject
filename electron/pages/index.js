var ipc = require("electron").ipcRenderer;
const dialog = require("electron").remote.dialog;

// then handle alerts and confirms
const browserWindow = require('electron').remote.getCurrentWindow()

alert = function(txt) {
    dialog.showMessageBoxSync(browserWindow, {"message": txt, "type":"question"})
}
confirm = function(txt) {
    let retVal = dialog.showMessageBoxSync(browserWindow, {"message": txt, "type":"error", "buttons": ["OK", "Cancel"], "defaultId":0, "cancelId":1})
    if(retVal == 0) {
        return true;
    }
    else {
        return false;
    }
}

// then ask the main process for the SerialPorts list
ipc.on("SerialPortsListResponse", function(event, data) {
    // then parse the json
    let responseObject = JSON.parse(data)
    document.getElementById("dmxInterfaceSelect").innerHTML = "";
    // then go through each key and then append an option element to the select list
    for(var i = 0; i < Object.keys(responseObject).length; i++) {
        let optionElement = document.createElement("option");
        let optionElementTextNode = document.createTextNode("Arduino " + responseObject[i].name + " @" + responseObject[i].port);
        optionElement.appendChild(optionElementTextNode)
        optionElement.setAttribute("value", responseObject[i].port)
        document.getElementById("dmxInterfaceSelect").appendChild(optionElement);
    }
    if(Object.keys(responseObject).length == 0) {
        let optionElement = document.createElement("option");
        let optionElementTextNode = document.createTextNode("No Devices Are Connected");
        optionElement.appendChild(optionElementTextNode)
        optionElement.setAttribute("value", null)
        document.getElementById("dmxInterfaceSelect").appendChild(optionElement);
    }
})

let refreshListBtn = document.getElementById("refreshListBtn");
refreshListBtn.addEventListener("click", getSerialDevices);

function getSerialDevices() {
    ipc.send("SerialPortsList", "");
}
getSerialDevices()

let chooseDeviceBtn = document.getElementById("chooseDeviceBtn");
chooseDeviceBtn.addEventListener("click", chooseDevice);

function chooseDevice() {
    // then get the currently selected device
    let currentDeviceText = document.getElementById("dmxInterfaceSelect").innerText;
    let currentDevicePort = document.getElementById("dmxInterfaceSelect").value;

    if(currentDevicePort == "null") {
        alert("No Devices Connected/Selected");
    }
    else {
        if(currentDevicePort="FAKE-PORT") {
            useDevice(currentDevicePort, true)
        }
        useDevice(currentDevicePort);
    }
}

function useDevice(port, isFake) {
    if(isFake) {
        ipc.send("UseFakeDevice", "");
    }
    else {
        ipc.send("UseDevice", port);
    }
}