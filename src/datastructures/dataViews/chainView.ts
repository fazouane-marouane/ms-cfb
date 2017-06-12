import { SectorView } from './sectorView'
import { joinBuffers } from '../../helpers'

export class ChainView extends SectorView {
  constructor(private sectors: SectorView[]) {
    super(joinBuffers(sectors.map(sector => sector.buffer)))
  }
}
