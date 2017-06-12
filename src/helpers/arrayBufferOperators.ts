export function chunkBuffer(buffer: ArrayBuffer, chunkSize: number): ArrayBuffer[] {
    let numberOfChunks = Math.ceil(buffer.byteLength / chunkSize)
    let nthEntryStart = (index: number) => chunkSize * index
    let slicedBuffer = (index: number) => buffer.slice(nthEntryStart(index), nthEntryStart(index + 1))
    let chunks = Array.from(Array(numberOfChunks).keys())
      .map(index => slicedBuffer(index))
    return chunks
}

export function joinBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
    let totalBytes = buffers.map(buffer => buffer.byteLength).reduce((acc, val)=> acc+val)
    let tmp = new Uint8Array(totalBytes)
    let currentByteLength = 0
    buffers.map(buffer => {
      tmp.set(new Uint8Array(buffer), currentByteLength)
      currentByteLength += buffer.byteLength
    })
    return tmp.buffer
}
