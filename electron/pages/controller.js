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
        console.log(fixturesArray);
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
    document.getElementById("controlDiv_channelFeaturesDiv").innerHTML = "";
    controlDiv_loadFixture(fixtureBeingControlled);
    
}

var currentFixtureId;

function controlDiv_loadFixture(fixtureId) {
    currentFixtureId = fixtureId;
    // then count how many channelFeatures this fixture has
    let channelFeatures = fixturesArray[fixtureId].channelFeatures;
    console.log(channelFeatures);
    for(channelFeature in channelFeatures) {
        console.log(channelFeature);
        let channelFeatureChannel = Object.keys(channelFeatures)[i];
        let channelFeatureName = channelFeatures[channelFeature].name;
        let channelFeatureType = channelFeatures[channelFeature].type;
        // then create a div with the channelFeatureName as the title
        let channelFeatureDiv = document.createElement("div");
        channelFeatureDiv.setAttribute("class", "channelFeatureDiv")
        let channelFeatureNameBtn = document.createElement("button");
        let channelFeatureNameBtnTextNode = document.createTextNode(channelFeatureName);
        channelFeatureNameBtn.appendChild(channelFeatureNameBtnTextNode);
        channelFeatureNameBtn.setAttribute("class", "button fullWidth");
        channelFeatureDiv.appendChild(channelFeatureNameBtn)
        // then check which type of channelFeature is being dealt with
        if(channelFeatureType == "OnChannel") {
            // if it is an on channel then simply put a button to turn the on channel on and off, this acts as the blackout for the individual light
            var br = document.createElement("br");
            channelFeatureDiv.appendChild(br);
            // create a button
            let onChannelButton = document.createElement("button");
            let onChannelButtonTextNode = document.createTextNode("Turn ON");
            onChannelButton.appendChild(onChannelButtonTextNode);
            onChannelButton.setAttribute("class", "button fullWidth");
            onChannelButton.setAttribute("onclick", "currentFixture_toggleOnChannel(" + channelFeature + ")");
            onChannelButton.setAttribute("id", "currentFixture_onChannelButton" + channelFeature + ")");
            channelFeatureDiv.appendChild(onChannelButton);

        }
        else if(channelFeatureType == "OnChannelMainDimmer") {
            // if it is an on channel then simply put a range of values from 0, 25, 50, 75 and 100 to dim the light, also provide a number input that displays the current value and a range slider to allow the user to update with precision the value
            var br = document.createElement("br");
            channelFeatureDiv.appendChild(br);
            // create a number input to display the range
            let onChannelMainDimmerNumberInput = document.createElement("input");
            onChannelMainDimmerNumberInput.setAttribute("type", "number");
            onChannelMainDimmerNumberInput.setAttribute("min", "0");
            onChannelMainDimmerNumberInput.setAttribute("max", "255");
            onChannelMainDimmerNumberInput.setAttribute("value", "0");
            onChannelMainDimmerNumberInput.setAttribute("id", "currentFixture_onChannelMainDimmerNumberInput");
            onChannelMainDimmerNumberInput.setAttribute("class", "dimmerNumberInput fullWidth");
            onChannelMainDimmerNumberInput.setAttribute("onchange", "currentFixture_onChannelMainDimmerNumberInputValueChanged(" + channelFeature + ")");
            channelFeatureDiv.appendChild(onChannelMainDimmerNumberInput);
            var br = document.createElement("br");
            channelFeatureDiv.appendChild(br);
            // create a slider to allow the user to edit the range
            let onChannelMainDimmerRangeSlider = document.createElement("input");
            onChannelMainDimmerRangeSlider.setAttribute("type", "range");
            onChannelMainDimmerRangeSlider.setAttribute("min", "0");
            onChannelMainDimmerRangeSlider.setAttribute("max", "255");
            onChannelMainDimmerRangeSlider.setAttribute("value", "0");
            onChannelMainDimmerRangeSlider.setAttribute("id", "currentFixture_onChannelMainDimmerRangeSlider");
            onChannelMainDimmerRangeSlider.setAttribute("class", "dimmerRangeSlider fullWidth");
            onChannelMainDimmerRangeSlider.setAttribute("oninput", "currentFixture_onChannelMainDimmerRangeSliderValueChanged(" + channelFeature + ")");
            channelFeatureDiv.appendChild(onChannelMainDimmerRangeSlider);
            // then create 5 buttons for 0%, 25%, 50%, 75%, 100%
            let buttons = [["100%", 255], ["75%", 191], ["50%", 127], ["25%", 64], ["0%", 0]];
            for(var i = 0; i < buttons.length; i++) {
                var br = document.createElement("br");
                channelFeatureDiv.appendChild(br);
                let button = document.createElement("button");
                let buttonTextNode = document.createTextNode(buttons[i][0]);
                button.appendChild(buttonTextNode);
                button.setAttribute("class", "button fullWidth floatLeft");
                button.setAttribute("onclick", "currentFixture_onChannelMainDimmerSetValue(" + channelFeature + ", " + buttons[i][1] + ")");
                channelFeatureDiv.appendChild(button)
            }

        }
        else if(channelFeatureType == "Dimmer") {

        }
        else if(channelFeatureType == "ExactValue") {

        }
        // then append the channelFeatureDiv to the controlDiv_channelFeaturesDiv
        document.getElementById("controlDiv_channelFeaturesDiv").appendChild(channelFeatureDiv)
    }
}

