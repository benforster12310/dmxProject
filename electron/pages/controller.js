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
            onChannelButton.setAttribute("id", "currentFixture_onChannelButton" + channelFeature);
            channelFeatureDiv.appendChild(onChannelButton);

        }
        else if(channelFeatureType == "OnChannelMainDimmer" || channelFeatureType == "Dimmer" || channelFeatureType == "ExactValueDimmer") {
            // if it is a dimmer then simply put a range of values from 0, 25, 50, 75 and 100 to dim the light, also provide a number input that displays the current value and a range slider to allow the user to update with precision the value
            var br = document.createElement("br");
            channelFeatureDiv.appendChild(br);
            // create a number input to display the range
            let dimmerNumberInput = document.createElement("input");
            dimmerNumberInput.setAttribute("type", "number");
            dimmerNumberInput.setAttribute("min", "0");
            dimmerNumberInput.setAttribute("max", "255");
            dimmerNumberInput.setAttribute("value", "0");
            dimmerNumberInput.setAttribute("id", "currentFixture_dimmerNumberInput" + channelFeature);
            dimmerNumberInput.setAttribute("class", "dimmerNumberInput fullWidth");
            dimmerNumberInput.setAttribute("onchange", "currentFixture_dimmerNumberInputValueChanged(" + channelFeature + ")");
            channelFeatureDiv.appendChild(dimmerNumberInput);
            var br = document.createElement("br");
            channelFeatureDiv.appendChild(br);
            // create a slider to allow the user to edit the range
            let dimmerRangeSlider = document.createElement("input");
            dimmerRangeSlider.setAttribute("type", "range");
            dimmerRangeSlider.setAttribute("min", "0");
            dimmerRangeSlider.setAttribute("max", "255");
            dimmerRangeSlider.setAttribute("value", "0");
            dimmerRangeSlider.setAttribute("id", "currentFixture_dimmerRangeSlider" + channelFeature);
            dimmerRangeSlider.setAttribute("class", "dimmerRangeSlider fullWidth");
            dimmerRangeSlider.setAttribute("oninput", "currentFixture_dimmerRangeSliderValueChanged(" + channelFeature + ")");
            channelFeatureDiv.appendChild(dimmerRangeSlider);
            // then create 5 buttons for 0%, 25%, 50%, 75%, 100%
            let buttons = [["100%", 255], ["75%", 191], ["50%", 127], ["25%", 64], ["0%", 0]];
            // then check if it is a ExactValueDimmer
            if(channelFeatureType == "ExactValueDimmer") {
                // if it is then replace the buttons with the values that the user has chosen
                buttons = channelFeatures[channelFeature].values;
            }
            for(var i = 0; i < buttons.length; i++) {
                var br = document.createElement("br");
                channelFeatureDiv.appendChild(br);
                let button = document.createElement("button");
                let buttonTextNode = document.createTextNode(buttons[i][0]);
                button.appendChild(buttonTextNode);
                button.setAttribute("class", "button fullWidth floatLeft");
                button.setAttribute("onclick", "currentFixture_dimmerSetValue(" + channelFeature + ", " + buttons[i][1] + ")");
                channelFeatureDiv.appendChild(button)
            }
        }
        else if(channelFeatureType == "ExactValue") {
            // if it is an exact value then put a number input and then provide buttons as those that are in the values property of the channelFeature
            var br = document.createElement("br");
            channelFeatureDiv.appendChild(br);
            // create a number input to display the range
            let exactValueNumberInput = document.createElement("input");
            exactValueNumberInput.setAttribute("type", "number");
            exactValueNumberInput.setAttribute("min", "0");
            exactValueNumberInput.setAttribute("max", "255");
            exactValueNumberInput.setAttribute("value", "0");
            exactValueNumberInput.setAttribute("id", "currentFixture_exactValueNumberInput" + channelFeature);
            exactValueNumberInput.setAttribute("class", "dimmerNumberInput fullWidth");
            exactValueNumberInput.setAttribute("onchange", "currentFixture_exactValueNumberInputValueChanged(" + channelFeature + ")");
            channelFeatureDiv.appendChild(exactValueNumberInput);
            // then get the buttons that need to be created from the values section of the channel features
            let buttons = channelFeatures[channelFeature].values;
            for(var i = 0; i < buttons.length; i++) {
                var br = document.createElement("br");
                channelFeatureDiv.appendChild(br);
                let button = document.createElement("button");
                let buttonTextNode = document.createTextNode(buttons[i][0]);
                button.appendChild(buttonTextNode);
                button.setAttribute("class", "button fullWidth floatLeft");
                button.setAttribute("onclick", "currentFixture_exactValueSetValue(" + channelFeature + ", " + buttons[i][1] + ")");
                channelFeatureDiv.appendChild(button)
            }
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
// OnChannelMainDimmer Code & Dimmer Code
function currentFixture_dimmerNumberInputValueChanged(channelFeatureId) {
    // then get the input
    let val = document.getElementById("currentFixture_dimmerNumberInput" + channelFeatureId).value;
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
        // then send the new value to the channel
        currentFixtureValues[channelFeatureId-1] = val;
        dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], val);
        // then update the slider
        document.getElementById("currentFixture_dimmerRangeSlider" + channelFeatureId).value = val;
    }
}
function currentFixture_dimmerRangeSliderValueChanged(channelFeatureId) {
    // then get the slider
    let val = document.getElementById("currentFixture_dimmerRangeSlider" + channelFeatureId).value;
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
        // then send the new value to the channel
        currentFixtureValues[channelFeatureId-1] = val;
        dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], val);
        // then update the input
        document.getElementById("currentFixture_dimmerNumberInput" + channelFeatureId).value = val;
    }
}
function currentFixture_dimmerSetValue(channelFeatureId, val) {
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
       // then send the new value to the channel
       currentFixtureValues[channelFeatureId-1] = val;
       dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], val);
       // then update the input
       document.getElementById("currentFixture_dimmerNumberInput" + channelFeatureId).value = val;
       // then update the slider
       document.getElementById("currentFixture_dimmerRangeSlider" +channelFeatureId).value = val;
    }
}

// ExactValue Code
function currentFixture_exactValueNumberInputValueChanged(channelFeatureId) {
    // then get the input
    let val = document.getElementById("currentFixture_exactValueNumberInput" + channelFeatureId).value;
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
        // then send the new value to the channel
        currentFixtureValues[channelFeatureId-1] = val;
        dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], val);
    }
}
function currentFixture_exactValueSetValue(channelFeatureId, val) {
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
        // then send the new value to the channel
        currentFixtureValues[channelFeatureId-1] = val;
        dmxSend(Object.keys(fixturesArray[currentFixtureId].channelFeatures)[channelFeatureId-1], val);
        // then update the input
        document.getElementById("currentFixture_exactValueNumberInput" + channelFeatureId).value = val;
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
