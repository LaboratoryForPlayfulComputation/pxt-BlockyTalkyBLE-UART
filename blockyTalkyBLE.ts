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

    let splitString = (splitOnChar: string, input: string) => {
      let result:string[] = []
      let count = 0
      let startIndex = 0
      for (let index = 0; index < input.length; index++) {
          if (input.charAt(index) == splitOnChar) {
              result[count] = input.substr(startIndex, index - startIndex)

              startIndex = index + 1
              count = count + 1
          }
      }
      result[count] = input.substr(startIndex, input.length - startIndex)

      return result;
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

    /**
     * Get enum representation of string.
     */
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
        let messageArray = splitString(delimiter, latestMessage)

        let type = getValueTypeIndicatorForString(messageArray[0])
        let key = messageArray[1]
        let val = messageArray[2]

        if (type === ValueTypeIndicator.Number) {
            messageContainer.numberValue = parseInt(val)
        } else if (type === ValueTypeIndicator.String) {
            messageContainer.stringValue = val
        } else {
            messageContainer.stringValue = val
        }

        let handlerToExamine = handlers;

        if (handlerToExamine == null) { //empty handler list
            basic.showString("nohandler")
        }

        while (handlerToExamine != null) {
            if (handlerToExamine.key == key && handlerToExamine.type == type) {
                handlerToExamine.callback(messageContainer)
            }
            handlerToExamine = handlerToExamine.next
        }
    }

    bluetooth.startUartService()
    basic.forever(() => {
        blockyTalkyBLE.handleIncomingUARTData()
    })
}
