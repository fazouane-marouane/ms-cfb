import { DirectoryEntryView } from './dataViews'
import { ObjectType, StreamType, SectorType } from './enums'
import { chunkBuffer } from '../helpers'
import { VirtualDirectory, VirtualFile } from './directory'

export function getDirectoryEntries(buffer: ArrayBuffer): DirectoryEntryView[] {
  let entries = chunkBuffer(buffer, 128)
    .map(chunk => new DirectoryEntryView(chunk))
    .filter(entry => entry.objectType !== ObjectType.UNALLOCATED)
  return entries
}

function redBlackTreeTour(rootId: number, entries: DirectoryEntryView[],
  foundFile: (entry: DirectoryEntryView) => void,
  foundDirectory: (entry: DirectoryEntryView, id: number) => void): void {
  let toExplore: number[] = [rootId]
  while (toExplore.length > 0) {
    let currentIndex = toExplore.pop()!
    let currentEntry = entries[currentIndex]
    if (currentEntry.objectType === ObjectType.STREAM) {
      foundFile(currentEntry)
    }
    else {
      foundDirectory(currentEntry, currentIndex)
    }
    if (currentEntry.leftSiblingId !== StreamType.NOSTREAM) {
      toExplore.push(currentEntry.leftSiblingId)
    }
    if (currentEntry.rightSiblingId !== StreamType.NOSTREAM) {
      toExplore.push(currentEntry.rightSiblingId)
    }
  }
}

function completeTreeTour(rootId: number, entries: DirectoryEntryView[],
  foundFile: (entry: DirectoryEntryView, parentId: number) => void,
  foundDirectory: (entry: DirectoryEntryView, currentId: number, parentId: number) => void) {
  let toExplore = [rootId]
  while (toExplore.length > 0) {
    let currentIndex = toExplore.pop()!
    let firstChild = entries[currentIndex].childId
    redBlackTreeTour(firstChild, entries, entry => {
      foundFile(entry, currentIndex)
    }, (entry, entryId) => {
      foundDirectory(entry, entryId, currentIndex)
      if (entry.childId !== StreamType.NOSTREAM) {
        toExplore.push(entryId)
      }
    })
  }
}

export function buildHierarchy(entries: DirectoryEntryView[], miniSectorCutoff: number,
  fatChain: Map<number, ArrayBuffer>, miniFatChain: Map<number, ArrayBuffer>): VirtualDirectory {
  let directories = new Map<number, VirtualDirectory>()
  entries.forEach((entry, index) => {
    if (entry.objectType !== ObjectType.STREAM) {
      directories.set(index, new VirtualDirectory)
    }
  })
  completeTreeTour(0, entries, (entry, parentId) => {
    let chains = fatChain
    if (entry.streamSize < miniSectorCutoff) {
      chains = miniFatChain
    }
    let sectorId = entry.startingSectorLocation
    directories.get(parentId)!.files.set(entry.name, new VirtualFile(
      sectorId <= SectorType.MAXREGSECT ? chains.get(sectorId)!.slice(0, entry.streamSize) :
        new Uint8Array(0).buffer))
  }, (entry, entryId, parentId) => {
    directories.get(parentId)!.subdirectories.set(entry.name, directories.get(entryId)!)
  })
  return directories.get(0)!
}
