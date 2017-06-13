/**
 *
 */
export class DifatSectorView {
  constructor(buffer: ArrayBuffer) {
    const byteOffset = buffer.byteLength - 4
    this._array = new Uint32Array(buffer, 0, byteOffset / 4) // 4 * byteOffset / 4 = byteOffset
    this._nextId = new Uint32Array(buffer, byteOffset, 1) // 1 byte
  }

  public get partialArray(): number[] {
    return Array.from(this._array.values())
  }

  public get nextDifatSectorIndex(): number {
    return this._nextId[0]
  }

  private _array: Uint32Array

  private _nextId: Uint32Array
}
