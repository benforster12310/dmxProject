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

// then define the Color class
class Color {
    constructor(offValue, minValue, maxValue, colorChannel, dimmableViaOnChannel) {
        this.off = offValue;
        this.min = minValue;
        this.max = maxValue;
        this.channel = colorChannel;
        this.dimmableViaOnChannel = dimmableViaOnChannel;
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

var fixturesObject = null;
var fixturesObjectLength

let isEditingFixture = false;

let colorsObject = {};
let fixtureId = 0;

function listFixtures(dataObject) {
    // then look inside the dataObject for the fixtures object and count them
    // then check if the fixtures key exists
    if(dataObject.hasOwnProperty("fixtures")) {
        // then count the number of fixtures in here
        fixturesObject = dataObject.fixtures
        fixturesObjectLength = Object.keys(fixturesObject).length;
        // then go through the fixtures and then create a button for each fixture
        for(var i = 0; i < fixturesObjectLength; i++) {
            let button = document.createElement("button");
            button.setAttribute("id", i);
            let buttonTextNode = document.createTextNode(fixturesObject[i].name);
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
    fixture.colors = colorsObject;
    fixture.onChannel = parseInt(document.getElementById("createFixtureDiv_onChannel").value);
    fixture.onChannelValue = parseInt(document.getElementById("createFixtureDiv_onChannelValue").value);
    fixturesObject[Object.keys(fixturesObject).length] = fixture;
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
    ipc.send("SettingsSaveFixtures", JSON.stringify(fixturesObject));
}

function createFixtureDiv_updateColors() {
    // then display the colors as a button
    document.getElementById("createFixtureDiv_colorsDiv").innerHTML = '<button class="btn button fullWidth" onclick="createFixtureDiv_addColor()">Add Color</button><br/><br/>';
    for(var i = 0; i < Object.keys(colorsObject).length; i++) {
        let button = document.createElement("button");
        button.setAttribute("class", "btn button fullWidth");
        let buttonTextNode = document.createTextNode(Object.keys(colorsObject)[i]);
        button.appendChild(buttonTextNode);
        button.setAttribute("onclick", "createFixtureDiv_removeColor(" + i + ")");
        document.getElementById("createFixtureDiv_colorsDiv").appendChild(button);
    }
}

function createFixtureDiv_addColor() {
    // then hide the editFixtureDiv and open the addColorDiv
    document.getElementById("createFixtureDiv").classList.add("hidden");
    document.getElementById("addColorDiv").classList.remove("hidden");
}

function createFixtureDiv_removeColor(cid) {
    if(confirm("Are You Sure That You Want To Remove The Color '" + Object.keys(colorsObject)[cid] + "' From The Fixture") == true) {
        // then delete the color
        delete colorsObject[Object.keys(colorsObject)[cid]];
        // then update the color
        createFixtureDiv_updateColors();
    }
}

// EDIT FIXTURE SECTIOn

// edit fixture function
function editFixture(fixtureIdFromBtn) {
    fixtureId = fixtureIdFromBtn;
    isEditingFixture = true;
    let fixture = fixturesObject[fixtureId];
    // then fill the fields in
    document.getElementById("editFixtureDiv_fixtureName").value = fixture.name;
    document.getElementById("editFixtureDiv_startAddress").value = fixture.startAddress;
    document.getElementById("editFixtureDiv_endAddress").value = fixture.endAddress;
    document.getElementById("editFixtureDiv_onChannel").value = fixture.onChannel;
    document.getElementById("editFixtureDiv_onChannelValue").value = fixture.onChannelValue;
    colorsObject = fixture.colors;
    editFixtureDiv_updateColors();
    document.getElementById("fixturesDiv").classList.add("hidden");
    document.getElementById("editFixtureDiv").classList.remove("hidden");
}

function editFixtureDiv_addColor() {
    // then hide the editFixtureDiv and open the addColorDiv
    document.getElementById("editFixtureDiv").classList.add("hidden");
    document.getElementById("addColorDiv").classList.remove("hidden");
}

function editFixtureDiv_removeColor(cid) {
    if(confirm("Are You Sure That You Want To Remove The Color '" + Object.keys(colorsObject)[cid] + "' From The Fixture") == true) {
        // then delete the color
        delete colorsObject[Object.keys(colorsObject)[cid]];
        // then update the color
        editFixtureDiv_updateColors();
    }
}

function editFixtureDiv_updateColors() {
    // then display the colors as a button
    document.getElementById("editFixtureDiv_colorsDiv").innerHTML = '<button class="btn button fullWidth" onclick="editFixtureDiv_addColor()">Add Color</button><br/><br/>';
    for(var i = 0; i < Object.keys(colorsObject).length; i++) {
        let button = document.createElement("button");
        button.setAttribute("class", "btn button fullWidth");
        let buttonTextNode = document.createTextNode(Object.keys(colorsObject)[i]);
        button.appendChild(buttonTextNode);
        button.setAttribute("onclick", "editFixtureDiv_removeColor(" + i + ")");
        document.getElementById("editFixtureDiv_colorsDiv").appendChild(button);
    }
}

function editFixtureDiv_update() {
    // then create the fixture object
    let fixture = {}
    fixture.name = document.getElementById("editFixtureDiv_fixtureName").value
    fixture.startAddress = parseInt(document.getElementById("editFixtureDiv_startAddress").value);
    fixture.endAddress = parseInt(document.getElementById("editFixtureDiv_endAddress").value);
    fixture.colors = colorsObject;
    fixture.onChannel = parseInt(document.getElementById("editFixtureDiv_onChannel").value);
    fixture.onChannelValue = parseInt(document.getElementById("editFixtureDiv_onChannelValue").value);
    fixturesObject[fixtureId] = fixture;
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
    ipc.send("SettingsSaveFixtures", JSON.stringify(fixturesObject));
}

function editFixtureDiv_delete() {
    if(confirm("You Are About To Delete This Fixture, Are You Sure That You Want To Proceed As This Cannot Be Undone") == true) {
        // then delete the fixture from the fixturesObject and then write the fixturesObject to the json file
        delete fixturesObject[fixtureId];
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
        ipc.send("SettingsSaveFixtures", JSON.stringify(fixturesObject));
    }
}

// addColorDiv

function addColorDiv_addColor() {
    // then get all of the data and collate it into a new Color
    let colorName = document.getElementById("addColorDiv_colorName").value;
    let colorObject = new Color(parseInt(document.getElementById("addColorDiv_colorOffValue").value), parseInt(document.getElementById("addColorDiv_colorMinValue").value), parseInt(document.getElementById("addColorDiv_colorMaxValue").value), parseInt(document.getElementById("addColorDiv_colorDmxChannel").value), document.getElementById("addColorDiv_dimmableViaOnChannel").checked);
    // then if isEditingFixture is set to false
    if(isEditingFixture == false) {
        colorsObject[colorName] = colorObject;
        createFixtureDiv_updateColors();
        document.getElementById("createFixtureDiv").classList.remove("hidden");
    }
    else {
        // then add the color to the colorsObject
        colorsObject[colorName] = colorObject;
        editFixtureDiv_updateColors();
        document.getElementById("editFixtureDiv").classList.remove("hidden");
    }
    document.getElementById("addColorDiv").classList.add("hidden");
    document.getElementById("addColorDiv_colorName").value = "";
    document.getElementById("addColorDiv_colorOffValue").value = "";
    document.getElementById("addColorDiv_colorMinValue").value = "";
    document.getElementById("addColorDiv_colorMaxValue").value = "";
    document.getElementById("addColorDiv_colorDmxChannel").value = "";
    document.getElementById("addColorDiv_dimmableViaOnChannel").checked = false;
}