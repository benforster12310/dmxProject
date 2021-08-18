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

function listFixtures(dataObject) {
    // then look inside the dataObject for the fixtures object and count them
    // then check if the fixtures key exists
    if(dataObject.hasOwnProperty("fixtures")) {
        // then count the number of fixtures in here
        fixturesObject = dataObject.fixtures
        fixturesObjectLength = Object.keys(fixturesObject).length;
        // then go through the fixtures and then create a button for each fixture
        console.log(dataObject);
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

// EDIT FIXTURE SECTION
let colorsObject = {};

// edit fixture function
function editFixture(fixtureId) {
    let fixture = fixturesObject[fixtureId];
    // then fill the fields in
    document.getElementById("editFixtureDiv_fixtureName").value = fixture.name;
    document.getElementById("editFixtureDiv_startAddress").value = fixture.startAddress;
    document.getElementById("editFixtureDiv_endAddress").value = fixture.endAddress;
    document.getElementById("editFixtureDiv_onChannel").value = fixture.onChannel;
    document.getElementById("editFixtureDiv_onChannelValue").value = fixture.onChannelValue;
    colorsObject = fixture.colors;
    editFixtureDiv_updateColors();
}

function editFixtureDiv_addColor() {
    
}

function editFixtureDiv_removeColor() {

}

function editFixtureDiv_updateColors() {

}