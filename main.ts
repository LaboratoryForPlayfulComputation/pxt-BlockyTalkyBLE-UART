module blockytalkybluetooth {
    let delimiter = "^"
    let terminator = "|"
    let handlers:LinkedKeyHandlerList = null;

    class LinkedKeyHandlerList{
        key: string;
        callback: (k:string, v:string)=>void;
        next: LinkedKeyHandlerList
    }

    /**
     * Handles incoming messages
     *
     * @param key
     * @param callback 
     */    
    export function onMessageReceived(key:string, callback:(key:string, value:string)=>any)  {
        //two cases to handle here: 
        //1) we don't have any handlers yet, 
        //2) we are creating the first, or nth, handler for this key. we will allow multiple callbacks for the same key.
        //we can handle both of these scenarios by just pushing new elements to the start of the handlers list
        let newHandler = new LinkedKeyHandlerList()
        newHandler.callback = callback
        newHandler.key = key
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
     * Handles any incomding message
     */
    //% blockId=blocklyTalkyHandleIncommingUARTData block="handle incoming data"
    export function handleIncommingUARTData() {
        let latestMessage = bluetooth.uartReadUntil(terminator)
        //uncomment this to see all messages received
        //basic.showString(latestMessage)
        let key = extractKey(latestMessage)
        let value = extractValue(latestMessage)

        let handlerToExamine = handlers;
        while (handlerToExamine != null){
            if (handlerToExamine.key == key){
                handlerToExamine.callback(key, value)
            }
            handlerToExamine = handlerToExamine.next
        }
    }
}