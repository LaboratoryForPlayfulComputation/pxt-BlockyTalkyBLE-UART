input.onButtonPressed(Button.B, () => {
    basic.showLeds(`
        # . . . .
        # . . . .
        # . . . .
        # . . . .
        # . . . .
        `)
    blockyTalkyBLE.sendMessageWithStringValue("Button", "B")
})
input.onButtonPressed(Button.A, () => {
    basic.showLeds(`
        # . . . .
        # . . . .
        # . . . .
        # . . . .
        # . . . .
        `)
    blockyTalkyBLE.sendMessageWithNumberValue("accel", 123)
})
blockyTalkyBLE.onStringReceived("show",  ({ stringValue }) =>  {
    basic.showString(stringValue)
})

blockyTalkyBLE.onNumberReceived("show",  ({ numberValue }) =>  {
    basic.showNumber(numberValue)
})
bluetooth.onBluetoothConnected(() => {
    basic.showString("c")
})
basic.showLeds(`
    # # . . .
    # . # . .
    # # . . .
    # . # . .
    # # . . .
    `)
