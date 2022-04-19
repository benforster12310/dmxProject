const { statSync } = require("fs");

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
    document.getElementById("switchToProgramBtn").classList.remove("navBarSelected");
    document.getElementById("switchToSettingsBtn").classList.remove("navBarSelected");
    document.getElementById(currentPageBtnId).classList.add("navBarSelected");
    document.getElementById("controlDiv").classList.add("hidden");
    document.getElementById("programDiv").classList.add("hidden");
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

let switchToProgrammingBtn = document.getElementById("switchToProgramBtn");
switchToProgrammingBtn.addEventListener("click", function() {
    currentPageBtnId = "switchToProgramBtn";
    currentOpenDiv = "programDiv";
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
let fixturesGroupObject = {};
let fixtureIdToArrayIndexObject = {}
let dmxChannelValueObject = {};
let fixtureSliderValuesArray = [];
let fixturesGroupSliderValuesObject = {};

ipc.on("SettingsGetFixturesResponse", function(event, data) {
    let dataObject = JSON.parse(data);
    if(dataObject.success == false) {
        console.log("Error SettingsGetFixturesResponse - no file or folder, retrying");
        ipc.send("SettingsGetFixtures", "");
    }
    else {
        fixturesGroupObject = dataObject.fixturesGroup
        // then make buttons for each fixtureGroup
        for(fixtureGroup in fixturesGroupObject) {
            let button = document.createElement("button");
            button.setAttribute("onclick", "controlDiv_useFixtureGroup(this)");
            button.setAttribute("id", fixtureGroup);
            let textNode = document.createTextNode(fixtureGroup);
            button.appendChild(textNode);
            button.setAttribute("class", "btn button");
            document.getElementById("controlDiv_fixtureSelectorDiv").appendChild(button);
        }
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
        
        // then go through and map each fixtureId to an arrayIndex
        for(var i = 0; i < fixturesArray.length; i++) {
            fixtureIdToArrayIndexObject[fixturesArray[i].id] = i;
        }
        // then create a blank nested array with every fixture to show the position of the sliders for the fixtures that are not fixtureGroups
        for(var i = 0; i < fixturesArray.length; i++) {
            // then access the channel features of the i fixture
            let channelFeatures = fixturesArray[i].channelFeatures;
            // then cycle through the channelFeatures and put them into the new array
            let channelFeatureKeys = [];
            for(key in channelFeatures) {
                channelFeatureKeys.push(key);
            }
            let channelFeatureKeysObject = {};
            for(var j = 0; j < channelFeatureKeys.length; j++) {
                channelFeatureKeysObject[channelFeatureKeys[j]] = 0;
            }
            fixtureSliderValuesArray[i] = channelFeatureKeysObject;
        }
        
        // then create a blank nested array with every fixtureGroup to show the position of the sliders for the fixtureGroups
        for(fixtureGroup in fixturesGroupObject) {
            // then get the lights who are members of the fixtureGroup
            let fixtureIdsInGroup = fixturesGroupObject[fixtureGroup];
            // then get the first fixture
            let firstFixtureIndex = fixtureIdToArrayIndexObject[fixtureIdsInGroup[0]];
            let firstFixtureChannelFeatures = fixturesArray[firstFixtureIndex].channelFeatures;
            // then get the channelFeatures from the firstFixture and put the channelNumber and then the value 0 into the object
            let channelFeatureKeys = [];
            for(key in firstFixtureChannelFeatures) {
                channelFeatureKeys.push(key);
            }
            let channelFeatureKeysObject = {};
            for(var j = 0; j < channelFeatureKeys.length; j++) {
                channelFeatureKeysObject[channelFeatureKeys[j]] = 0;
            }
            fixturesGroupSliderValuesObject[fixtureGroup] = channelFeatureKeysObject;
        }
    }
})
ipc.send("SettingsGetFixtures", "");

var isFixtureGroup = false;
var fixturesArrayIndexInGroup = [];
var currentFixtureGroup = "";

// controlDiv_useFixtureGroup
function controlDiv_useFixtureGroup(fixtureGroupBtn) {
    isFixtureGroup = true;
    currentFixtureGroup = fixtureGroupBtn.id;
    // then get the lights who are members of the fixtureGroup
    let fixtureIdsInGroup = fixturesGroupObject[fixtureGroupBtn.id];
    for(var i = 0; i < fixtureIdsInGroup.length; i++) {
        fixturesArrayIndexInGroup[i] = fixtureIdToArrayIndexObject[fixtureIdsInGroup[i]];
    }
    // then get the first fixture from the fixtureArrayIndexInGroup
    document.getElementById("controlDiv_channelFeaturesDiv").innerHTML = "";
    controlDiv_loadFixture(fixturesArrayIndexInGroup[0]);
    
}
// controlDiv_useFixture
function controlDiv_useFixture(fixtureBtn) {
    isFixtureGroup = false;
    currentFixtureGroup = "";
    fixturesArrayIndexInGroup = [];
    document.getElementById("controlDiv_channelFeaturesDiv").innerHTML = "";
    controlDiv_loadFixture(fixtureBtn.id);
    
}

var currentFixtureId;
let currentFixture_onChannelState = 0;

function controlDiv_loadFixture(fixtureId) {
    currentFixtureId = fixtureId;
    // then count how many channelFeatures this fixture has
    let channelFeatures = fixturesArray[fixtureId].channelFeatures;
    for(channelFeature in channelFeatures) {
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
        let defaultNumberInputValue = 0;
        // then check if it is a fixtureGroup
        if(isFixtureGroup) {
            defaultNumberInputValue = fixturesGroupSliderValuesObject[currentFixtureGroup][channelFeature];
        }
        else {
            defaultNumberInputValue = fixtureSliderValuesArray[currentFixtureId][channelFeature];
        }
        // then check which type of channelFeature is being dealt with
        if(channelFeatureType == "OnChannel") {
            // if it is an on channel then simply put a button to turn the on channel on and off, this acts as the blackout for the individual light
            var br = document.createElement("br");
            channelFeatureDiv.appendChild(br);
            // create a button
            let onChannelButton = document.createElement("button");
            let onChannelButtonTextNode;
            if(defaultNumberInputValue == 0) {
                onChannelButtonTextNode = document.createTextNode("Turn ON");
                currentFixture_onChannelState = 0;
            }
            else {
                onChannelButtonTextNode = document.createTextNode("Turn OFF");
                currentFixture_onChannelState = 1;
            }
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
            dimmerNumberInput.setAttribute("value", defaultNumberInputValue);
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
            exactValueNumberInput.setAttribute("value", defaultNumberInputValue);
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
        // then set the values
        if(channelFeatureType == "OnChannelMainDimmer" || channelFeatureType == "Dimmer" || channelFeatureType == "ExactValueDimmer") {
            currentFixture_dimmerNumberInputValueChanged(channelFeature);
        }
        else if(channelFeatureType == "ExactValue") {
            currentFixture_exactValueNumberInputValueChanged(channelFeature);
        }
    }
}


// OnChannel Code
function currentFixture_toggleOnChannel(channelFeatureId) {
    if(currentFixture_onChannelState == 0) {
        // then turn the on channel to on (255)
        if(!isFixtureGroup) {
            fixtureSliderValuesArray[currentFixtureId][channelFeatureId] = 255;
        }
        else {
            fixturesGroupSliderValuesObject[currentFixtureGroup][channelFeatureId] = 255;
        }
        findAndWriteDmx(channelFeatureId, 255);
        currentFixture_onChannelState = 1;
        document.getElementById("currentFixture_onChannelButton" + channelFeatureId).innerHTML = "Turn OFF";
    }
    else {
        // then turn the on channel to off (0)
        if(!isFixtureGroup) {
            fixtureSliderValuesArray[currentFixtureId][channelFeatureId] = 0;
        }
        else {
            fixturesGroupSliderValuesObject[currentFixtureGroup][channelFeatureId] = 0;
        }
        findAndWriteDmx(channelFeatureId, 0);
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
        if(!isFixtureGroup) {
            fixtureSliderValuesArray[currentFixtureId][channelFeatureId] = val;
        }
        else {
            fixturesGroupSliderValuesObject[currentFixtureGroup][channelFeatureId] = val;
        }
        findAndWriteDmx(channelFeatureId, val);
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
        if(!isFixtureGroup) {
            fixtureSliderValuesArray[currentFixtureId][channelFeatureId] = val;
        }
        else {
            fixturesGroupSliderValuesObject[currentFixtureGroup][channelFeatureId] = val;
        }
        findAndWriteDmx(channelFeatureId, val);
        // then update the input
        document.getElementById("currentFixture_dimmerNumberInput" + channelFeatureId).value = val;
    }
}
function currentFixture_dimmerSetValue(channelFeatureId, val) {
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
        // then send the new value to the channel
        if(!isFixtureGroup) {
            fixtureSliderValuesArray[currentFixtureId][channelFeatureId] = val;
        }
        else {
            fixturesGroupSliderValuesObject[currentFixtureGroup][channelFeatureId] = val;
        }
        findAndWriteDmx(channelFeatureId, val);
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
        if(!isFixtureGroup) {
            fixtureSliderValuesArray[currentFixtureId][channelFeatureId] = val;
        }
        else {
            fixturesGroupSliderValuesObject[currentFixtureGroup][channelFeatureId] = val;
        }
        findAndWriteDmx(channelFeatureId, val);
    }
}
function currentFixture_exactValueSetValue(channelFeatureId, val) {
    // then check the value to make sure it is in range
    if(val > -1 && val <= 255) {
        // then send the new value to the channel
        if(!isFixtureGroup) {
            fixtureSliderValuesArray[currentFixtureId][channelFeatureId] = val;
        }
        else {
            fixturesGroupSliderValuesObject[currentFixtureGroup][channelFeatureId] = val;
        }
        findAndWriteDmx(channelFeatureId, val);
        // then update the input
        document.getElementById("currentFixture_exactValueNumberInput" + channelFeatureId).value = val;
    }
}



// PROGRAMS SECTION CODE
////////////////////////////////////
var programFileNamesArray = [];
var programNamesArray = [];
var programObject = {}
ipc.on("SettingsGetProgramsResponse", function(event, data) {
    let dataObject = JSON.parse(data);
    if(dataObject.success == false) {
        console.log("Error SettingsGetProgramsResponse - no file or folder, retrying");
        ipc.send("SettingsGetPrograms", "");
    }
    else {
        if(dataObject.success == true) {
            // then put the fileNames into an array
            programFileNamesArray = dataObject.programs;
            // then cycle through the array and make a button
            for(var i = 0; i < programFileNamesArray.length; i++) {
                let name = programFileNamesArray[i].split(".json")[0];
                programNamesArray[i] = name
                let button = document.createElement("button");
                button.setAttribute("onclick", "programsDiv_selectProgram(this)");
                button.setAttribute("id", i);
                let textNode = document.createTextNode(name);
                button.appendChild(textNode);
                button.setAttribute("class", "btn button");
                document.getElementById("programsDiv_programSelectorDiv").appendChild(button);
            }
        }
    }
});
ipc.send("SettingsGetPrograms", "");

function programsDiv_selectProgram(programButton) {
    let programFileName = programFileNamesArray[programButton.id];
    // then send a request to the ipc to read the contents of that file and return them to this process
    ipc.send("SettingsGetProgramFileContents", JSON.stringify({"fileName": programFileName}));
}

ipc.on("SettingsGetProgramFileContentsResponse", function(event, data) {
    // then parse the data
    let dataObject = JSON.parse(data);
    if(dataObject.success == true) {
        // then load the entire contents into the programObject variable
        programObject = dataObject;
        // then make the display for the user
        programsDiv_displayProgramInterface();
    }
})

let loopOnFinish = false;
let syncToTime = false;
let numberOfScenes = 0;
let currentScene = 0;

function programsDiv_displayProgramInterface() {
    document.getElementById("programsDiv_currentProgramDiv").innerHTML = "";
    currentScene = 0;
    loopOnFinish = programObject.loopOnFinish;
    syncToTime = programObject.syncToTime;
    numberOfScenes = programObject.scenes.length;
    // then make the nextScene and previousScene buttons and put them in an inline div with the scene number in a inputElement
    // make the previousScene button
    let previousSceneButton = document.createElement("button");
    previousSceneButton.setAttribute("onclick", "programsDiv_previousScene()");
    previousSceneButton.setAttribute("class", "btn button thirdWidth tenPercentHeight");
    let previousSceneButtonTextNode = document.createTextNode("Previous Scene");
    previousSceneButton.appendChild(previousSceneButtonTextNode);
    document.getElementById("programsDiv_currentProgramDiv").appendChild(previousSceneButton);
    // make the indicator
    let currentSceneIndicator = document.createElement("input");
    currentSceneIndicator.setAttribute("type", "number");
    currentSceneIndicator.setAttribute("class", "numberInput thirdWidth tenPercentHeight");
    currentSceneIndicator.setAttribute("id", "programsDiv_currentSceneIndicator");
    currentSceneIndicator.setAttribute("min", "0");
    currentSceneIndicator.setAttribute("value", currentScene);
    currentSceneIndicator.setAttribute("onchange", "programsDiv_currentSceneIndicatorValueChanged()");
    document.getElementById("programsDiv_currentProgramDiv").appendChild(currentSceneIndicator);
    // make the nextScene button
    let nextSceneButton = document.createElement("button");
    nextSceneButton.setAttribute("onclick", "programsDiv_nextScene()");
    nextSceneButton.setAttribute("class", "btn button thirdWidth tenPercentHeight");
    let nextSceneButtonTextNode = document.createTextNode("Next Scene");
    nextSceneButton.appendChild(nextSceneButtonTextNode);
    document.getElementById("programsDiv_currentProgramDiv").appendChild(nextSceneButton);
    // then check if the program can be synced to time
    if(syncToTime == true) {
        let br = document.createElement("br");
        document.getElementById("programsDiv_currentProgramDiv").appendChild(br);
        let br2 = document.createElement("br");
        document.getElementById("programsDiv_currentProgramDiv").appendChild(br2);
        // then as it can be synced to time provide a button to start/stop the program and a timer in miliseconds and then another timer next to it counting down the time until the next scene change
        let startStopButton = document.createElement("button");
        startStopButton.setAttribute("onclick", "programsDiv_startStopSyncToTime()");
        startStopButton.setAttribute("class", "btn button thirdWidth tenPercentHeight");
        startStopButton.setAttribute("id", "programsDiv_startStopSyncToTimeButton");
        let startStopButtonTextNode = document.createTextNode("Start Synced To Time");
        startStopButton.appendChild(startStopButtonTextNode);
        document.getElementById("programsDiv_currentProgramDiv").appendChild(startStopButton);
        // then make the duration timer
        let durationIndicatorElement = document.createElement("input");
        durationIndicatorElement.setAttribute("type", "number");
        durationIndicatorElement.setAttribute("class", "numberInput thirdWidth tenPercentHeight");
        durationIndicatorElement.setAttribute("id", "programsDiv_syncToTimeDurationIndicator");
        durationIndicatorElement.setAttribute("min", "0");
        durationIndicatorElement.setAttribute("value", "0");
        durationIndicatorElement.setAttribute("onchange", "programsDiv_syncToTimeDurationIndicatorValueChanged()");
        document.getElementById("programsDiv_currentProgramDiv").appendChild(durationIndicatorElement);
        // then make the countdown timer until scene change
        let countdownSceneChangeIndicatorElement = document.createElement("input");
        countdownSceneChangeIndicatorElement.setAttribute("type", "number");
        countdownSceneChangeIndicatorElement.setAttribute("class", "numberInput thirdWidth tenPercentHeight");
        countdownSceneChangeIndicatorElement.setAttribute("id", "programsDiv_syncToTimeCountdownSceneChangeIndicator");
        countdownSceneChangeIndicatorElement.setAttribute("min", "0");
        countdownSceneChangeIndicatorElement.setAttribute("value", "0");
        countdownSceneChangeIndicatorElement.setAttribute("readonly", "true");
        document.getElementById("programsDiv_currentProgramDiv").appendChild(countdownSceneChangeIndicatorElement);
    }
    // then regardless if the program can be synced to time or not provide an option for the scenes to be automatically skipped at an interval chosen by the user
    let br = document.createElement("br");
    document.getElementById("programsDiv_currentProgramDiv").appendChild(br);
    let br2 = document.createElement("br");
    document.getElementById("programsDiv_currentProgramDiv").appendChild(br2);
    // then make a start stop button for the skipAfterInterval
    let startStopButton = document.createElement("button");
    startStopButton.setAttribute("onclick", "programsDiv_startStopSkipAfterInterval()");
    startStopButton.setAttribute("class", "btn button halfWidth tenPercentHeight");
    startStopButton.setAttribute("id", "programsDiv_startStopSkipAfterIntervalButton");
    let startStopButtonTextNode = document.createTextNode("Start Skip After Interval");
    startStopButton.appendChild(startStopButtonTextNode);
    document.getElementById("programsDiv_currentProgramDiv").appendChild(startStopButton);
    // then make the number input to set the interval for skipping the scenes
    let intervalInputElement = document.createElement("input");
    intervalInputElement.setAttribute("type", "number");
    intervalInputElement.setAttribute("class", "numberInput halfWidth tenPercentHeight");
    intervalInputElement.setAttribute("id", "programsDiv_skipAfterIntervalInput");
    intervalInputElement.setAttribute("min", "0");
    intervalInputElement.setAttribute("value", "0");
    intervalInputElement.setAttribute("onchange", "programsDiv_skipAfterIntervalInputValueChanged()");
    document.getElementById("programsDiv_currentProgramDiv").appendChild(intervalInputElement);
}



// SETTINGS SECTION CODE
////////////////////////////////////
let settingsDiv_manageFixturesBtn = document.getElementById("settingsDiv_manageFixturesBtn");
settingsDiv_manageFixturesBtn.addEventListener("click", function() {
    // then call the ipc to open another window
    ipc.send("OpenManageFixturesWindow", "");
})
let settingsDiv_resetDmxBtn = document.getElementById("settingsDiv_resetDmxBtn");
settingsDiv_resetDmxBtn.addEventListener("click", function() {
    // then send 0 to all of the dmx channels
    for(var i = 1; i <= 255; i++) {
        dmxSend(i, 0);
    }
})

// BLACKOUT CODE
let blackoutToggled = false;
function blackout() {
    if(blackoutToggled == false) {
        // then toggle blackout
        blackoutToggled = true;
        document.getElementById("mainWindow_blackoutBtn").innerHTML = "BLACKOUT: ON";
        // then send 0 to the dmx channels that have been interacted with
        for(channel in dmxChannelValueObject) {
            dmxSend(channel, 0);
        }
    }
    else if(blackoutToggled == true) {
        // then loop through the dmxChannelValueObject and send the value to the key
        for(channel in dmxChannelValueObject) {
            dmxSend(channel, dmxChannelValueObject[channel]);
        }
        // then untoggle blackout
        blackoutToggled = false;
        document.getElementById("mainWindow_blackoutBtn").innerHTML = "BLACKOUT: OFF";
    }
} 


// GENERAL CODE
function findAndWriteDmx(channelFeature, value) {
    // then check if it is a fixtureGroup
    if(isFixtureGroup) {
        // then create a loop to repeat for each fixture in the fixturesArrayIndexInGroup
        for(var i = 0; i < fixturesArrayIndexInGroup.length; i++) {
            // then get the start channel of the fixture
            let startAddress = fixturesArray[fixturesArrayIndexInGroup[i]].startAddress;
            let channelFeatureReduced = channelFeature-1;
            // then send the correct channel and the value to the beforeBlackoutDmxSend
            beforeBlackoutDmxSend(startAddress+channelFeatureReduced, value);

        }
    }
    else {
        // then get the start channel of the fixture
        let startAddress = fixturesArray[currentFixtureId].startAddress;
        let channelFeatureReduced = channelFeature-1;
        // then send the correct channel and the value to the beforeBlackoutDmxSend function
        beforeBlackoutDmxSend(startAddress+channelFeatureReduced, value);
        
    }
}
function beforeBlackoutDmxSend(channel, value) {
    dmxChannelValueObject[channel] = value;
    if(!blackoutToggled) {
        dmxSend(channel, value);
    }
}

function dmxSend(channel, value) {
    let data = JSON.stringify({c: parseInt(channel), v: parseInt(value)});
    ipc.send("WriteToDmxChannel", data);
}
