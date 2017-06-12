import { Header } from './header'
import { FatChain } from './fatCHain'
import { getDirectoryEntries, buildHierarchy } from './directoryEntries'
import { HeaderView, DifatSectorView, FatSectorView, DirectoryEntryView } from './dataViews'
import { SectorType, ObjectType, StreamType } from './enums'
import { VirtualDirectory, VirtualFile } from './directory'
import { chunkBuffer } from '../helpers'

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
    // build the directory's hierarchy
    this.root = buildHierarchy(this.directoryEntries, this.header.miniSectorCutoff,
      this.fatChain.chains, this.miniFatChain.chains)
  }

  private buildSectors() {
    let sectorSize = this.header.sectorSize
    this.sectors = chunkBuffer(this.buffer.slice(sectorSize), sectorSize)
  }

  private buildFatSectors() {
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
      result.push(...difatSector.partialArray)
      visitedSectors.add(currentIndex)
      currentIndex = difatSector.nextDifatSectorIndex
    }
    return result
      .filter(sectorNumber => sectorNumber <= SectorType.MAXREGSECT)
  }

  private buildDirectoryEntries() {
    let startOfDirectoryChain = this.header.startOfDirectoryChain
    if(startOfDirectoryChain !== SectorType.ENDOFCHAIN) {
      if(!this.fatChain.chains.has(startOfDirectoryChain)) {
        throw new Error(`Directory chain sector not found. It was supposed to be available at ${startOfDirectoryChain}.`)
      }
      this.directoryEntries = getDirectoryEntries(this.fatChain.chains.get(startOfDirectoryChain)!)
    }
  }

  private buildMiniFatSectors() {
    let startOfMiniFat = this.header.startOfMiniFat
    if(startOfMiniFat !== SectorType.ENDOFCHAIN) {
      if(!this.fatChain.chains.has(startOfMiniFat)) {
        throw new Error(`MiniFAT sector not found. It was supposed to be available at ${startOfMiniFat}.`)
      }
      let miniFatView = this.fatChain.chains.get(startOfMiniFat)!
      let miniStreamView = this.fatChain.chains.get(this.directoryEntries[0].startingSectorLocation)!
      let sectorSize = this.header.miniSectorSize
      let miniStreamSectors = chunkBuffer(miniStreamView, sectorSize)
      this.miniFatChain = new FatChain([new FatSectorView(miniFatView)], miniStreamSectors)
    }
  }

  public header: Header

  public sectors: ArrayBuffer[]

  public fatSectors: FatSectorView[]

  public fatChain: FatChain

  public miniFatChain: FatChain

  public directoryEntries: DirectoryEntryView[]

  public root: VirtualDirectory
}
