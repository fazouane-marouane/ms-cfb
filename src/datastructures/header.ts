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
    const version = this.version()
    const bytesOrder = this.bytesOrder()
    const sectorSize = this.sectorSize()

    return (
      arraysAreEqual(this.signature(), [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]) &&
      (version === '3.62' || version === '4.62') &&
      headerClsidView(this.buffer).every((value: number) => value === 0) &&
      (arraysAreEqual(bytesOrder, [0xFF, 0xFE]) || arraysAreEqual(bytesOrder, [0xFE, 0xFF])) &&
      imply(version === '3.62', sectorSize === 512) &&
      imply(version === '4.62', sectorSize === 4096) &&
      this.miniSectorSize() === 64 &&
      reservedView(this.buffer).every((value: number) => value === 0) &&
      imply(version === '3.62', directoryChainLengthView(this.buffer)[0] === 0) &&
      this.miniSectorCutoff() === 4096 &&
      this.checkDifat() &&
      imply(version === '4.62', () => remainingSpaceView(this.buffer).every((value: number) => value === 0))
    )
  }

  private checkDifat(): boolean {
    const initialDifat = this.getInitialDifat()
    const numberOfFatSectors = this.getNumberOfFatSectors()
    const endOfInitialDifat = initialDifat.indexOf(SectorType.FREESECT)
    if (endOfInitialDifat === -1) {
      return (
        this.getStartOfDifat() !== SectorType.ENDOFCHAIN &&
        initialDifat.every((value: number) => value <= SectorType.MAXREGSECT) &&
        initialDifat.length < numberOfFatSectors
      )
    }
    const firstSliceOfInitialDifat = initialDifat.slice(0, endOfInitialDifat)
    const secondSliceOfInitialDifat = initialDifat.slice(endOfInitialDifat)

    return (
      firstSliceOfInitialDifat.every((value: number) => value <= SectorType.MAXREGSECT) &&
      secondSliceOfInitialDifat.every((value: number) => value === SectorType.FREESECT) &&
      firstSliceOfInitialDifat.length === numberOfFatSectors
    )
  }

  private signature(): number[] {
    return Array.from(headerSignatureView(this.buffer).values())
  }

  private version(): string {
    return `${majorVersionView(this.buffer)[0]}.${minorVersionView(this.buffer)[0]}`
  }

  public getStartOfMiniFat(): number {
    return miniFatStartView(this.buffer)[0]
  }

  public getStartOfDifat(): number {
    return difatChainStartView(this.buffer)[0]
  }

  public getStartOfDirectoryChain(): number {
    return directoryChainStartView(this.buffer)[0]
  }

  public getInitialDifat(): number[] {
    return Array.from(initialDifatChainView(this.buffer).values())
  }

  public miniSectorCutoff(): number {
    return miniSectorCutoffView(this.buffer)[0]
  }

  public sectorSize(): number {
    // tslint:disable-next-line:no-bitwise
    return 1 << sectorShiftView(this.buffer)[0]
  }

  private getNumberOfFatSectors(): number {
    return fatChainLengthView(this.buffer)[0]
  }

  public miniSectorSize(): number {
    // tslint:disable-next-line:no-bitwise
    return 1 << miniSectorShiftView(this.buffer)[0]
  }

  public bytesOrder(): [number, number] {
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
