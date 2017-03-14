let showName = (key: string, value: string) => {
    basic.showString(value)
}


basic.forever(() => {
    blockytalkybluetooth.handleIncommingUARTData()
})

blockytalkybluetooth.onMessageReceived("name", showName)
blockytalkybluetooth.onMessageReceived("weather", (key: string, value: string) => {
    basic.showNumber(42)
})

input.onButtonPressed(Button.A, () => {
    blockytalkybluetooth.sendKeyValue("AwesomePerson", "Kari")
})
