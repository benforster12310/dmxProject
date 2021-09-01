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

`"fixtures":{
    "fixture1": {
        "id": "fixture1",
        "startAddress": 1
    }
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

- **hasOnChannel** - This boolean indicates wether the light requires a value to be sent to a channel to turn it on

- **isOnChannelDimmable** - This boolean indicates wether the onChannel is dimmable or not, if not an on channel value must be provided

- **onChannel** - This integer value indicates which channel the light's on channel is e.g channel 8 on the fixture

- **onChannelValue** - This integer value indicates the value that should be sent to the on channel of the fixture to enable the light source to be emmitted

- **isOnChannelVisible** - This boolean value indicates if light is produced when the on channel is turned on, if true then when the light needs to be turned off then the software will turn the on channel off aswell as the colour channels

- **channelFeatures** - This object provides a nested object about each channel, what it does and how to control it e.g

    `"channelFeatures": {
        "1": {
            "name": "On Channel",
            "type": "OnChannel"
        }
    }`

    The properties of this object are
    
    - **name** - This string is a human-friendly name for the channel

    - **type** - This string tells the software the type of channel it is from this list:

        - **OnChannel** - Tells the software that it is the OnChannel for the fixture
        
        - **Dimmer** - Tells the software that this channel is fully dimmable from 0-255 - This will provide buttons like 0%, 50% and 100% to the user

        - **ExactValue** - Tells the software that exact values are needed to be sent to this channel - **If this is set then a values property must be set and with the key as the name of the value e.g. red and the value the value to send to that channel. This will provide the exact values that will be options for the user instead of the normal dimmer options**

        e.g.

        `{
        "name": "Red",
        "type": "Dimmer",
        }`

        e.g.

        `{"name": "GOBOs",
        "type": "ExactValue",
        "values": {
            "spiral":6,
            "none":0,
            "circle":20  
        }}`


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