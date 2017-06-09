import { SectorView } from './sectorView'

function joinBuffers(sectors: SectorView[]){
    let totalBytes = sectors.map(s=>s.buffer.byteLength).reduce((acc, val)=> acc+val)
    let tmp = new Uint8Array(totalBytes)
    let currentByteLength = 0
    sectors.map(sector => {
      tmp.set(new Uint8Array(sector.buffer), currentByteLength)
      currentByteLength += sector.buffer.byteLength
    })
    return tmp.buffer
}

export class ChainView extends SectorView {
  constructor(private sectors: SectorView[]) {
    super(joinBuffers(sectors))
  }
}
