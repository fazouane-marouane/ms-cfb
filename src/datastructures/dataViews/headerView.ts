import { SectorType } from '../enums'

/**
 *
 */
export class HeaderView {
  constructor(private buffer: ArrayBuffer) {
    // Header
    this.headerSignatureView = new Uint8Array(this.buffer, 0x00, 8) // 1 * 8 = 8 bytes
    // Clsid
    this.headerClsidView = new Uint32Array(this.buffer, 0x08, 4) // 4 * 4 = 16 bytes
    // minor version
    this.minorVersionView = new Uint16Array(this.buffer, 0x18, 1) // 2 * 1 = 2 bytes
    // major version
    this.majorVersionView = new Uint16Array(this.buffer, 0x1A, 1) // 2 * 1 = 2 bytes
    // bytes order
    this.bytesOrderView = new Uint8Array(this.buffer, 0x1C, 2) // 1 * 2 = 2 bytes
    // sector shift
    this.sectorShiftView = new Uint16Array(this.buffer, 0x1E, 1) // 2 * 1 = 2 bytes
    // minisector shift
    this.miniSectorShiftView = new Uint16Array(this.buffer, 0x20, 1) // 2 * 1 = 2 bytes
    // reserved
    this.reservedView = new Uint16Array(this.buffer, 0x22, 3) // 2 * 3 = 6 bytes
    // directory chain length
    this.directoryChainLengthView = new Uint32Array(this.buffer, 0x28, 1) // 4 * 1 = 4 bytes
    // fat chain length
    this.fatChainLengthView = new Uint32Array(this.buffer, 0x2C, 1) // 4 * 1 = 4 bytes
    // directory chain start
    this.directoryChainStartView = new Uint32Array(this.buffer, 0x30, 1) // 4 * 1 = 4 bytes
    // transaction signature
    this.transactionSignatureView = new Uint32Array(this.buffer, 0x34, 1) // 4 * 1 = 4 bytes
    // mini sector cutoff
    this.miniSectorCutoff = new Uint32Array(this.buffer, 0x38, 1) // 4 * 1 = 4 bytes
    // mini fat start
    this.miniFatStart = new Uint32Array(this.buffer, 0x3C, 1) // 4 * 1 = 4 bytes
    // mini fat chain length
    this.miniFatChainLength = new Uint32Array(this.buffer, 0x40, 1) // 4 * 1 = 4 bytes
    // difat chain start
    this.difatChainStart = new Uint32Array(this.buffer, 0x44, 1) // 4 * 1 = 4 bytes
    // difat chain length
    this.difatChainLength = new Uint32Array(this.buffer, 0x48, 1) // 4 * 1 = 4 bytes
    // initial difat chain
    this.initialDifatChain = new Uint32Array(this.buffer, 0x4C, 109) // 4 * 109 = 436
  }

  public reset(): void {
    this.headerSignatureView.set([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])
    this.headerClsidView.fill(0)
    this.minorVersionView.fill(0x003E)
    // byte order
    new Uint16Array(this.buffer, 0x1C, 1).fill(0xFFFE)
    this.miniSectorShiftView.fill(0x0006)
    this.reservedView.fill(0)
    this.directoryChainLengthView.fill(0)
    this.fatChainLengthView.fill(0)
    this.directoryChainStartView.fill(SectorType.ENDOFCHAIN)
    this.transactionSignatureView.fill(0)
    this.miniSectorCutoff.fill(0x00001000)
    this.miniFatStart.fill(SectorType.ENDOFCHAIN)
    this.miniFatChainLength.fill(0)
    this.difatChainStart.fill(SectorType.ENDOFCHAIN)
    this.difatChainLength.fill(0)
    this.initialDifatChain.fill(SectorType.FREESECT)
  }

  public resetAsV4(): void {
    this.reset()
    this.majorVersionView.fill(0x0004)
    this.sectorShiftView.fill(0x000c)
    this.remainingSpace.fill(0)
  }

  public resetAsV3(): void {
    this.reset()
    this.majorVersionView.fill(0x0003)
    this.sectorShiftView.fill(0x0009)
  }

  /**
   * Header Signature (8 bytes)
   * This 8 bytes array should always be equal to
   * 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1
   */
  public headerSignatureView: Uint8Array

  /**
   * Header CLSID (16 bytes)
   * Should be always contain zeros
   */
  public headerClsidView: Uint32Array

  /**
   * Minor version
   */
  public minorVersionView: Uint16Array

  /**
   * Major version
   */
  public majorVersionView: Uint16Array

  /**
   * Bytes order
   */
  public bytesOrderView: Uint8Array

  /**
   * Sector shift
   */
  public sectorShiftView: Uint16Array

  /**
   * Mini sector shift
   */
  public miniSectorShiftView: Uint16Array

  /**
   * Reserved
   */
  public reservedView: Uint16Array

  /**
   * Directory chain length
   */
  public directoryChainLengthView: Uint32Array

  /**
   * Fat chain length
   */
  public fatChainLengthView: Uint32Array

  /**
   * Directory chain start
   */
  public directoryChainStartView: Uint32Array

  /**
   * Transaction signature
   */
  public transactionSignatureView: Uint32Array

  /**
   * Mini sectors cutoff
   */
  public miniSectorCutoff: Uint32Array

  /**
   * Mini fat start
   */
  public miniFatStart: Uint32Array

  /**
   * Mini fat chain length
   */
  public miniFatChainLength: Uint32Array

  /**
   * Difat chain start
   */
  public difatChainStart: Uint32Array

  /**
   * Difat chain length
   */
  public difatChainLength: Uint32Array

  /**
   * Initial Difat chain
   */
  public initialDifatChain: Uint32Array

  /**
   * Remaining empty space
   */
  public get remainingSpace(): Uint32Array {
    // tslint:disable-next-line:no-bitwise
    return new Uint32Array(this.buffer, 1 << 0x9, (1 << 0xc) - (1 << 0x9))
  }
}
