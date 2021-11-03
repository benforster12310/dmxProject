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

var currentPageBtnId = "switchToControlBtn";
var currentOpenDiv = "controlDiv";



function update() {
    document.getElementById("switchToControlBtn").classList.remove("navBarSelected");
    document.getElementById("switchToProgrammingBtn").classList.remove("navBarSelected");
    document.getElementById("switchToSettingsBtn").classList.remove("navBarSelected");
    document.getElementById(currentPageBtnId).classList.add("navBarSelected");
    document.getElementById("controlDiv").classList.add("hidden");
    document.getElementById("programmingDiv").classList.add("hidden");
    document.getElementById("settingsDiv").classList.add("hidden");
    document.getElementById(currentOpenDiv).classList.remove("hidden");
    
}

update();

let switchToControlBtn = document.getElementById("switchToControlBtn");
switchToControlBtn.addEventListener("click", function() {
    currentPageBtnId = "switchToControlBtn";
    currentOpenDiv = "controlDiv";
    update();
});

let switchToProgrammingBtn = document.getElementById("switchToProgrammingBtn");
switchToProgrammingBtn.addEventListener("click", function() {
    currentPageBtnId = "switchToProgrammingBtn";
    currentOpenDiv = "programmingDiv";
    update();
});

let switchToSettingsBtn = document.getElementById("switchToSettingsBtn");
switchToSettingsBtn.addEventListener("click", function() {
    currentPageBtnId = "switchToSettingsBtn";
    currentOpenDiv = "settingsDiv";
    update();
});

// CONTROL SECTION CODE
////////////////////////////////////
// then load the fixtures
let fixturesArray = [];
let fixtureBeingControlled;
ipc.on("SettingsGetFixturesResponse", function(event, data) {
    let dataObject = JSON.parse(data);
    if(dataObject.success == false) {
        console.log("Error SettingsGetFixturesResponse - no file or folder, retrying");
        ipc.send("SettingsGetFixtures", "");
    }
    else {
        fixturesArray = dataObject.fixtures;
        // then make buttons for each fixture
        for(var i = 0; i < fixturesArray.length; i++) {
            let button = document.createElement("button");
            button.setAttribute("onclick", "controlDiv_useFixture(this)");
            button.setAttribute("id", i);
            let textNode = document.createTextNode(fixturesArray[i].name);
            button.appendChild(textNode);
            button.setAttribute("class", "btn button");
            document.getElementById("controlDiv_fixtureSelectorDiv").appendChild(button);
        }
    }
})
ipc.send("SettingsGetFixtures", "");


// controlDiv_useFixture
function controlDiv_useFixture(fixtureBtn) {
    fixtureBeingControlled = fixtureBtn.id;
    document.getElementById("controlDiv_fadersDiv").innerHTML = "";
    controlDiv_loadFixture(fixtureBeingControlled);
    
}

function controlDiv_loadFixture(fixtureId) {
    // then count how many colors this fixture has
    let colors = fixturesArray[fixtureId].colors;
    let numberOfColors = Object.keys(colors).length;
    for(var i = 0; i < numberOfColors; i++) {
        let colorName = Object.keys(colors)[i];
        // then create a faderDiv for the color
        let faderDiv = document.createElement("div");
        faderDiv.setAttribute("class", "faderDiv");
        // then create a button for the name of the color
        let colorNameBtn = document.createElement("button");
        colorNameBtn.setAttribute("class", "btn button fullWidth");
        let colorNameBtnTextNode = document.createTextNode(colorName);
        colorNameBtn.appendChild(colorNameBtnTextNode);
        faderDiv.appendChild(colorNameBtn);
        let brTag = document.createElement("br");
        faderDiv.appendChild(brTag)
        // then create the value indicator
        let valueIndicator = document.createElement("input");
        valueIndicator.setAttribute("type", "number");
        valueIndicator.setAttribute("min", "0");
        valueIndicator.setAttribute("max", "255");
        valueIndicator.setAttribute("class", "btn button fullWidth");
        valueIndicator.setAttribute("id", "valueIndicatorForColor_" + i);
        valueIndicator.setAttribute("onkeyup", "fixtureValueIndicatorChanged(event, this)");
        faderDiv.appendChild(valueIndicator);
        let brTag2 = document.createElement("br");
        faderDiv.appendChild(brTag2)
        let values = ["100%", "75%", "50%", "25%", "0%"];
        let valuesAsNumber = [255, 191, 127, 64, 0]
        // then create 5 buttons
        for(var x = 0; x < 5; x++) {
            let btn = document.createElement("button")
            let btnTxtNode = document.createTextNode(values[x]);
            btn.appendChild(btnTxtNode);
            btn.setAttribute("class", "btn button fullWidth");
            btn.setAttribute("onclick", "buttonClicked(" + i + ", '" + valuesAsNumber[x] + "')");
            faderDiv.appendChild(btn)
            let brTag3 = document.createElement("br");
            faderDiv.appendChild(brTag3)
        }
        // then append the faderDiv to the controlDiv_fadersDiv
        document.getElementById("controlDiv_fadersDiv").appendChild(faderDiv);
    }
}
function buttonClicked(i, value) {
    console.log(value); document.getElementById('valueIndicatorForColor_' + i).value = value; fixtureValueIndicatorChanged({'keyCode':13}, document.getElementById('valueIndicatorForColor_' + i))
}


// PROGRAMS SECTION CODE
////////////////////////////////////



// SETTINGS SECTION CODE
////////////////////////////////////
let settingsDiv_manageFixturesBtn = document.getElementById("settingsDiv_manageFixturesBtn");
settingsDiv_manageFixturesBtn.addEventListener("click", function() {
    // then call the ipc to open another window
    ipc.send("OpenManageFixturesWindow", "");
})


// FIXTURES CODE

function fixtureValueIndicatorChanged(event, element) {
    if(event.keyCode == 13) {
        let colorName = Object.keys(fixturesArray[fixtureBeingControlled].colors)[parseInt(element.id.split("valueIndicatorForColor_")[1])];
        console.log(colorName);
        // then get the channel id
        let startingChannel = fixturesArray[fixtureBeingControlled].startAddress;
        let channelId = fixturesArray[fixtureBeingControlled].colors[colorName].channel;
        let onChannel = fixturesArray[fixtureBeingControlled].onChannel;
        let onChannelValue = fixturesArray[fixtureBeingControlled].onChannelValue;
        dmxOut((onChannel + startingChannel)-1, onChannelValue);
        // then send the value to the arduino via the ipc
        dmxOut((channelId + startingChannel)-1, element.value);
    }
}
function dmxOut(channel, value) {

    let data = JSON.stringify({channel: channel, value: value});
    ipc.send("WriteToDmxChannel", data);
}
