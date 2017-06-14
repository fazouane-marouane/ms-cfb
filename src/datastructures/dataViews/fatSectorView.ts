function partialFatArrayView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer)
}

/**
 *
 * @param buffer
 */
export function getPartialFatArray(buffer: ArrayBuffer): number[] {
  return Array.from(partialFatArrayView(buffer).values())
}
