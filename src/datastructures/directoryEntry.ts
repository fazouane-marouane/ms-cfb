import { childIdView, clsidView,
  creationTimeView, directoryEntryNameLengthView, directoryEntryNameView, flagColorView,
  leftSiblingIdView, modificationTimeView,
  objectTypeView, rightSiblingIdView, startingSectorLocationView, stateBitsView,
  streamSizeView } from './dataViews'

/**
 *
 */
export class DirectoryEntry {
  constructor(private buffer: ArrayBuffer) {}

  public check(): boolean {
    const { buffer } = this
    const chars = directoryEntryNameView(buffer).getValue()
    const indexOfZero = chars.indexOf(0)
    const nameLength = this.nameLength()

    return ((directoryEntryNameLengthView(buffer).getValue() % 2 === 0) &&
      ((indexOfZero === 0 && nameLength === -1) || indexOfZero === nameLength))
  }

  public getName(): string {
    const chars = directoryEntryNameView(this.buffer).getValue()
      .slice(0, this.nameLength())

    return String.fromCodePoint(...chars)
  }

  public nameLength(): number {
    return directoryEntryNameLengthView(this.buffer).getValue() / 2 - 1
  }

  public getStartingSectorLocation(): number {
    return startingSectorLocationView(this.buffer).getValue()
  }

  public getStreamSize(): number {
    return streamSizeView(this.buffer).getValue()
  }

  public getLeftId(): number {
    return leftSiblingIdView(this.buffer).getValue()
  }

  public getRightId(): number {
    return rightSiblingIdView(this.buffer).getValue()
  }

  public getChildId(): number {
    return childIdView(this.buffer).getValue()
  }

  public getObjectType(): number {
    return objectTypeView(this.buffer).getValue()
  }
}
