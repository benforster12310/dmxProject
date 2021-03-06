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

// then define the ChannelFeature class
class ChannelFeature {
    constructor(channel, name, featureType, userOptions, userOptionsValues) {
        this.featureType = featureType;
        this.userOptions = userOptions;
        this.userOptionsValues = userOptionsValues;
        this.channel = channel;
        this.name = name;
    }
}

// then fetch all of the fixtures
ipc.on("SettingsGetFixturesResponse", function(event, data) {
    let dataObject = JSON.parse(data);
    if(dataObject.success == true) {
        // then call the listFixtures function
        listFixtures(dataObject);
    }
    else {
        // then try again
        console.log("Error SettingsGetFixturesResponse, fixtures file or folder does not exist, retrying");
        ipc.send("SettingsGetFixtures", "");
    }
});
ipc.send("SettingsGetFixtures", "");

var fixturesArray = null;
var fixturesArrayLength

let isEditingFixture = false;

let channelFeaturesObject = {};
let fixtureId = 0;

function listFixtures(dataObject) {
    // then look inside the dataObject for the fixtures object and count them
    // then check if the fixtures key exists
    if(dataObject.hasOwnProperty("fixtures")) {
        // then count the number of fixtures in here
        fixturesArray = dataObject.fixtures
        fixturesArrayLength = fixturesArray.length;
        // then go through the fixtures and then create a button for each fixture
        for(var i = 0; i < fixturesArrayLength; i++) {
            let button = document.createElement("button");
            button.setAttribute("id", i);
            let buttonTextNode = document.createTextNode(fixturesArray[i].name);
            button.appendChild(buttonTextNode);
            button.setAttribute("class", "btn button fullWidth");
            document.getElementById("fixturesDiv").appendChild(button);
            button.setAttribute("onclick", "editFixture(" + i + ")");
        }
    }
}


// CREATE FIXTURE
function createFixture() {
    document.getElementById("fixturesDiv").classList.add("hidden");
    document.getElementById("createFixtureDiv").classList.remove("hidden");
}

function createFixtureDiv_create() {
    // then create the fixture object
    let fixture = {}
    fixture.name = document.getElementById("createFixtureDiv_fixtureName").value
    fixture.startAddress = parseInt(document.getElementById("createFixtureDiv_startAddress").value);
    fixture.endAddress = parseInt(document.getElementById("createFixtureDiv_endAddress").value);
    fixture.channelFeatures = channelFeaturesObject;
    fixturesArray[fixturesArray.length] = fixture;
    // then send it back to the ipc to write to the fixtures file
    ipc.on("SettingsSaveFixturesResponse", function(event, data) {
        if(data == true) {
            alert("Saved");
            document.getElementById("createFixtureDiv").classList.add("hidden");
            document.getElementById("fixturesDiv").classList.remove("hidden");
            browserWindow.reload();
        }
        else {
            alert("Error Saving, Please Try Again")
        }
    });
    ipc.send("SettingsSaveFixtures", JSON.stringify(fixturesArray));
}

function createFixtureDiv_updateChannelFeatures() {
    // then display the channelFeatures as a button for each one
    document.getElementById("createFixtureDiv_channelFeaturesDiv").innerHTML = '<button class="btn button fullWidth" onclick="createFixtureDiv_addChannelFeature()">Add Channel Feature</button><br/><br/>';
    for(var i = 0; i < Object.keys(channelFeaturesObject).length; i++) {
        let button = document.createElement("button");
        button.setAttribute("class", "btn button fullWidth");
        let buttonTextNode = document.createTextNode(Object.keys(channelFeaturesObject)[i]);
        button.appendChild(buttonTextNode);
        button.setAttribute("onclick", "createFixtureDiv_removeChannelFeature(" + i + ")");
        document.getElementById("createFixtureDiv_channelFeaturesDiv").appendChild(button);
    }
}

function createFixtureDiv_addChannelFeature() {
    // then hide the editFixtureDiv and open the addChannelFeatureDiv
    document.getElementById("createFixtureDiv").classList.add("hidden");
    document.getElementById("addChannelFeatureDiv").classList.remove("hidden");
}

function createFixtureDiv_removeChannelFeature(featureId) {
    if(confirm("Are You Sure That You Want To Remove The Channel Feature '" + Object.keys(channelFeaturesObject)[featureId] + "' From The Fixture") == true) {
        // then delete the channelFeature
        delete channelFeaturesObject[Object.keys(channelFeaturesObject)[featureId]];
        // then update the channelFeatures
        createFixtureDiv_updateChannelFeatures();
    }
}

// EDIT FIXTURE SECTION

// edit fixture function
function editFixture(fixtureIdFromBtn) {
    fixtureId = fixtureIdFromBtn;
    isEditingFixture = true;
    let fixture = fixturesArray[fixtureId];
    // then fill the fields in
    document.getElementById("editFixtureDiv_fixtureName").value = fixture.name;
    document.getElementById("editFixtureDiv_startAddress").value = fixture.startAddress;
    document.getElementById("editFixtureDiv_endAddress").value = fixture.endAddress;
    channelFeaturesObject = fixture.channelFeatures;
    editFixtureDiv_updateChannelFeatures();
    document.getElementById("fixturesDiv").classList.add("hidden");
    document.getElementById("editFixtureDiv").classList.remove("hidden");
}

