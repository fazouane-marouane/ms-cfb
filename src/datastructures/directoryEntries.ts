import { assertIsDefined, chunkBuffer } from '../helpers'
import { DirectoryDescription, FileDescription } from './directory'
import { DirectoryEntry } from './directoryEntry'
import { ObjectType, SectorType, StreamType } from './enums'

/**
 * Interpret a `buffer` into a sequence of `DirectoryEntry`s. Unallocated CFB objects are simply ignored.
 *
 * @param buffer The buffer to be turned into a sequence of cfb entries
 */
export function getDirectoryEntries(buffer: ArrayBuffer): DirectoryEntry[] {
  return chunkBuffer(buffer, 128)
    .map((chunk: ArrayBuffer, index: number) => {
      const entry = new DirectoryEntry(chunk)
      if (!entry.check()) {
        throw new Error(`Directory entry ${index} not properly formatted.`)
      }

      return entry
    })
    .filter((entry: DirectoryEntry) => entry.getObjectType() !== ObjectType.UNALLOCATED)
}

/**
 * Traverse a red-black tree in the natural order LEFT-ROOT-RIGHT.
 *
 * This function is purposefully not implemented in a recursive manner to avoid stack-overflows caused by deep recursions.
 *
 * @param rootId index to the root of the subtree to be visited
 * @param entries list of all directory entries to be considered
 * @param fileCallback callback to when a file node is beeing visited
 * @param directoryCallback callback to when a directory node is beeing visited
 */
function redBlackTreeTraversal(rootId: number, entries: DirectoryEntry[],
  fileCallback: (entry: DirectoryEntry) => void,
  directoryCallback: (entry: DirectoryEntry, id: number) => void): void {
  const toExplore: { id: number, visited: boolean }[] = [{ id: rootId, visited: false }]
  while (toExplore.length > 0) {
    // tslint:disable-next-line:no-non-null-assertion
    const { id: currentIndex, visited } = toExplore.pop()!
    const currentEntry = entries[currentIndex]
    if (visited) {
      if (currentEntry.getObjectType() === ObjectType.STREAM) {
        fileCallback(currentEntry)
      } else {
        directoryCallback(currentEntry, currentIndex)
      }
    } else {
      const rightId = currentEntry.getRightId()
      if (rightId !== StreamType.NOSTREAM) {
        toExplore.push({ id: rightId, visited: false })
      }
      toExplore.push({ id: currentIndex, visited: true })
      const leftId = currentEntry.getLeftId()
      if (leftId !== StreamType.NOSTREAM) {
        toExplore.push({id: leftId, visited: false})
      }
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
function completeDirectoryTreeTraversal(rootId: number, entries: DirectoryEntry[],
  fileCallback: (entry: DirectoryEntry, parentId: number) => void,
  directoryCallback: (entry: DirectoryEntry, currentId: number, parentId: number) => void): void {
  const toExplore = [rootId]
  while (toExplore.length > 0) {
    // tslint:disable-next-line:no-non-null-assertion
    const currentIndex = toExplore.pop()!
    const firstChild = entries[currentIndex].getChildId()
    redBlackTreeTraversal(firstChild, entries,
      (entry: DirectoryEntry) => {
        fileCallback(entry, currentIndex)
      },
      (entry: DirectoryEntry, entryId: number) => {
        directoryCallback(entry, entryId, currentIndex)
        if (entry.getChildId() !== StreamType.NOSTREAM) {
          toExplore.push(entryId)
        }
      })
  }
}

/**
 * Build the complete directory hierarchy provided the implicit relationship between the files/directories
 * inside a CFB (The `DirectoryEntry`s).
 *
 * @param entries The directory entries which represent the implicit relationship of the directory tree in a CFB structure
 * @param miniSectorCutoff The cutoff file size below which the file stream should be retrieved from `miniFatChain`
 * @param fatChain Collection of file streams which can be retrieved by the position of their first sector in the FAT.
 * @param miniFatChain Collection of file streams which can be retrieved by the position of their first sector in the MiniFAT.
 */
export function buildHierarchy(entries: DirectoryEntry[], miniSectorCutoff: number,
  fatChain: Map<number, ArrayBuffer>, miniFatChain: Map<number, ArrayBuffer>): DirectoryDescription {
  const directories = new Map<number, DirectoryDescription>()
  entries.forEach((entry: DirectoryEntry, index: number) => {
    if (entry.getObjectType() !== ObjectType.STREAM) {
      directories.set(index, new DirectoryDescription())
    }
  })
  completeDirectoryTreeTraversal(0, entries,
    (entry: DirectoryEntry, parentId: number) => {
      let chains = fatChain
      const streamSize = entry.getStreamSize()
      if (streamSize < miniSectorCutoff) {
        chains = miniFatChain
      }
      const sectorId = entry.getStartingSectorLocation()
      // tslint:disable-next-line:no-non-null-assertion
      directories.get(parentId)!.files.set(entry.getName(), new FileDescription(
        sectorId <= SectorType.MAXREGSECT ? assertIsDefined(chains.get(sectorId)).slice(0, streamSize) :
          new Uint8Array(0).buffer))
    },
    (entry: DirectoryEntry, entryId: number, parentId: number) => {
      // tslint:disable-next-line:no-non-null-assertion
      directories.get(parentId)!.subdirectories.set(entry.getName(), directories.get(entryId)!)
    })

  // tslint:disable-next-line:no-non-null-assertion
  return directories.get(0)!
}
