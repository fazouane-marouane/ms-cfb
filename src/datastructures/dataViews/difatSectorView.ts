import { SectorView } from './sectorView'

export class DifatSectorView extends SectorView {
  constructor(sector: SectorView) {
    super(sector.buffer)
    let byteOffset = this.buffer.byteLength - 4
    this.partialDifatArrayView = new Uint32Array(this.buffer, 0, byteOffset/4) // 4 * byteOffset / 4 = byteOffset
    this.nextDifatSectorIndexView = new Uint32Array(this.buffer, byteOffset, 1) // 1 byte
  }

  public get partialDifatArray(): number[] {
    return Array.from(this.partialDifatArrayView.values())
  }

  public get nextDifatSectorIndex(): number {
    return this.nextDifatSectorIndexView[0]
  }

  public partialDifatArrayView: Uint32Array

  public nextDifatSectorIndexView: Uint32Array
}
