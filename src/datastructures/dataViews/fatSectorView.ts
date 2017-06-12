export class FatSectorView {
  constructor(buffer: ArrayBuffer) {
    this.partialArrayView = new Uint32Array(buffer)
  }

  public get partialArray(): number[] {
    return Array.from(this.partialArrayView.values())
  }

  private partialArrayView: Uint32Array
}
