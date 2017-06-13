import { CFB } from '../datastructures/CFB'

/**
 *
 * @param buffer
 */
export function readFromArrayBuffer(buffer: ArrayBuffer): CFB {
  return new CFB(buffer)
}

// tslint:disable-next-line:interface-name
interface FileReaderOnLoadEvent extends Event {
  target:  EventTarget & {
    readonly result: ArrayBuffer
  }
}

/**
 *
 * @param file
 */
// tslint:disable-next-line:promise-function-async
export function readFromBlob(file: Blob): Promise<CFB> {
  // tslint:disable-next-line:promise-must-complete
  const arrayBufferPromise = new Promise<ArrayBuffer>(
    (resolve: (value: ArrayBuffer) => void, reject: (reason: string) => void): void => {
      const reader = new FileReader()
      reader.onload = (event: FileReaderOnLoadEvent): void => {
        resolve(event.target.result)
      }
      reader.onerror = (event: ErrorEvent): void => {
        reject(event.message)
      }
      reader.readAsArrayBuffer(file)
    })

  // tslint:disable-next-line:no-unnecessary-callback-wrapper
  return arrayBufferPromise.then((buffer: ArrayBuffer) => readFromArrayBuffer(buffer))
}

/**
 *
 * @param file
 */
export function readFromNodeBuffer(file: Buffer): CFB {
  return readFromArrayBuffer(file.buffer)
}
