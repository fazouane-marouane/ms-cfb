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
    const header = this.header = new Header(buffer)
    if (!header.check()) {
      throw new Error('bad format.')
    }
    this.buildSectors(buffer, header)
    this.buildFatSectors(header)
    this.buildDirectoryEntries(header)
    this.buildMiniFatSectors(header)
    // build the directory's hierarchy
    this.root = buildHierarchy(this.directoryEntries, header.miniSectorCutoff(),
      this.fatChain.chains, this.miniFatChain.chains)
  }

  private buildSectors(buffer: ArrayBuffer, header: Header): void {
    const sectorSize = header.sectorSize()
    this.sectors = chunkBuffer(buffer.slice(sectorSize), sectorSize)
  }

  private buildFatSectors(header: Header): void {
    const visitedSectors = new Set<number>()
    this.fatSectors = this.getDifatArray(visitedSectors, header)
      .map((sectorNumber: number) => {
        if (visitedSectors.has(sectorNumber)) {
          throw new Error(`sector ${sectorNumber}'s already been visited.`)
        }
        visitedSectors.add(sectorNumber)

        return new FatSectorView(this.sectors[sectorNumber])
      })
    this.fatChain = new FatChain(this.fatSectors, this.sectors)
  }

  private getDifatArray(visitedSectors: Set<number>, header: Header): number[] {
    const result = header.getInitialDifat()
    let currentIndex = header.getStartOfDifat()
    while (currentIndex !== SectorType.ENDOFCHAIN) {
      if (currentIndex >= this.sectors.length) {
        throw new Error(`sector index ${currentIndex} is outside the file size.`)
      }
      if (visitedSectors.has(currentIndex)) {
        throw new Error(`sector ${currentIndex}'s already been visited`)
      }
      const difatSector = new DifatSectorView(this.sectors[currentIndex])
      result.push(...difatSector.partialArray)
      visitedSectors.add(currentIndex)
      currentIndex = difatSector.nextDifatSectorIndex
    }

    return result
      .filter((sectorNumber: number) => sectorNumber <= SectorType.MAXREGSECT)
  }

  private buildDirectoryEntries(header: Header): void {
    const startOfDirectoryChain = header.getStartOfDirectoryChain()
    if (startOfDirectoryChain !== SectorType.ENDOFCHAIN) {
      if (!this.fatChain.chains.has(startOfDirectoryChain)) {
        throw new Error(`Directory sector ${startOfDirectoryChain} not found`)
      }
      // tslint:disable-next-line:no-non-null-assertion
      this.directoryEntries = getDirectoryEntries(this.fatChain.chains.get(startOfDirectoryChain)!)
    }
  }

  private buildMiniFatSectors(header: Header): void {
    const startOfMiniFat = header.getStartOfMiniFat()
    if (startOfMiniFat !== SectorType.ENDOFCHAIN) {
      if (!this.fatChain.chains.has(startOfMiniFat)) {
        throw new Error(`MiniFAT sector ${startOfMiniFat} not found`)
      }
      // tslint:disable-next-line:no-non-null-assertion
      const miniFatView = this.fatChain.chains.get(startOfMiniFat)!
      const miniStreamStart = this.directoryEntries.length === 0 ? null : this.directoryEntries[0].startingSectorLocation
      if (miniStreamStart === null || !this.fatChain.chains.has(miniStreamStart)) {
        throw new Error(`MiniStream sector ${miniStreamStart} not found`)
      }
      // tslint:disable-next-line:no-non-null-assertion
      const miniStreamView = this.fatChain.chains.get(miniStreamStart)!
      const sectorSize = header.miniSectorSize()
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
