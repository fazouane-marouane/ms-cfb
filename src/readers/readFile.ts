import { CFB } from '../datastructures/cfb'

export function readFromArrayBuffer(buffer: ArrayBuffer): CFB {
  return new CFB(buffer)
}

export function readFromBlob(file: Blob): Promise<CFB> {
  var arrayBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    var reader = new FileReader()
    reader.onload = (event: any) => {
      if (!event || !event.target || !event.target.result) {
        reject()
      }
      else {
        resolve(event.target.result)
      }
    }
    reader.readAsArrayBuffer(file)
  })
  // read the header
  return arrayBufferPromise.then(arrayBuffer => readFromArrayBuffer(arrayBuffer))
}

export function readFromNodeBuffer(file: Buffer): CFB {
  return readFromArrayBuffer(file.buffer)
}
