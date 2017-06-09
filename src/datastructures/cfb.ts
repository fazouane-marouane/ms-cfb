import { Header } from './header'
import { FatChain } from './fatCHain'
import { HeaderView, SectorView, DifatSectorView, FatSectorView } from './dataViews'
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
    // Let's build difat & fat chains
    let visitedSectors = new Set<number>()
    this.fatSectorIndices = this.buildDifat(visitedSectors)
    this.fatSectors = this.fatSectorIndices
      .map(sectorNumber => {
        if(visitedSectors.has(sectorNumber)) {
          throw new Error(`sector ${sectorNumber}'s already been visited.`)
        }
        visitedSectors.add(sectorNumber)
        return new FatSectorView(this.sectors[sectorNumber])
      })
    this.fatChain = new FatChain(this.fatSectors, this.sectors)
  }

  public buildDifat(visitedSectors: Set<number>): number[] {
    let result = this.header.initialDifat
    let currentIndex = this.header.startOfDifat
    while(currentIndex !== SectorType.ENDOFCHAIN) {
      if (currentIndex >= this.sectors.length) {
        throw new Error(`sector index ${currentIndex} is outside the file size.`)
      }
      if(visitedSectors.has(currentIndex)) {
        throw new Error(`sector ${currentIndex}'s already been visited.`)
      }
      let difatSector = new DifatSectorView(this.sectors[currentIndex])
      result.concat(difatSector.partialDifatArray)
      visitedSectors.add(currentIndex)
      currentIndex = difatSector.nextDifatSectorIndex
    }
    return result
      .filter(sectorNumber => sectorNumber <= SectorType.MAXREGSECT)
  }

  public header: Header

  public sectors: SectorView[]

  public fatSectorIndices: number[]

  public freeFatSectorIndices: number[]

  public fatSectors: FatSectorView[]

  public fatChain: FatChain
}
