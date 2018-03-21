//% color=#0062dB weight=96 icon="\uf294" block="BlockyTalky BLE"
namespace blockyTalkyBLE {
    let delimiter = "^";
    let terminator = "#";
    let handlers: LinkedKeyHandlerList = null;

    class LinkedKeyHandlerList {
        key: string;
        type: ValueTypeIndicator;
        callback: (value: TypeContainer) => void;
        next: LinkedKeyHandlerList
    }

    enum ValueTypeIndicator { String, Number }
    // String = Puppy, Number = Kitten
    export class TypeContainer {
        stringValue: string;
        numberValue: number;
    }

    let messageContainer = new TypeContainer;

    //% mutate=objectdestructuring
    //% mutateText="My Arguments"
    //% mutateDefaults="key,stringValue"
    //% blockId=blockyTalkyBLE_on_string_recieved
    //% block="on string received|key %theKey"
    export function onStringReceived(key: string, callback: (stringValue: TypeContainer) => void) {
        let newHandler = new LinkedKeyHandlerList()
        newHandler.callback = callback;
        newHandler.type = ValueTypeIndicator.String;
        newHandler.key = key;
        newHandler.next = handlers;
        handlers = newHandler;
    }

    /**
    * Handle incoming messages
    *
    * @param key
    * @param callback 
    */

    //% mutate=objectdestructuring
    //% mutateText="My Arguments"
    //% mutateDefaults="key,numberValue"
    //% blockId=blockyTalkyBLE_on_number_received
    //% block="on number received|key %theKey"
    export function onNumberReceived(key: string, callback: (numberValue: TypeContainer) => void) {
        let newHandler = new LinkedKeyHandlerList()
        newHandler.callback = callback;
        newHandler.type = ValueTypeIndicator.Number;
        newHandler.key = key;
        newHandler.next = handlers;
        handlers = newHandler;
    }

    /**
             * Send a key and value to the paired device
             * @param key key to send
             * @param value value to send
             */
    //% blockId=blockyTalkyBLE_send_key_value block="send|key %key|value %value"
    export function sendKeyValue(key: string, value: string) {
        bluetooth.uartWriteString(key + delimiter + value + terminator)
    }

    // TODO : [AZ] what is the syntax for these annotation things?
    //% blockId=blockyTalkyBLE_send_string_key_value block="send string|key %key|value %value"
    export function sendMessageWithStringValue(key: string, value: string): void {
        sendRawMessage(key, ValueTypeIndicator.String, value)
    }

    //% blockId=blockyTalkyBLE_send_number_key_value block="send number|key %key|value %value"
    export function sendMessageWithNumberValue(key: string, value: number): void {
        sendRawMessage(key, ValueTypeIndicator.Number, value.toString())
    }

    function sendRawMessage(key: string, valueTypeIndicator: ValueTypeIndicator, value: string): void {
        let indicatorAsString = getStringForValueTypeIndicator(valueTypeIndicator);
        bluetooth.uartWriteString(indicatorAsString + delimiter + key + delimiter + value + terminator)
    }

    let firstOccurenceOfCharacterInString = (charToFind: string, input: string) => {
        for (let index = 0; index < input.length; index++) {
            if (input.charAt(index) == charToFind) {
                return index
            }
        }
        return - 1
    }

    let secondOccurrenceOfCharacterInString = (charToFind: string, input: string) => {
        let firstIndex = 0;
        for (let index = 0; index < input.length; index++) {
            if (input.charAt(index) == charToFind) {
                firstIndex = index
            }
        }
        let newInput = input.substr(firstIndex + 1)
        for (let index = 0; index < newInput.length; index++) {
            if (input.charAt(index) == charToFind) {
                return index
            }
        }
        return 0
    }

    let extractType = (input: string) => {
        let endOfType = firstOccurenceOfCharacterInString(delimiter, input)
        if (endOfType == -1) {
            return "MISSING DELIMITER"
        } else {
            return input.substr(0, endOfType)
        }
    }

    let extractKey = (input: string) => {
        let beginningOfKey = firstOccurenceOfCharacterInString(delimiter, input)
        let endOfKey = firstOccurenceOfCharacterInString(delimiter, input.substr(beginningOfKey + 1))
        if (endOfKey == -1) {
            return "MISSING DELIMITER"
        } else {
            return input.substr(beginningOfKey + 1, endOfKey)
        }
    }

    let extractValue = (input: string) => {
        let endOfKey = firstOccurenceOfCharacterInString(delimiter, input)
        if (endOfKey == -1) {
            return "MISSING DELIMITER"
        } else {
            let s = input.substr(endOfKey + 1)
            serial.writeLine("s: " + s)
            let endOfKey2 = firstOccurenceOfCharacterInString(delimiter, s)
            serial.writeLine("eok2: " + endOfKey2)
            serial.writeLine("input: " + input)
            return input.substr(endOfKey2 + endOfKey + 2) // + 1 for each string
        }
    }

    /**
     * Get string representation of enum.
     */
    function getStringForValueTypeIndicator(vti: ValueTypeIndicator) {
        switch (vti) {
            case ValueTypeIndicator.Number:
                return "N"
            case ValueTypeIndicator.String:
                return "S"
            default:
                return "!"
        }
    }
    // it seems like we should be able to simplify this into the functionality of enum
    function getValueTypeIndicatorForString(typeString: string) {
        switch (typeString) {
            case "S":
                return ValueTypeIndicator.String
            case "N":
                return ValueTypeIndicator.Number
            default:
                return null
        }
    }

    /**
     * Handles any incoming message
     */
    export function handleIncomingUARTData() {
        let latestMessage = bluetooth.uartReadUntil(terminator)

        serial.writeLine(latestMessage)
        //DEBUG LINE vvvvvvv
        //basic.showString(latestMessage)
        //DEBUG LINE ^^^^^^^
        let t = getValueTypeIndicatorForString(extractType(latestMessage))
        serial.writeLine(getStringForValueTypeIndicator(t))
        // don't forget to fix this to make it backwards compatible
        let key = extractKey(latestMessage)
        serial.writeLine(key)
        let val = extractValue(latestMessage)
        serial.writeLine(val)

        if (t === ValueTypeIndicator.Number) {
            messageContainer.numberValue = parseInt(val)
        } else if (t === ValueTypeIndicator.String) {
            messageContainer.stringValue = val
        } else {
            messageContainer.stringValue = val
        }

        let handlerToExamine = handlers;

        if (handlerToExamine == null) { //empty handler list
            basic.showString("nohandler")
        }
        // [AZ] how to add type to the signature of the callback
        while (handlerToExamine != null) {
            serial.writeLine("handler.key: " + handlerToExamine.key + " = key: " + key)
            serial.writeLine("handler.type: " + handlerToExamine.type + " = t: " + t)
            if (handlerToExamine.key == key && handlerToExamine.type == t) { // [AZ] do we need to check if handlerToExamine.type = type (for now, yes)
                handlerToExamine.callback(messageContainer)
                serial.writeLine("In here.")
            }
            handlerToExamine = handlerToExamine.next
            serial.writeLine("again")
        }
    }

    bluetooth.startUartService()
    basic.forever(() => {
        blockyTalkyBLE.handleIncomingUARTData()
    })
}
