import { SectorView } from './sectorView'

export class ChainView {
  constructor(private sectors: SectorView[]) {
    let totalBytes = sectors.map(s=>s.buffer.byteLength).reduce((acc, val)=> acc+val)
    let tmp = new Uint8Array(totalBytes)
    let currentByteLength = 0
    sectors.map(sector => {
      tmp.set(new Uint8Array(sector.buffer), currentByteLength)
      currentByteLength += sector.buffer.byteLength
    })
    this.joinedBuffer = tmp.buffer
  }

  public joinedBuffer: ArrayBuffer
}
