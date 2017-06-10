import { Header } from './header'
import { FatChain } from './fatCHain'
import { DirectoryEntries } from './directoryEntries'
import { HeaderView, SectorView, DifatSectorView, FatSectorView, ChainView } from './dataViews'
import { SectorType } from './enums'

export class CFB {
  constructor(private buffer: ArrayBuffer) {
    this.header = new Header(new HeaderView(buffer))
    if (!this.header.check()) {
      throw new Error('bad format.')
    }
    this.buildSectors()
    this.buildFatSectors()
    this.buildDirectoryEntries()
    this.buildMiniFatSectors()
  }

  public buildSectors() {
    let sectorSize = this.header.sectorSize
    let nthSectorStart = (index: number) => sectorSize * (index + 1)
    let slicedBuffer = (index: number) => this.buffer.slice(nthSectorStart(index), nthSectorStart(index + 1))
    let numberOfSectors = this.buffer.byteLength / sectorSize - 1
    this.sectors = Array.from(Array(numberOfSectors).keys())
      .map(index => new SectorView(slicedBuffer(index)))
  }

  public buildFatSectors() {
    let visitedSectors = new Set<number>()
    this.fatSectors = this.getDifatArray(visitedSectors)
      .map(sectorNumber => {
        if(visitedSectors.has(sectorNumber)) {
          throw new Error(`sector ${sectorNumber}'s already been visited.`)
        }
        visitedSectors.add(sectorNumber)
        return new FatSectorView(this.sectors[sectorNumber])
      })
    this.fatChain = new FatChain(this.fatSectors, this.sectors)
  }

  private getDifatArray(visitedSectors: Set<number>): number[] {
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
      result.push(...difatSector.partialDifatArray)
      visitedSectors.add(currentIndex)
      currentIndex = difatSector.nextDifatSectorIndex
    }
    return result
      .filter(sectorNumber => sectorNumber <= SectorType.MAXREGSECT)
  }

  public buildDirectoryEntries() {
    let startOfDirectoryChain = this.header.startOfDirectoryChain
    if(startOfDirectoryChain !== SectorType.ENDOFCHAIN) {
      if(!this.fatChain.chains.has(startOfDirectoryChain)) {
        throw new Error(`Directory chain sector not found. It was supposed to be available at ${startOfDirectoryChain}.`)
      }
      this.directoryEntries = new DirectoryEntries(this.fatChain.chains.get(startOfDirectoryChain)!)
    }
  }

  public buildMiniFatSectors() {
    let startOfMiniFat = this.header.startOfMiniFat
    if(startOfMiniFat !== SectorType.ENDOFCHAIN) {
      if(!this.fatChain.chains.has(startOfMiniFat)) {
        throw new Error(`MiniFAT sector not found. It was supposed to be available at ${startOfMiniFat}.`)
      }
      this.miniFat = this.fatChain.chains.get(startOfMiniFat)!
    }
  }

  public header: Header

  public sectors: SectorView[]

  public fatSectors: FatSectorView[]

  public fatChain: FatChain

  public miniFat: ChainView

  public directoryEntries: DirectoryEntries
}
