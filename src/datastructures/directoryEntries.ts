import { DirectoryEntryView, SectorView } from './dataViews'

export class DirectoryEntries {
  constructor(private sector: SectorView) {
    let buffer = this.sector.buffer
    let entrySize = 128
    let numberOfEntries = buffer.byteLength / entrySize
    let nthEntryStart = (index: number) => entrySize * index
    let slicedBuffer = (index: number) => buffer.slice(nthEntryStart(index), nthEntryStart(index + 1))
    this.entries = Array.from(Array(numberOfEntries).keys())
      .map(index => new DirectoryEntryView(slicedBuffer(index)))
      .filter(entry => entry.nameLength)
  }

  public entries: DirectoryEntryView[]
}
