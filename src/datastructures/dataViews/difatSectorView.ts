export function partialDifatArrayView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0, buffer.byteLength / 4 - 1) // buffer.byteLength - 4 bytes
}

export function nextDifatSectorIndexView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, buffer.byteLength - 4, 1) // 1 byte
}

/**
 *
 */
export class DifatSectorView {
  constructor(private buffer: ArrayBuffer) {
  }

  public getArray(): number[] {
    return Array.from(partialDifatArrayView(this.buffer).values())
  }

  public getNextIndex(): number {
    return nextDifatSectorIndexView(this.buffer)[0]
  }
}
