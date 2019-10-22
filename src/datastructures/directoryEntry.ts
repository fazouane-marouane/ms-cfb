import {
  childIdView,
  directoryEntryNameLengthView,
  directoryEntryNameView,
  leftSiblingIdView,
  objectTypeView,
  rightSiblingIdView,
  startingSectorLocationView,
  streamSizeView,
} from './dataViews';

/**
 *
 */
export class DirectoryEntry {
  constructor(private buffer: DataView) {}

  public check(): boolean {
    const { buffer } = this;
    const chars = directoryEntryNameView(buffer).get();
    const indexOfZero = chars.indexOf(0);
    const nameLength = this.nameLength();

    return (
      directoryEntryNameLengthView(buffer).get() % 2 === 0 &&
      ((indexOfZero === 0 && nameLength === -1) || indexOfZero === nameLength)
    );
  }

  public getName(): string {
    const chars = directoryEntryNameView(this.buffer)
      .get()
      .slice(0, this.nameLength());

    return String.fromCodePoint(...chars);
  }

  public nameLength(): number {
    return directoryEntryNameLengthView(this.buffer).get() / 2 - 1;
  }

  public getStartingSectorLocation(): number {
    return startingSectorLocationView(this.buffer).get();
  }

  public getStreamSize(): number {
    return streamSizeView(this.buffer).get();
  }

  public getLeftId(): number {
    return leftSiblingIdView(this.buffer).get();
  }

  public getRightId(): number {
    return rightSiblingIdView(this.buffer).get();
  }

  public getChildId(): number {
    return childIdView(this.buffer).get();
  }

  public getObjectType(): number {
    return objectTypeView(this.buffer).get();
  }
}
