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
    let currentDeviceText = document.getElementById("dmxInterfaceSelect").innerHTML;
    let currentDevicePort = document.getElementById("dmxInterfaceSelect").value;

    // then send a request to the main process to make sure that the device is still available
    ipc.on("IsConnectedResponse", function(event, data) {
        if(data) {
            // then the device is still connected so then proceed
            useDevice()
        }
        else {
            alert("The Device Is No Longer Connected, Please Refresh The List And Try Again");
            getSerialDevices()
        }
    })
    ipc.send("IsConnected", currentDevicePort)
}

function useDevice() {
    alert("Using");
}