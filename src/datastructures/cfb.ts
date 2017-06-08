import { Header } from './header'
import { HeaderView, SectorView } from './dataViews'
import { SectorType } from './enums'

export class CFB {
  constructor(private buffer: ArrayBuffer) {
    this.header = new Header(new HeaderView(buffer))
    if (!this.header.check()) {
      throw new Error('bad format.')
    }
    let sectorSize = this.header.sectorSize
    let nthSectorStart = (index: number) => sectorSize * (index + 1)
    let slicedBuffer = (index: number) => buffer.slice(nthSectorStart(index), nthSectorStart(index + 1))
    let numberOfSectors = buffer.byteLength / sectorSize - 1
    this.sectors = Array.from(Array(numberOfSectors).keys())
      .map(index => new SectorView(slicedBuffer(index)))
    this.fatSectorIndices = this.header.initialDifat
      .filter(sectorNumber => sectorNumber <= SectorType.MAXREGSECT)
    this.fatSectors = this.fatSectorIndices
      .map(sectorNumber => this.sectors[sectorNumber])
    this.freeFatSectorIndices = this.header.initialDifat
      .filter(sectorNumber => sectorNumber === SectorType.FREESECT && sectorNumber < this.sectors.length)
  }

  public header: Header

  public sectors: SectorView[]

  public fatSectorIndices: number[]

  public freeFatSectorIndices: number[]

  public fatSectors: SectorView[]
}
