import { range } from './arrays'

/**
 * Split a `buffer` into an array of chunks of same length of `chunkSize`.
 * If `buffer` can't be split evenly, the final chunk will be the remaining elements.
 *
 * @param {ArrayBuffer} buffer The buffer to process
 * @param {number} chunkSize The length of each chunk
 */
export function chunkBuffer(buffer: ArrayBuffer, chunkSize: number): ArrayBuffer[] {
  const numberOfChunks: number = Math.ceil(buffer.byteLength / chunkSize)
  const nthEntryStart = (index: number): number => chunkSize * index
  const slicedBuffer = (index: number): ArrayBuffer => buffer.slice(nthEntryStart(index), nthEntryStart(index + 1))

  return range(0, numberOfChunks)
    // tslint:disable-next-line:no-unnecessary-callback-wrapper
    .map((index: number): ArrayBuffer => slicedBuffer(index))
}

/**
 * Join an array of `buffers`
 *
 * @param buffers buffers to be joined
 */
export function joinBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalBytes = buffers.map((buffer: ArrayBuffer): number => buffer.byteLength)
    .reduce((acc: number, val: number): number => acc + val)
  const tmp = new Uint8Array(totalBytes)
  buffers.reduce(
    (accumulatedByteLength: number, buffer: ArrayBuffer): number => {
      tmp.set(new Uint8Array(buffer), accumulatedByteLength)

      return accumulatedByteLength + buffer.byteLength
    },
    0)

  return tmp.buffer
}
