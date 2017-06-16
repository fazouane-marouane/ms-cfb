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

function throwError(message: string): never {
  throw new Error(message)
}

/**
 *
 */
export class Header {
  constructor(private buffer: ArrayBuffer) {
  }

  public check(): void | never {
    const version = this.version()
    const bytesOrder = this.bytesOrder()
    const sectorSize = this.sectorSize()
    const { buffer } = this

    if (!arraysAreEqual(this.signature(), [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
      throwError('wrong header signature')
    }
    if (version !== '3.62' && version !== '4.62') {
      throwError('wrong version')
    }
    if (!headerClsidView(buffer).getValue().every((value: number) => value === 0)) {
      throwError('wrong clsid')
    }
    if (bytesOrder !== 0xFFFE && bytesOrder !== 0xFEFF) {
      throwError('wrong bytes order')
    }
    if (version === '3.62' && sectorSize !== 512) {
      throwError('wrong sector size')
    }
    if (version === '4.62' && sectorSize !== 4096) {
      throwError('wrong sector size')
    }
    if (this.miniSectorSize() !== 64) {
      throwError('wrong minisector size')
    }
    if (!reservedView(buffer).getValue().every((value: number) => value === 0)) {
      throwError('wrong reserved')
    }
    if (version === '3.62' && directoryChainLengthView(buffer).getValue() !== 0) {
      throwError('wrong directory chain length')
    }
    if (this.miniSectorCutoff() !== 4096) {
      throwError('wrong minisector cutoff')
    }
    if (version === '4.62' && !remainingSpaceView(buffer).getValue().every((value: number) => value === 0)) {
      throwError('wrong remaining space')
    }
    this.checkDifat()
  }

  private checkDifat(): boolean {
    const initialDifat = this.getInitialDifat()
    const numberOfFatSectors = this.getNumberOfFatSectors()
    const endOfInitialDifat = initialDifat.indexOf(SectorType.FREESECT)
    const startOfDifat = this.getStartOfDifat()
    if (endOfInitialDifat === -1) {
      if (startOfDifat === SectorType.ENDOFCHAIN) {
        throwError('wrong start of difat')
      }
      if (!initialDifat.every((value: number) => value <= SectorType.MAXREGSECT)) {
        throwError('wrong initial difat')
      }
      if (initialDifat.length >= numberOfFatSectors) {
        throwError('wrong number of fat sectors')
      }

      return true
    }
    const firstSliceOfInitialDifat = initialDifat.slice(0, endOfInitialDifat)
    const secondSliceOfInitialDifat = initialDifat.slice(endOfInitialDifat)

    if (startOfDifat !== SectorType.ENDOFCHAIN) {
      throwError('wrong start of difat')
    }
    if (!firstSliceOfInitialDifat.every((value: number) => value <= SectorType.MAXREGSECT) ||
      !secondSliceOfInitialDifat.every((value: number) => value === SectorType.FREESECT)) {
      throwError('wrong initial difat')
    }
    if (firstSliceOfInitialDifat.length !== numberOfFatSectors) {
      throwError('wrong number of fat sectors')
    }

    return true
  }

  private signature(): number[] {
    return headerSignatureView(this.buffer).getValue()
  }

  private version(): string {
    return `${majorVersionView(this.buffer).getValue()}.${minorVersionView(this.buffer).getValue()}`
  }

  public getStartOfMiniFat(): number {
    return miniFatStartView(this.buffer).getValue()
  }

  public getStartOfDifat(): number {
    return difatChainStartView(this.buffer).getValue()
  }

  public getStartOfDirectoryChain(): number {
    return directoryChainStartView(this.buffer).getValue()
  }

  public getInitialDifat(): number[] {
    return initialDifatChainView(this.buffer).getValue()
  }

  public miniSectorCutoff(): number {
    return miniSectorCutoffView(this.buffer).getValue()
  }

  public sectorSize(): number {
    // tslint:disable-next-line:no-bitwise
    return 1 << sectorShiftView(this.buffer).getValue()
  }

  private getNumberOfFatSectors(): number {
    return fatChainLengthView(this.buffer).getValue()
  }

  public miniSectorSize(): number {
    // tslint:disable-next-line:no-bitwise
    return 1 << miniSectorShiftView(this.buffer).getValue()
  }

  public bytesOrder(): number {
    return bytesOrderView(this.buffer).getValue()
  }

  public resetAsV3(): void {
    resetHeaderV3(this.buffer)
  }

  public resetAsV4(): void {
    resetHeaderV4(this.buffer)
  }
}
