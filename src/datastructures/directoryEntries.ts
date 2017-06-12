import { DirectoryEntryView } from './dataViews'
import { ObjectType } from './enums'
import { chunkBuffer } from '../helpers'

export class DirectoryEntries {
  constructor(buffer: ArrayBuffer) {
    this.entries = chunkBuffer(buffer, 128)
      .map(chunk => new DirectoryEntryView(chunk))
      .filter(entry => entry.objectType !== ObjectType.UNALLOCATED)
  }

  public entries: DirectoryEntryView[]
}
