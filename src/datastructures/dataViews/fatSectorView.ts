/**
 *
 */
export class FatSectorView {
  constructor(buffer: ArrayBuffer) {
    this._array = new Uint32Array(buffer)
  }

  public get partialArray(): number[] {
    return Array.from(this._array.values())
  }

  private _array: Uint32Array
}
