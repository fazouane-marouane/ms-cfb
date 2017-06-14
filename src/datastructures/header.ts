/**
 *
 */
import { arraysAreEqual, imply } from '../helpers'
import { bytesOrderView, difatChainStartView, directoryChainLengthView,
  directoryChainStartView, fatChainLengthView, headerClsidView,
  headerSignatureView, initialDifatChainView, majorVersionView,
  miniFatStartView, miniSectorCutoffView, miniSectorShiftView, minorVersionView, remainingSpaceView,
  reservedView, resetHeaderV3, resetHeaderV4, sectorShiftView } from './dataViews'
import { SectorType } from './enums'

export class Header {
  constructor(private buffer: ArrayBuffer) {
  }

  public check(): boolean {
    return (
      arraysAreEqual(this.signature, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]) &&
      (this.version === '3.62' || this.version === '4.62') &&
      headerClsidView(this.buffer).every((value: number) => value === 0) &&
      (arraysAreEqual(this.bytesOrder, [0xFF, 0xFE]) || arraysAreEqual(this.bytesOrder, [0xFE, 0xFF])) &&
      imply(this.version === '3.62', this.sectorSize === 512) &&
      imply(this.version === '4.62', this.sectorSize === 4096) &&
      this.miniSectorSize === 64 &&
      reservedView(this.buffer).every((value: number) => value === 0) &&
      imply(this.version === '3.62', directoryChainLengthView(this.buffer)[0] === 0) &&
      this.miniSectorCutoff === 4096 &&
      this.checkDifat() &&
      imply(this.version === '4.62', () => remainingSpaceView(this.buffer).every((value: number) => value === 0))
    )
  }

  private checkDifat(): boolean {
    const endOfInitialDifat = this.initialDifat.indexOf(SectorType.FREESECT)
    if (endOfInitialDifat === -1) {
      return (
        this.startOfDifat !== SectorType.ENDOFCHAIN &&
        this.initialDifat.every((value: number) => value <= SectorType.MAXREGSECT) &&
        this.initialDifat.length < this.numberOfFatSectors
      )
    }

    return (
      this.initialDifat.every((value: number) => value <= SectorType.MAXREGSECT || value === SectorType.FREESECT) &&
      this.initialDifat.slice(endOfInitialDifat).every((value: number) => value === SectorType.FREESECT) &&
      this.initialDifat.slice(0, endOfInitialDifat).length === this.numberOfFatSectors
    )
  }

  private get signature(): number[] {
    return Array.from(headerSignatureView(this.buffer).values())
  }

  private get version(): string {
    return `${majorVersionView(this.buffer)[0]}.${minorVersionView(this.buffer)[0]}`
  }

  public get startOfMiniFat(): number {
    return miniFatStartView(this.buffer)[0]
  }

  public get startOfDifat(): number {
    return difatChainStartView(this.buffer)[0]
  }

  public get startOfDirectoryChain(): number {
    return directoryChainStartView(this.buffer)[0]
  }

  public get initialDifat(): number[] {
    return Array.from(initialDifatChainView(this.buffer).values())
  }

  public get miniSectorCutoff(): number {
    return miniSectorCutoffView(this.buffer)[0]
  }

  public get sectorSize(): number {
    // tslint:disable-next-line:no-bitwise
    return 1 << sectorShiftView(this.buffer)[0]
  }

  private get numberOfFatSectors(): number {
    return fatChainLengthView(this.buffer)[0]
  }

  public get miniSectorSize(): number {
    // tslint:disable-next-line:no-bitwise
    return 1 << miniSectorShiftView(this.buffer)[0]
  }

  public get bytesOrder(): [number, number] {
    const bytesOrder = bytesOrderView(this.buffer)

    return [bytesOrder[0], bytesOrder[1]]
  }

  public resetAsV3(): void {
    resetHeaderV3(this.buffer)
  }

  public resetAsV4(): void {
    resetHeaderV4(this.buffer)
  }
}
