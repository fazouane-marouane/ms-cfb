import { assertIsDefined, chunkBuffer } from '../helpers'
import { DirectoryEntryView } from './dataViews'
import { VirtualDirectory, VirtualFile } from './directory'
import { ObjectType, SectorType, StreamType } from './enums'

/**
 * Interpret a `buffer` into a sequence of `DirectoryEntryView`s. Unallocated CFB objects are simply ignored.
 * @param buffer The buffer to be turned into a sequence of cfb entries
 */
export function getDirectoryEntries(buffer: ArrayBuffer): DirectoryEntryView[] {
  return chunkBuffer(buffer, 128)
    .map((chunk: ArrayBuffer) => new DirectoryEntryView(chunk))
    .filter((entry: DirectoryEntryView) => entry.objectType !== ObjectType.UNALLOCATED)
}

/**
 * Traverse a red-black tree in the following order ROOT-LEFT-RIGHT.
 *
 * This function is purposefully not implemented in a recursive manner to avoid stack-overflows caused by deep recursions.
 *
 * @param rootId index to the root of the subtree to be visited
 * @param entries list of all directory entries to be considered
 * @param fileCallback callback to when a file node is beeing visited
 * @param directoryCallback callback to when a directory node is beeing visited
 */
function redBlackTreeTraversal(rootId: number, entries: DirectoryEntryView[],
  fileCallback: (entry: DirectoryEntryView) => void,
  directoryCallback: (entry: DirectoryEntryView, id: number) => void): void {
  const toExplore: number[] = [rootId]
  while (toExplore.length > 0) {
    // tslint:disable-next-line:no-non-null-assertion
    const currentIndex = toExplore.pop()!
    const currentEntry = entries[currentIndex]
    if (currentEntry.objectType === ObjectType.STREAM) {
      fileCallback(currentEntry)
    } else {
      directoryCallback(currentEntry, currentIndex)
    }
    if (currentEntry.leftSiblingId !== StreamType.NOSTREAM) {
      toExplore.unshift(currentEntry.leftSiblingId)
    }
    if (currentEntry.rightSiblingId !== StreamType.NOSTREAM) {
      toExplore.push(currentEntry.rightSiblingId)
    }
  }
}

/**
 * Traverse a CFB tree in breath first style:
 * visit all nodes in the root directory then recursively visit the child directories.
 *
 * This function is purposefully not implemented in a recursive manner to avoid stack-overflows caused by deep recursions.
 *
 * @param rootId index to the root of the CFB tree
 * @param entries list of all directory entries to be considered
 * @param fileCallback callback to when a file node is beeing visited
 * @param directoryCallback callback to when a directory node is beeing visited
 */
function completeDirectoryTreeTraversal(rootId: number, entries: DirectoryEntryView[],
  fileCallback: (entry: DirectoryEntryView, parentId: number) => void,
  directoryCallback: (entry: DirectoryEntryView, currentId: number, parentId: number) => void): void {
  const toExplore = [rootId]
  while (toExplore.length > 0) {
    // tslint:disable-next-line:no-non-null-assertion
    const currentIndex = toExplore.pop()!
    const firstChild = entries[currentIndex].childId
    redBlackTreeTraversal(firstChild, entries,
      (entry: DirectoryEntryView) => {
        fileCallback(entry, currentIndex)
      },
      (entry: DirectoryEntryView, entryId: number) => {
        directoryCallback(entry, entryId, currentIndex)
        if (entry.childId !== StreamType.NOSTREAM) {
          toExplore.push(entryId)
        }
      })
  }
}

/**
 * Build the complete directory hierarchy provided the implicit relationship between the files/directories
 * inside a CFB (The `DirectoryEntryView`s).
 *
 * @param entries The directory entries which represent the implicit relationship of the directory tree in a CFB structure
 * @param miniSectorCutoff The cutoff file size below which the file stream should be retrieved from `miniFatChain`
 * @param fatChain Collection of file streams which can be retrieved by the position of their first sector in the FAT.
 * @param miniFatChain Collection of file streams which can be retrieved by the position of their first sector in the MiniFAT.
 */
export function buildHierarchy(entries: DirectoryEntryView[], miniSectorCutoff: number,
  fatChain: Map<number, ArrayBuffer>, miniFatChain: Map<number, ArrayBuffer>): VirtualDirectory {
  const directories = new Map<number, VirtualDirectory>()
  entries.forEach((entry: DirectoryEntryView, index: number) => {
    if (entry.objectType !== ObjectType.STREAM) {
      directories.set(index, new VirtualDirectory())
    }
  })
  completeDirectoryTreeTraversal(0, entries,
    (entry: DirectoryEntryView, parentId: number) => {
      let chains = fatChain
      if (entry.streamSize < miniSectorCutoff) {
        chains = miniFatChain
      }
      const sectorId = entry.startingSectorLocation
    // tslint:disable-next-line:no-non-null-assertion
      directories.get(parentId)!.files.set(entry.name, new VirtualFile(
        sectorId <= SectorType.MAXREGSECT ? assertIsDefined(chains.get(sectorId)).slice(0, entry.streamSize) :
          new Uint8Array(0).buffer))
    },
    (entry: DirectoryEntryView, entryId: number, parentId: number) => {
    // tslint:disable-next-line:no-non-null-assertion
      directories.get(parentId)!.subdirectories.set(entry.name, directories.get(entryId)!)
    })

  // tslint:disable-next-line:no-non-null-assertion
  return directories.get(0)!
}