var currentFixtureValues = [];

// OnChannel Code
let currentFixture_onChannelState = 0;
function currentFixture_toggleOnChannel(channelFeatureId) {
    if(currentFixture_onChannelState == 0) {
        // then turn the on channel to on (255)
        currentFixtureValues[channelFeatureId-1] = 255;
        dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], 255);
        currentFixture_onChannelState = 1;
        document.getElementById("currentFixture_onChannelButton" + channelFeatureId).innerHTML = "Turn OFF";
    }
    else {
        // then turn the on channel to off (0)
        currentFixtureValues[channelFeatureId-1] = 0;
        dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], 0);
        currentFixture_onChannelState = 0;
        document.getElementById("currentFixture_onChannelButton" + channelFeatureId).innerHTML = "Turn ON";
    }
}
// OnChannelMainDimmer Code
function currentFixture_onChannelMainDimmerNumberInputValueChanged(channelFeatureId) {
    // then get the input
    let val = document.getElementById('currentFixture_onChannelMainDimmerNumberInput').value;
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
        // then send the new value to the channel
        currentFixtureValues[channelFeatureId-1] = val;
        dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], val);
        // then update the slider
        document.getElementById("currentFixture_onChannelMainDimmerRangeSlider").value = val;
    }
}
function currentFixture_onChannelMainDimmerRangeSliderValueChanged(channelFeatureId) {
    // then get the slider
    let val = document.getElementById('currentFixture_onChannelMainDimmerRangeSlider').value;
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
        // then send the new value to the channel
        currentFixtureValues[channelFeatureId-1] = val;
        dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], val);
        // then update the input
        document.getElementById("currentFixture_onChannelMainDimmerNumberInput").value = val;
    }
}
function currentFixture_onChannelMainDimmerSetValue(channelFeatureId, val) {
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
       // then send the new value to the channel
       currentFixtureValues[channelFeatureId-1] = val;
       dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], val);
       // then update the input
       document.getElementById("currentFixture_onChannelMainDimmerNumberInput").value = val;
       // then update the slider
       document.getElementById("currentFixture_onChannelMainDimmerRangeSlider").value = val;
    }
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

// GENERAL CODE
function dmxSend(channel, value) {
    let data = JSON.stringify({c: parseInt(channel), v: parseInt(value)});
    ipc.send("WriteToDmxChannel", data);
}
