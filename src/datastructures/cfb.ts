import { chunkBuffer } from '../helpers'
import { DifatSectorView, FatSectorView } from './dataViews'
import { VirtualDirectory, VirtualFile } from './directory'
import { buildHierarchy, getDirectoryEntries } from './directoryEntries'
import { DirectoryEntry } from './directoryEntry'
import { ObjectType, SectorType, StreamType } from './enums'
import { getFatChains } from './fatChain'
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
      this.fatChain, this.miniFatChain)
  }

  private buildSectors(buffer: ArrayBuffer, header: Header): void {
    const sectorSize = header.sectorSize()
    this.sectors = chunkBuffer(buffer.slice(sectorSize), sectorSize)
  }

  private buildFatSectors(header: Header): void {
    const visitedSectors = new Set<number>()
    const {sectors} = this
    const fatSectors = this.fatSectors = this.getDifatArray(visitedSectors, header)
      .map((sectorNumber: number) => {
        if (visitedSectors.has(sectorNumber)) {
          throw new Error(`sector ${sectorNumber}'s already been visited.`)
        }
        visitedSectors.add(sectorNumber)

        return new FatSectorView(sectors[sectorNumber])
      })
    this.fatChain = getFatChains(fatSectors, sectors)
  }

  private getDifatArray(visitedSectors: Set<number>, header: Header): number[] {
    const result = header.getInitialDifat()
    let currentIndex = header.getStartOfDifat()
    const {sectors} = this
    while (currentIndex !== SectorType.ENDOFCHAIN) {
      if (currentIndex >= sectors.length) {
        throw new Error(`sector index ${currentIndex} is outside the file size.`)
      }
      if (visitedSectors.has(currentIndex)) {
        throw new Error(`sector ${currentIndex}'s already been visited`)
      }
      const difatSector = new DifatSectorView(sectors[currentIndex])
      result.push(...difatSector.getArray())
      visitedSectors.add(currentIndex)
      currentIndex = difatSector.getNextIndex()
    }

    return result
      .filter((sectorNumber: number) => sectorNumber <= SectorType.MAXREGSECT)
  }

  private buildDirectoryEntries(header: Header): void {
    const startOfDirectoryChain = header.getStartOfDirectoryChain()
    const {fatChain} = this
    if (startOfDirectoryChain !== SectorType.ENDOFCHAIN) {
      if (!fatChain.has(startOfDirectoryChain)) {
        throw new Error(`Directory sector ${startOfDirectoryChain} not found`)
      }
      // tslint:disable-next-line:no-non-null-assertion
      this.directoryEntries = getDirectoryEntries(fatChain.get(startOfDirectoryChain)!)
    }
  }

  private buildMiniFatSectors(header: Header): void {
    const startOfMiniFat = header.getStartOfMiniFat()
    const {fatChain, directoryEntries} = this
    if (startOfMiniFat !== SectorType.ENDOFCHAIN) {
      if (!fatChain.has(startOfMiniFat)) {
        throw new Error(`MiniFAT sector ${startOfMiniFat} not found`)
      }
      // tslint:disable-next-line:no-non-null-assertion
      const miniFatView = fatChain.get(startOfMiniFat)!
      const miniStreamStart = directoryEntries.length === 0 ? null : directoryEntries[0].getStartingSectorLocation()
      if (miniStreamStart === null || !fatChain.has(miniStreamStart)) {
        throw new Error(`MiniStream sector ${miniStreamStart} not found`)
      }
      // tslint:disable-next-line:no-non-null-assertion
      const miniStreamView = fatChain.get(miniStreamStart)!
      const sectorSize = header.miniSectorSize()
      const miniStreamSectors = chunkBuffer(miniStreamView, sectorSize)
      this.miniFatChain = getFatChains([new FatSectorView(miniFatView)], miniStreamSectors)
    }
  }

  public header: Header

  public sectors: ArrayBuffer[]

  public fatSectors: FatSectorView[]

  public fatChain: Map<number, ArrayBuffer>

  public miniFatChain: Map<number, ArrayBuffer>

  public directoryEntries: DirectoryEntry[]

  public root: VirtualDirectory
}
