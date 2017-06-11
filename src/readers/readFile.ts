import { CFB } from '../datastructures/cfb'

export function readFileFromBlob(file: Blob): Promise<CFB> {
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
  return arrayBufferPromise.then(arrayBuffer => new CFB(arrayBuffer))
}

export function readFileFromBuffer(file: Buffer): CFB {
  return new CFB(file.buffer)
}
