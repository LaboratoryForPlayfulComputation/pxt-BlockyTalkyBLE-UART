
/**
 * Custom blocks
 */
//% color=#0062dB weight=96 icon="\uf294"
namespace blockytalkybluetooth {



    let delimiter = "^"
    let terminator = "#"
    let handlers: LinkedKeyHandlerList = null;

    export class KeyVal {
        key: string;
        value: string;
    }

    class LinkedKeyHandlerList {
        key: string;
        callback: (a: KeyVal) => void;
        next: LinkedKeyHandlerList
    }

    /**
     * Handles incoming messages
     *
     * @param key
     * @param callback 
     */
    //% mutate=objectdestructuring
    //% mutateText="My Arguments"
    //% mutateDefaults="key,value"
    //% blockId=blockytalkyBLE_on_msg_rcvd
    //% block="on msg received|key %theKey"
    export function onMessageReceived(theKey: string, callback: (a: KeyVal) => void) {
        //two cases to handle here: 
        //1) we don't have any handlers yet, 
        //2) we are creating the first, or nth, handler for this key. we will allow multiple callbacks for the same key.
        //we can handle both of these scenarios by just pushing new elements to the start of the handlers list
        //  basic.showString("kk")
        let newHandler = new LinkedKeyHandlerList()
        newHandler.callback = callback
        newHandler.key = theKey
        newHandler.next = handlers
        handlers = newHandler
    }



    /**
     * Sends a key value over BLE
     * @param key key to send
     * @param value value to send
     */
    //% blockId=blocklyTalkySendKeyValue block="send|key %key|value %value"
    export function sendKeyValue(key: string, value: string) {
        bluetooth.uartWriteString(key + delimiter + value + terminator)
    }

    /**
     * Sends a key value over BLE
     * @param key key to send
     * @param value value to send
     */
    //% blockId=blocklyTalkySendKeyValueInt block="send|key %key|intValue %value"
    export function sendKeyValueInt(key: string, value: number) {
        let valueStr = value.toString()
        bluetooth.uartWriteString(key + delimiter + valueStr + terminator)
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
        let endOfKey = firstOccurenceOfCharacterInString(delimiter, input)
        if (endOfKey == -1) {
            return "MISSING DELIMITER"
        } else {
            return input.substr(endOfKey + 1)
        }
    }

    /**
     * Handles any incoming message
     */
    //% blockId=blocklyTalkyHandleIncomingUARTData block="handle incoming data"
    export function handleIncomingUARTData() {
        let latestMessage = bluetooth.uartReadUntil(terminator)
        //uncomment this to see all messages received

        let key = extractKey(latestMessage)
        let value = extractValue(latestMessage)

        let args = new KeyVal;
        args.key = key
        args.value = value
        let handlerToExamine = handlers;

        if (handlers == null) {
            basic.showString("nohandler")
        }
        while (handlerToExamine != null) {
            if (handlerToExamine.key == key) {
                handlerToExamine.callback(args)
            }
            handlerToExamine = handlerToExamine.next
        }
    }
}