function editFixtureDiv_addChannelFeature() {
    // then hide the editFixtureDiv and open the addChannelFeatureDiv
    document.getElementById("editFixtureDiv").classList.add("hidden");
    document.getElementById("addChannelFeatureDiv").classList.remove("hidden");
}

function editFixtureDiv_removeChannelFeature(featureId) {
    if(confirm("Are You Sure That You Want To Remove The Channel Feature '" + Object.keys(channelFeaturesObject)[featureId] + "' From The Fixture") == true) {
        // then delete the channelFeature
        delete channelFeaturesObject[Object.keys(channelFeaturesObject)[featureId]];
        // then update the channelFeatures
        editFixtureDiv_updateChannelFeatures();
    }
}

function editFixtureDiv_updateChannelFeatures() {
    // then display the channel features as a button each
    document.getElementById("editFixtureDiv_channelFeaturesDiv").innerHTML = '<button class="btn button fullWidth" onclick="editFixtureDiv_addChannelFeature()">Add Channel Feature</button><br/><br/>';
    for(var i = 0; i < Object.keys(channelFeaturesObject).length; i++) {
        let button = document.createElement("button");
        button.setAttribute("class", "btn button fullWidth");
        let buttonTextNode = document.createTextNode(Object.keys(channelFeaturesObject)[i]);
        button.appendChild(buttonTextNode);
        button.setAttribute("onclick", "editFixtureDiv_removeChannelFeature(" + i + ")");
        document.getElementById("editFixtureDiv_channelFeaturesDiv").appendChild(button);
    }
}

function editFixtureDiv_update() {
    // then create the fixture object
    let fixture = {}
    fixture.name = document.getElementById("editFixtureDiv_fixtureName").value
    fixture.startAddress = parseInt(document.getElementById("editFixtureDiv_startAddress").value);
    fixture.endAddress = parseInt(document.getElementById("editFixtureDiv_endAddress").value);
    fixture.channelFeatures = channelFeatures
    fixturesArray[fixtureId] = fixture;
    // then send it back to the ipc to write to the fixtures file
    ipc.on("SettingsSaveFixturesResponse", function(event, data) {
        if(data == true) {
            alert("Saved");
            document.getElementById("editFixtureDiv").classList.add("hidden");
            document.getElementById("fixturesDiv").classList.remove("hidden");
        }
        else {
            alert("Error Saving, Please Try Again")
        }
    });
    ipc.send("SettingsSaveFixtures", JSON.stringify(fixturesArray));
}

function editFixtureDiv_delete() {
    if(confirm("You Are About To Delete This Fixture, Are You Sure That You Want To Proceed As This Cannot Be Undone") == true) {
        // then delete the fixture from the fixturesArray and then write the fixturesArray to the json file
        let del = fixturesArray.splice(fixtureId, 1);
        ipc.on("SettingsSaveFixturesResponse", function(event, data) {
            if(data == true) {
                alert("Saved");
                document.getElementById("editFixtureDiv").classList.add("hidden");
                document.getElementById("fixturesDiv").classList.remove("hidden");
                browserWindow.reload();
            }
            else {
                alert("Error Saving, Please Try Again")
            }
        });
        ipc.send("SettingsSaveFixtures", JSON.stringify(fixturesArray));
    }
}

// addChannelFeatureDiv

function addChannelFeatureDiv_channelFeatureTypeSelectorChanged(elmnt) {
    // then check which option is selected
    // PAUSED DUE TO NOT ACTUALLY GETTING ME ANY CLOSER TO HAVING A BASIC WORKING PROTOTYPE - WILL BE IMPLEMENTED LATER
}

function addChannelFeatureDiv_addChannelFeature() {
    // then get all of the data and collate it into a new ChannelFeature
    let channelFeatureChannelNo = document.getElementById("addChannelFeatureDiv_channelFeatureChannelNo").value;
    let channelFeatureObject = new ChannelFeature(parseInt(document.getElementById("addChannelFeatureDiv_channelFeatureChannelNo").value), document.getElementById("addChannelFeatureDiv_channelFeatureName").value, document.getElementById("addChannelFeatureDiv_channelFeatureTypeSelector").value, parseInt(document.getElementById("addColorDiv_colorDmxChannel").value), document.getElementById("addColorDiv_dimmableViaOnChannel").checked);
    // then if isEditingFixture is set to false
    if(isEditingFixture == false) {
        channelFeaturesObject[channelFeatureChannelNo] = channelFeatureObject;
        createFixtureDiv_updateChannelFeatures();
        document.getElementById("createFixtureDiv").classList.remove("hidden");
    }
    else {
        // then add the ChannelFeature to the channelFeaturesObject
        channelFeaturesObject[channelFeatureChannelNo] = channelFeatureObject;
        editFixtureDiv_updateChannelFeatures();
        document.getElementById("editFixtureDiv").classList.remove("hidden");
    }
    document.getElementById("addChannelFeatureDiv").classList.add("hidden");
    document.getElementById("addChannelFeatureDiv_channelFeatureName").value = "";
    document.getElementById("addChannelFeatureDiv_channelFeatureChannelNo").value = "";
    document.getElementById("addChannelFeatureDiv_channelFeatureTypeSelector").selectedIndex = 0;
    document.getElementById("addChannelFeatureDiv_channelValues").value = "";
    document.getElementById("addChannelFeatureDiv_colorDmxChannel").value = "";
    document.getElementById("addChannelFeatureDiv_dimmableViaOnChannel").checked = false;
}