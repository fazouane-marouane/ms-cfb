import { range } from './arrays'

export function sliceView(view: DataView, byteOffset: number, length?: number): DataView {
  return new DataView(view.buffer, view.byteOffset + byteOffset, length)
}

export function sliceInnerBuffer(view: DataView, byteOffset: number, length?: number): ArrayBuffer {
  return view.buffer.slice(view.byteOffset + byteOffset, length)
}

/**
 * Split a `buffer` into an array of chunks of same length of `chunkSize`.
 * If `buffer` can't be split evenly, the final chunk will be the remaining elements.
 *
 * @param {ArrayBuffer} buffer The buffer to process
 * @param {number} chunkSize The length of each chunk
 */
export function chunkBuffer(view: DataView, chunkSize: number): DataView[] {
  const numberOfFixedSizeChunks = Math.floor(view.byteLength / chunkSize)
  const remainingBytes = view.byteLength % chunkSize
  const result = range(0, numberOfFixedSizeChunks)
    .map((index: number): DataView => sliceView(view, chunkSize * index, chunkSize))
  if (remainingBytes > 0) {
    result.push(sliceView(view, chunkSize * numberOfFixedSizeChunks, remainingBytes))
  }

  return result
}

/**
 * Join an array of `buffers`
 *
 * @param buffers buffers to be joined
 */
export function joinViews(views: DataView[]): DataView {
  const totalBytes = views.map((view: DataView): number => view.byteLength)
    .reduce((acc: number, val: number): number => acc + val)
  const tmp = new Uint8Array(totalBytes)
  views.reduce(
    (accumulatedByteLength: number, view: DataView): number => {
      tmp.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength), accumulatedByteLength)

      return accumulatedByteLength + view.byteLength
    },
    0)

  return new DataView(tmp.buffer)
}
