export function partialFatArrayView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer)
}

/**
 *
 */
export class FatSectorView {
  constructor(private buffer: ArrayBuffer) {
  }

  public getArray(): number[] {
    return Array.from(partialFatArrayView(this.buffer).values())
  }
}
