
//% color=#0062dB weight=96 icon="\uf294" block="BlockyTalky BLE"
namespace blockyTalkyBLE {
    let delimiter = "^";
    let terminator = "#";
    let handlers: LinkedKeyHandlerList = null;

    class LinkedKeyHandlerList {
        key: string;
        callback: (value: ValClass) => void;
        next: LinkedKeyHandlerList
    }




    export class ValClass {
        value: string;
    }

    let glblVal = new ValClass;
    /**
    * Handles incoming messages
    *
    * @param key
    * @param callback 
    */
    //% mutate=objectdestructuring
    //% mutateText="My Arguments"
    //% mutateDefaults="key,value"
    //% blockId=blockyTalkyBLE_on_msg_rcvd
    //% block="on msg received|key %theKey"
    export function onMessageReceived(key: string, callback: (value: ValClass) => void) {
        //two cases to handle here: 
        //1) we don't have any handlers yet, 
        //2) we are creating the first, or nth, handler for this key. we will allow multiple callbacks for the same key.
        //we can handle both of these scenarios by just pushing new elements to the start of the handlers list
        let newHandler = new LinkedKeyHandlerList()
        newHandler.callback = callback;
        newHandler.key = key;
        newHandler.next = handlers;
        handlers = newHandler;
    }
    /**
             * Sends a key value over BLE
             * @param key key to send
             * @param value value to send
             */
    //% blockId=blockyTalkyBLE_send_key_value block="send|key %key|value %value"
    export function sendKeyValue(key: string, value: string) {
        bluetooth.uartWriteString(key + delimiter + value + terminator)
    }

    let firstOccurenceOfCharacterInString = (charToFind: string, input: string) => {
        for (let index = 0; index < input.length; index++) {
            if (input.charAt(index) == charToFind) {
                return index
            }
        }
        return - 1
    }

    let extractKey = (input: string) => {
        let endOfKey = firstOccurenceOfCharacterInString(delimiter, input)
        if (endOfKey == -1) {
            return "MISSING DELIMITER"
        } else {
            return input.substr(0, endOfKey)
        }
    }

    let extractValue = (input: string) => {
        let endOfKey2 = firstOccurenceOfCharacterInString(delimiter, input)
        if (endOfKey2 == -1) {
            return "MISSING DELIMITER"
        } else {
            return input.substr(endOfKey2 + 1)
        }
    }

    /**
     * Handles any incoming message
     */
    export function handleIncomingUARTData() {
        let latestMessage = bluetooth.uartReadUntil(terminator)

        //DEBUG LINE vvvvvvv
        //basic.showString(latestMessage)
        //DEBUG LINE ^^^^^^^

        let key = extractKey(latestMessage)
        glblVal.value = extractValue(latestMessage)

        let handlerToExamine = handlers;

        if (handlerToExamine == null) { //empty handler list
            basic.showString("nohandler")
        }

        while (handlerToExamine != null) {
            if (handlerToExamine.key == key) {
                handlerToExamine.callback(glblVal)
            }
            handlerToExamine = handlerToExamine.next
        }
    }

    bluetooth.startUartService()
    basic.forever(() => {
        blockyTalkyBLE.handleIncomingUARTData()
    })
}

