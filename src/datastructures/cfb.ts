import { chunkBuffer } from '../helpers'
import { DifatSectorView, DirectoryEntryView, FatSectorView } from './dataViews'
import { VirtualDirectory, VirtualFile } from './directory'
import { buildHierarchy, getDirectoryEntries } from './directoryEntries'
import { ObjectType, SectorType, StreamType } from './enums'
import { FatChain } from './fatChain'
import { Header } from './header'

/**
 *
 */
export class CFB {
  constructor(buffer: ArrayBuffer) {
    this.header = new Header(buffer)
    if (!this.header.check()) {
      throw new Error('bad format.')
    }
    this.buildSectors(buffer)
    this.buildFatSectors()
    this.buildDirectoryEntries()
    this.buildMiniFatSectors()
    // build the directory's hierarchy
    this.root = buildHierarchy(this.directoryEntries, this.header.miniSectorCutoff,
      this.fatChain.chains, this.miniFatChain.chains)
  }

  private buildSectors(buffer: ArrayBuffer): void {
    const sectorSize = this.header.sectorSize
    this.sectors = chunkBuffer(buffer.slice(sectorSize), sectorSize)
  }

  private buildFatSectors(): void {
    const visitedSectors = new Set<number>()
    this.fatSectors = this.getDifatArray(visitedSectors)
      .map((sectorNumber: number) => {
        if (visitedSectors.has(sectorNumber)) {
          throw new Error(`sector ${sectorNumber}'s already been visited.`)
        }
        visitedSectors.add(sectorNumber)

        return new FatSectorView(this.sectors[sectorNumber])
      })
    this.fatChain = new FatChain(this.fatSectors, this.sectors)
  }

  private getDifatArray(visitedSectors: Set<number>): number[] {
    const result = this.header.initialDifat
    let currentIndex = this.header.startOfDifat
    while (currentIndex !== SectorType.ENDOFCHAIN) {
      if (currentIndex >= this.sectors.length) {
        throw new Error(`sector index ${currentIndex} is outside the file size.`)
      }
      if (visitedSectors.has(currentIndex)) {
        throw new Error(`sector ${currentIndex}'s already been visited.`)
      }
      const difatSector = new DifatSectorView(this.sectors[currentIndex])
      result.push(...difatSector.partialArray)
      visitedSectors.add(currentIndex)
      currentIndex = difatSector.nextDifatSectorIndex
    }

    return result
      .filter((sectorNumber: number) => sectorNumber <= SectorType.MAXREGSECT)
  }

  private buildDirectoryEntries(): void {
    const startOfDirectoryChain = this.header.startOfDirectoryChain
    if (startOfDirectoryChain !== SectorType.ENDOFCHAIN) {
      if (!this.fatChain.chains.has(startOfDirectoryChain)) {
        throw new Error(`Directory chain sector not found. It was supposed to be available at ${startOfDirectoryChain}.`)
      }
      // tslint:disable-next-line:no-non-null-assertion
      this.directoryEntries = getDirectoryEntries(this.fatChain.chains.get(startOfDirectoryChain)!)
    }
  }

  private buildMiniFatSectors(): void {
    const startOfMiniFat = this.header.startOfMiniFat
    if (startOfMiniFat !== SectorType.ENDOFCHAIN) {
      if (!this.fatChain.chains.has(startOfMiniFat)) {
        throw new Error(`MiniFAT sector not found. It was supposed to be available at ${startOfMiniFat}.`)
      }
      // tslint:disable-next-line:no-non-null-assertion
      const miniFatView = this.fatChain.chains.get(startOfMiniFat)!
      const miniStreamStart = this.directoryEntries.length === 0 ? null : this.directoryEntries[0].startingSectorLocation
      if (miniStreamStart === null || !this.fatChain.chains.has(miniStreamStart)) {
        throw new Error(`MiniStream sector not found. It was supposed to be available at ${miniStreamStart}.`)
      }
      // tslint:disable-next-line:no-non-null-assertion
      const miniStreamView = this.fatChain.chains.get(miniStreamStart)!
      const sectorSize = this.header.miniSectorSize
      const miniStreamSectors = chunkBuffer(miniStreamView, sectorSize)
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
