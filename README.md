# BlockyTalkyBLE

MakeCode Microbit package used to communicate over the Bluetooth Low Energy UART with a simple read and write of key value pairs. Requires Microbit Bluetooth package. Cannot be used with Radio package.

## To use:
* Open editor at https://makecode.microbit.org
* Open Add Pacakage dialog from the setting menu (gear) near top right corner.
* Type the github package URL: https://github.com/LaboratoryForPlayfulComputation/pxt-blockytalkybluetooth - this will also add the Microsoft's Bluetooth package to your project. If you have conflicting packages (like radio or  neopixel), a dialog box will ask to remove those packages

BlockyTalkyBLE has 2 blocks/functions:
* on msg received - An event handler that fires when a correctly formed message is received over Bluetooth. Add blocks for your eventhandler inside this block. Set the key to the expected string. Use the value received in the message as a variable within the block. value is a string
* send key value - Send message over Bluetooth. Key and value are both strings. 

Clients devices must be paired with the microbit (depending on the pairing method chosen in the editor's Project Settings). 

A couple tips:
* It is helpful while building a project for the microbit to show whether the microbit is connected or not. Use the Bluetooth.onBluetoothConnected() and Bluetooth.onBluetoothDisonnected() event handler  to display a 'c' or 'd' respectively when connection changes.
* If messages are not being received as expected, ensure the keys match (including case) on microbit program and client app. 
* Use toString() function to convert a number to a string to send.
* Use parseInt() function to convert strings to numbers if needed when receiving a value expected to be a number.

## Supported targets
* for PXT/microbit

## Examples
Please see our getting started guide and videos here: http://www.playfulcomputation.group/blockytalkyble.html

