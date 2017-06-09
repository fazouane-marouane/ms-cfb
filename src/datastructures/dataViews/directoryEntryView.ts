import {} from '../enums'

export class DirectoryEntryView {
  constructor(private buffer: ArrayBuffer) {
    this.directoryEntryNameView = new Uint16Array(this.buffer, 0x00, 32) // 2 * 32 = 64 bytes
  }

  public get name(): string {
    return String.fromCodePoint(...Array.from(this.directoryEntryNameView.values()))
  }

  public directoryEntryNameView: Uint16Array
}
