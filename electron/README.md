# ELECTRON CODE README
## This will document what happens in the Electron code

# Dependencies

## Here is a list of dependencies that dmxProject uses

- **SerialPort for NodeJs** - This is used to communicate with the arduino, it's parser is also required but at the present time is not used

- **Path for NodeJs** - This is used to build filepaths for saving files in directories

- **Electron IPC** - This is used to communicate between different processes of electron

# FILES

> fixtures.json

fixtures.json is a file that is created in a folder called "dmxProject" which is inside the user's documents folder
`C:\Users\usr\Documents`

This file consists of the different fixtures that are on the DMX universe and what channels they start on, and what channels that light has available to control

**Fixtures are managable via the "Manage Fixtures" button inside the settings**

**an example of `fixtures.json`**

a fixtures object will be created, the id of the fixture will be represented by a fixture id as so

`"fixtures": [
        { 
            "id": "fixture1",
            "name": "Fixture 1",
            "startAddress": 1,
            "endAddress": 4,
        }
    ]
}`

### The Properties

- **id** - This string is the ID of the fixture, this will be randomised so duplicates are not made

- **name** - This string is the name of the fixture

- **startAddress** - This integer is the starting DMX address that the fixture will listen to

- **endAddress** - This integer is the ending DMX address that is the last channel that the fixture listens to

- **typeOfFixture** - This string indicates the type of fixture that this fixture is e.g.

    1. **GOBOMovingHead** - this is a fixture that has a pan and tilt and uses a gobo to create colours and effects by using a single light source, this fixture usually requires an on channel, this fixture 
    2. **LEDMovingHead** - this is a fixture that has a pan and tilt but uses regular channels that control LEDs to create colour
    3. **RGBWLED** - This is a fixture that uses channels to mix colours using Red, Green, Blue and White LEDs
    4. **RGBLED** - This is a fixture that uses channels to mix colours using Red, Green and Blue LEDs
    5. **CUSTOM**- This is a fixture that you will have to tell the software how to use manually


- **channelFeatures** - This object provides a nested object about each channel, what it does and how to control it e.g

    `"channelFeatures": {
        "1": {
            "name": "On Channel",
            "type": "OnChannel"
        }
    }`

    The properties of this object are

    - **[KEY]** - Shows The Channel Number That This ChannelFeature belongs to
    
    - **name** - This string is a human-friendly name for the channel

    - **type** - This string tells the software the type of channel it is from this list:

        - **OnChannel** - Tells the software that it is the OnChannel for the fixture

        - **OnChannelMainDimmer** - Tells the software that it is the OnChannel for the fixture but that it is required to dim other features
        
        - **Dimmer** - Tells the software that this channel is fully dimmable from 0-255 - This will provide buttons like 0%, 50% and 100% to the user

        - **ExactValue** - Tells the software that exact values are needed to be sent to this channel - **If this is set then a values property must be set and with the key as the name of the value e.g. red and the value the value to send to that channel. This will provide the exact values that will be options for the user instead of the normal dimmer options**

        e.g.

        `{
        "name": "Red",
        "type": "Dimmer"
        }`

        e.g.

        `{"name": "GOBOs",
        "type": "ExactValue",
        "values": {
            "spiral":6,
            "none":0,
            "circle":20  
        }}`


## There is also a property called fixturesGroup

fixturesGroup contains nested arrays that use the key as the id for the group and then contains the id's of the fixtures in it e.g.

`{"fixturesGroup": {
    "group1Id": ["fixture1Id", "fixture2Id"]
}}`

**IMPORTANT:** The fixtures must have exactly the same control structure and be identical with the only difference being the DMX channel that they are set to. **Creating a group with different types of fixtures in it may cause unexpected results**

Any invalid id will be ignored and the group should continue to work normally but the error will be reported to the user


---

> PROGRAMS

**Programs** can be added by dragging and dropping a json file into the **programs** folder inside the **dmxProject** folder

**ONE** JSON file will contain one program/chase with an array with the key "scenes", this is an array and inside it will be another array which will contain one object per fixture to control

``{
    "success":true,
    "name":"TestLights",
    "loopOnFinish": true,
    "scenes": [
        [
            {
                "fixtureId":"fixture1",
                "isFixtureGroup":false,
                "channels": {
                    "1": 255,
                    "2": 255,
                    "3": 0,
                    "4": 0
                }
            }
        ],
        [
            {
                "fixtureId":"fixture1",
                "isFixtureGroup":false,
                "channels": {
                    "1": 255,
                    "2": 0,
                    "3": 0,
                    "4": 255
                } 
            }
        ]
    ]
}``

The Properties:

- **name** - the name of the chase/scene collection

- **loopOnFinish** - this boolean tells the program to loop the scenes once the end is reached, this makes it behave like a chase

- **syncToTime** - this boolean tells the program to use times provided in the next property to sync the scenes to timings provided by the program

- **timings** - this object contains a key as the time and the property as the scene number, starting at 1 for scene 1

- **scenes** - this array contains a nested array which then contains one object per fixture to control which has the following properties

    - **fixtureId** - this is the id of the fixture or group that you are controlling

    - **isFixtureGroup** - this boolean says whether the fixtureId is a group or a single fixture

    - **channels** - this contains key,value pairs of values related to that fixture/group and says what channel and value to set

---
> main.js

main.js will contain the squirrel event manager at the top which will allow the project to be packaged

**IPC QUERIES:**

- **SerialPortsList** - This will return a list of all of the devices that are made by arduino, the return type is an object with nested objects contained in it

- **UseDevice** - This sets the device up as the device to use, provide this method the port of the device and then it will open the rest of the application

- **OpenManageFixturesWindow** - This method opens the manage fixtures window, it can be opened by a button in settings

- **SettingsGetFixtures** - This method will return the contents of **fixtures.json**, this is used by settings but also the main pages

- **SettingsSaveFixtures** - This method **Overwrites fixtures.json** with the given data, any changes must be appended to the original data using the previous method otherwise all of the data will be gone

- **WriteToDmxChannel** - This method writes the object given to it to the serial port that the arduino is on