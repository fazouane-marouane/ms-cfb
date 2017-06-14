function partialDifatArrayView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0, buffer.byteLength / 4 - 1) // buffer.byteLength - 4 bytes
}

function nextDifatSectorIndexView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, buffer.byteLength - 4, 1) // 1 byte
}

/**
 *
 */
export function getPartialDifatArray(buffer: ArrayBuffer): number[] {
  return Array.from(partialDifatArrayView(buffer).values())
}

/**
 *
 * @param buffer
 */
export function getNextDifatSectorIndex(buffer: ArrayBuffer): number {
  return nextDifatSectorIndexView(buffer)[0]
}
