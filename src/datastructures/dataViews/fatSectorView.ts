import { SectorView } from './sectorView'

export class FatSectorView extends SectorView {
  constructor(sector: SectorView) {
    super(sector.buffer)
    this.partialFatArrayView = new Uint32Array(this.buffer)
  }

  public get partialFatArray(): number[] {
    return Array.from(this.partialFatArrayView.values())
  }

  public partialFatArrayView: Uint32Array
}
