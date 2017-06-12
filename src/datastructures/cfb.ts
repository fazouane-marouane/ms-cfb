import { Header } from './header'
import { FatChain } from './fatCHain'
import { DirectoryEntries } from './directoryEntries'
import { HeaderView, DifatSectorView, FatSectorView } from './dataViews'
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
    this.buildDirectoryHierarchy()
  }

  public buildSectors() {
    let sectorSize = this.header.sectorSize
    this.sectors = chunkBuffer(this.buffer.slice(sectorSize), sectorSize)
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
      result.push(...difatSector.partialArray)
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
      let miniFatView = this.fatChain.chains.get(startOfMiniFat)!
      let miniStreamView = this.fatChain.chains.get(this.directoryEntries.entries[0].startingSectorLocation)!
      let sectorSize = this.header.miniSectorSize
      let miniStreamSectors = chunkBuffer(miniStreamView, sectorSize)
      this.miniFatChain = new FatChain([new FatSectorView(miniFatView)], miniStreamSectors)
    }
  }

  public buildDirectoryHierarchy() {
    let directories = new Map<number, VirtualDirectory>()
    let children = new Map<number, number[]>()
    this.directoryEntries.entries.forEach((entry, index) => {
      if (entry.objectType !== ObjectType.STREAM) {
        directories.set(index, new VirtualDirectory)
        let currentChildren: number[] = []
        let toExplore: number[] = [entry.childId]
        while (toExplore.length > 0) {
          let currentIndex = toExplore.pop()!
          currentChildren.push(currentIndex)
          let currentEntry = this.directoryEntries.entries[currentIndex]
          if (currentEntry.leftSiblingId !== StreamType.NOSTREAM) {
            toExplore.push(currentEntry.leftSiblingId)
          }
          if (currentEntry.rightSiblingId !== StreamType.NOSTREAM) {
            toExplore.push(currentEntry.rightSiblingId)
          }
        }
        children.set(index, currentChildren)
      }
    })
    let toExplore = [0]
    while (toExplore.length > 0) {
      let currentDirectoryIndex = toExplore.pop()!
      let currentDirectory = directories.get(currentDirectoryIndex)!
      for(let childId of children.get(currentDirectoryIndex)!) {
        let child = this.directoryEntries.entries[childId]
        if (child.objectType !== ObjectType.STREAM) {
          currentDirectory.subdirectories.set(child.name, directories.get(childId)!)
          toExplore.push(childId)
        }
        else {
          let chains = this.fatChain.chains
          if(child.streamSize < this.header.miniSectorCutoff) {
            chains = this.miniFatChain.chains
          }
          let sectorId = child.startingSectorLocation
          if(sectorId <= SectorType.MAXREGSECT) {
            currentDirectory.files.set(child.name, new VirtualFile(chains.get(sectorId)!.slice(0, child.streamSize)))
          }
          else {
            currentDirectory.files.set(child.name, new VirtualFile(new Uint8Array(0).buffer))
          }
        }
      }
    }
    this.root = directories.get(0)!
  }

  public header: Header

  public sectors: ArrayBuffer[]

  public fatSectors: FatSectorView[]

  public fatChain: FatChain

  public miniFatChain: FatChain

  public directoryEntries: DirectoryEntries

  public root: VirtualDirectory
}
