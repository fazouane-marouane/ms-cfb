import { CFB } from '../datastructures/cfb'

export async function readFileFromBlob(file: Blob): Promise<CFB> {
  var arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
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
  return new CFB(arrayBuffer)
}

export function readFileFromBuffer(file: Buffer): CFB {
  return new CFB(file.buffer)
}
