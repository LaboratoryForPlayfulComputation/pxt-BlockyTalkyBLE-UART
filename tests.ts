input.onButtonPressed(Button.B, () => {
    basic.showLeds(`
        # . . . .
        # . . . .
        # . . . .
        # . . . .
        # . . . .
        `)
    blockyTalkyBLE.sendKeyValue("Button", "B")
})
input.onButtonPressed(Button.A, () => {
    basic.showLeds(`
        # . . . .
        # . . . .
        # . . . .
        # . . . .
        # . . . .
        `)
    blockyTalkyBLE.sendKeyValue("accel", "123")
})
blockyTalkyBLE.onMessageReceived("show",  ({ value }) =>  {
    basic.showString(value)
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
