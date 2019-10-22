import { CFB } from '../datastructures/cfb';

/**
 *
 * @param buffer
 */
export function readFromArrayBuffer(buffer: ArrayBuffer): CFB {
  return new CFB(buffer);
}

/**
 *
 * @param file
 */
// tslint:disable-next-line:promise-function-async
export function readFromBlob(file: Blob): Promise<CFB> {
  // tslint:disable-next-line:promise-must-complete
  const arrayBufferPromise = new Promise<ArrayBuffer>(
    (
      resolve: (value: ArrayBuffer) => void,
      reject: (reason: string) => void
    ): void => {
      const reader = new FileReader();
      reader.onloadend = (event: ProgressEvent<FileReader>): void => {
        resolve(event.target!.result! as ArrayBuffer);
      };
      reader.onerror = (event: ProgressEvent<FileReader>): void => {
        reject(event.target!.error!.message);
      };
      reader.readAsArrayBuffer(file);
    }
  );

  // tslint:disable-next-line:no-unnecessary-callback-wrapper
  return arrayBufferPromise.then((buffer: ArrayBuffer) =>
    readFromArrayBuffer(buffer)
  );
}

/**
 *
 * @param file
 */
export function readFromNodeBuffer(file: Buffer): CFB {
  return readFromArrayBuffer(file.buffer);
}
