import { DirectoryEntryView, SectorView } from './dataViews'
import { ObjectType } from './enums'
import { chunkBuffer } from '../helpers'

export class DirectoryEntries {
  constructor(private sector: SectorView) {
    this.buildDirectoryEntries()
  }

  private buildDirectoryEntries() {
    this.entries = chunkBuffer(this.sector.buffer, 128)
      .map(chunk => new DirectoryEntryView(chunk))
      .filter(entry => entry.objectType !== ObjectType.UNALLOCATED)
  }

  public entries: DirectoryEntryView[]
}
