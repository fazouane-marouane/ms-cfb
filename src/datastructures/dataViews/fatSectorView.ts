import { SectorView } from './sectorView'

export class FatSectorView {
  constructor(sector: SectorView) {
    this.partialArrayView = new Uint32Array(sector.buffer)
  }

  public get partialArray(): number[] {
    return Array.from(this.partialArrayView.values())
  }

  private partialArrayView: Uint32Array
}
