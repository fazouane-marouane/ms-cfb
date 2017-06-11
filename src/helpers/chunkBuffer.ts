export function chunkBuffer(buffer: ArrayBuffer, chunkSize: number): ArrayBuffer[] {
    let numberOfChunks = Math.ceil(buffer.byteLength / chunkSize)
    let nthEntryStart = (index: number) => chunkSize * index
    let slicedBuffer = (index: number) => buffer.slice(nthEntryStart(index), nthEntryStart(index + 1))
    let chunks = Array.from(Array(numberOfChunks).keys())
      .map(index => slicedBuffer(index))
    return chunks
}
