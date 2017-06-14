import { SectorType } from '../enums'

/**
 * Header Signature (8 bytes). This array should always equal:
 * `[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]`
 *
 * @param buffer The header's buffer
 */
export function headerSignatureView(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer, 0x00, 8) // 1 * 8 = 8 bytes
}

/**
 * Header CLSID (16 bytes). This should always contain zeros.
 *
 * @param buffer The header's buffer
 */
export function headerClsidView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x08, 4) // 4 * 4 = 16 bytes
}

/**
 * The CFB's minor version (2 bytes). This field should always be 0x003E (62).
 *
 * @param buffer The header's buffer
 */
export function minorVersionView(buffer: ArrayBuffer): Uint16Array {
  return new Uint16Array(buffer, 0x18, 1) // 2 * 1 = 2 bytes
}

/**
 * The CFB's major version (2 bytes). This field can either equal 0x0003 or 0x0004.
 *
 * @param buffer The header's buffer
 */
export function majorVersionView(buffer: ArrayBuffer): Uint16Array {
  return new Uint16Array(buffer, 0x1A, 1) // 2 * 1 = 2 bytes
}

/**
 * Bytes order (2 bytes). This can either equal [0xFF, 0xFE] or [OxFE, 0xFF].
 *
 * @param buffer The header's buffer
 */
export function bytesOrderView(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer, 0x1C, 2) // 1 * 2 = 2 bytes
}

/**
 * The bit shift of the sector size (2 bytes). The final sector size should be `1 << shift`.
 *
 * @param buffer The header's buffer
 */
export function sectorShiftView(buffer: ArrayBuffer): Uint16Array {
  return new Uint16Array(buffer, 0x1E, 1) // 2 * 1 = 2 bytes
}

/**
 * The bit shift of the mini-sector size (2 bytes). The final mini-sector size should be `1 << shift`.
 *
 * @param buffer The header's buffer
 */
export function miniSectorShiftView(buffer: ArrayBuffer): Uint16Array {
  return new Uint16Array(buffer, 0x20, 1) // 2 * 1 = 2 bytes
}

/**
 * This is a reserved area (6 bytes). It should always contain zeros.
 *
 * @param buffer The header's buffer
 */
export function reservedView(buffer: ArrayBuffer): Uint16Array {
  return new Uint16Array(buffer, 0x22, 3) // 2 * 3 = 6 bytes
}

/**
 *
 */
export function directoryChainLengthView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x28, 1) // 4 * 1 = 4 bytes
}

/**
 *
 */
export function fatChainLengthView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x2C, 1) // 4 * 1 = 4 bytes
}

/**
 *
 */
export function directoryChainStartView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x30, 1) // 4 * 1 = 4 bytes
}

/**
 *
 */
export function transactionSignatureView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x34, 1) // 4 * 1 = 4 bytes
}

/**
 *
 * @param buffer
 */
export function miniSectorCutoffView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x38, 1) // 4 * 1 = 4 bytes
}

/**
 *
 */
export function miniFatStartView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x3C, 1) // 4 * 1 = 4 bytes
}

/**
 *
 * @param buffer
 */
export function miniFatChainLengthView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x40, 1) // 4 * 1 = 4 bytes
}

/**
 *
 * @param buffer
 */
export function difatChainStartView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x44, 1) // 4 * 1 = 4 bytes
}

export function difatChainLengthView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x48, 1) // 4 * 1 = 4 bytes
}

export function initialDifatChainView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x4C, 109) // 4 * 109 = 436 bytes
}

export function remainingSpaceView(buffer: ArrayBuffer): Uint32Array {
    return new Uint32Array(buffer, 512, 3584) // 512 === 1 << 0x9 and (1 << 0xc) - (1 << 0x9) === 3584
}

function resetHeader(buffer: ArrayBuffer): void {
    headerSignatureView(buffer).set([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])
    headerClsidView(buffer).fill(0)
    minorVersionView(buffer).fill(0x003E)
    bytesOrderView(buffer).fill(0xFFFE)
    miniSectorShiftView(buffer).fill(0x0006)
    reservedView(buffer).fill(0)
    directoryChainLengthView(buffer).fill(0)
    fatChainLengthView(buffer).fill(0)
    directoryChainStartView(buffer).fill(SectorType.ENDOFCHAIN)
    transactionSignatureView(buffer).fill(0)
    miniSectorCutoffView(buffer).fill(0x00001000)
    miniFatStartView(buffer).fill(SectorType.ENDOFCHAIN)
    miniFatChainLengthView(buffer).fill(0)
    difatChainStartView(buffer).fill(SectorType.ENDOFCHAIN)
    difatChainLengthView(buffer).fill(0)
    initialDifatChainView(buffer).fill(SectorType.FREESECT)
}

export function resetHeaderV3(buffer: ArrayBuffer): void {
    resetHeader(buffer)
    majorVersionView(buffer).fill(0x0003)
    sectorShiftView(buffer).fill(0x0009)
}

export function resetHeaderV4(buffer: ArrayBuffer): void {
    resetHeader(buffer)
    majorVersionView(buffer).fill(0x0004)
    sectorShiftView(buffer).fill(0x000c)
    remainingSpaceView(buffer).fill(0)
}
