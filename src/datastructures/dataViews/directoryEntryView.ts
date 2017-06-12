import {} from '../enums'

export class DirectoryEntryView {
  constructor(buffer: ArrayBuffer) {
    this.directoryEntryNameView = new Uint16Array(buffer, 0x00, 32) // 2 * 32 = 64 bytes
    this.directoryEntryNameLengthView = new Uint16Array(buffer, 0x40, 1) // 2 * 1 = 2 bytes
    this.objectTypeView = new Uint8Array(buffer, 0x42, 1) // 1 * 1 = 1 byte
    this.flagColorView = new Uint8Array(buffer, 0x43, 1) // 1 * 1 = 1 byte
    this.leftSiblingIdView = new Uint32Array(buffer, 0x44, 1) // 4 * 1 = 4 bytes
    this.rightSiblingIdView = new Uint32Array(buffer, 0x48, 1) // 4 * 1 = 4 bytes
    this.childIdView = new Uint32Array(buffer, 0x4C, 1) // 4 * 1 = 4 bytes
    this.clsidView = new Uint32Array(buffer, 0x50, 4) // 4 * 4 = 16 bytes
    this.stateBitsView = new Uint32Array(buffer, 0x60, 1) // 4 * 1 = 4 bytes
    this.creationTimeView = new Uint8Array(buffer, 0x64, 8) // 1 * 8 = 8 bytes
    this.modificationTimeView = new Uint8Array(buffer, 0x6C, 8) // 1 * 8 = 8 bytes
    this.startingSectorLocationView = new Uint32Array(buffer, 0x74, 1) // 4 * 1 = 4 bytes
    this.streamSizeView = new Uint32Array(buffer, 0x78, 2) // 4 * 2 = 8 bytes
  }

  public check(): boolean {
    let chars = Array.from(this.directoryEntryNameView.values())
    return ((this.directoryEntryNameLengthView[0] % 2 === 0) &&
      chars.indexOf(0) === this.directoryEntryNameLengthView[0] / 2)
  }

  public get name(): string {
    let chars = Array.from(this.directoryEntryNameView.values())
    let zeroIndex = chars.indexOf(0)
    chars.splice(zeroIndex, 32)
    return String.fromCodePoint(...chars)
  }

  public get nameLength(): number {
    return this.directoryEntryNameLengthView[0]/2
  }

  public get startingSectorLocation(): number {
    return this.startingSectorLocationView[0]
  }

  public get streamSize(): number {
    return this.streamSizeView[0]
  }

  public get leftSiblingId(): number {
    return this.leftSiblingIdView[0]
  }

  public get rightSiblingId(): number {
    return this.rightSiblingIdView[0]
  }

  public get childId(): number {
    return this.childIdView[0]
  }

  public get objectType(): number {
    return this.objectTypeView[0]
  }

  private directoryEntryNameView: Uint16Array

  private directoryEntryNameLengthView: Uint16Array

  private objectTypeView: Uint8Array

  private flagColorView: Uint8Array

  private leftSiblingIdView: Uint32Array

  private rightSiblingIdView: Uint32Array

  private childIdView: Uint32Array

  private clsidView: Uint32Array

  private stateBitsView: Uint32Array

  private creationTimeView: Uint8Array

  private modificationTimeView: Uint8Array

  private startingSectorLocationView: Uint32Array

  private streamSizeView: Uint32Array
}
