export class DifatSectorView {
  constructor(buffer: ArrayBuffer) {
    let byteOffset = buffer.byteLength - 4
    this.partialDifatArrayView = new Uint32Array(buffer, 0, byteOffset/4) // 4 * byteOffset / 4 = byteOffset
    this.nextDifatSectorIndexView = new Uint32Array(buffer, byteOffset, 1) // 1 byte
  }

  public get partialArray(): number[] {
    return Array.from(this.partialDifatArrayView.values())
  }

  public get nextDifatSectorIndex(): number {
    return this.nextDifatSectorIndexView[0]
  }

  private partialDifatArrayView: Uint32Array

  private nextDifatSectorIndexView: Uint32Array
}
