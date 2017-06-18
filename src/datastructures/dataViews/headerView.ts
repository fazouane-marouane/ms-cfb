import { createUintArrayDataView, createUintDataView, UintArrayDataView, UintDataView } from '../../helpers/uintDataViews'
import { SectorType } from '../enums'

/**
 * Header Signature (8 bytes). This array should always equal:
 * `[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]`
 *
 * @param buffer The header's buffer
 */
export function headerSignatureView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0x00, 8, 8) // 1 * 8 = 8 bytes
}

/**
 * Header CLSID (16 bytes). This should always contain zeros.
 *
 * @param buffer The header's buffer
 */
export function headerClsidView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0x08, 4, 32) // 4 * 4 = 16 bytes
}

/**
 * The CFB's minor version (2 bytes). This field should always be 0x003E (62).
 *
 * @param buffer The header's buffer
 */
export function minorVersionView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x18, 16) // 2 * 1 = 2 bytes
}

/**
 * The CFB's major version (2 bytes). This field can either equal 0x0003 or 0x0004.
 *
 * @param buffer The header's buffer
 */
export function majorVersionView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x1A, 16) // 2 * 1 = 2 bytes
}

/**
 * Bytes order (2 bytes). This can either equal [0xFF, 0xFE] or [OxFE, 0xFF].
 *
 * @param buffer The header's buffer
 */
export function bytesOrderView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x1C, 16) // 1 * 2 = 2 bytes
}

/**
 * The bit shift of the sector size (2 bytes). The final sector size should be `1 << shift`.
 *
 * @param buffer The header's buffer
 */
export function sectorShiftView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x1E, 16) // 2 * 1 = 2 bytes
}

/**
 * The bit shift of the mini-sector size (2 bytes). The final mini-sector size should be `1 << shift`.
 *
 * @param buffer The header's buffer
 */
export function miniSectorShiftView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x20, 16) // 2 * 1 = 2 bytes
}

/**
 * This is a reserved area (6 bytes). It should always contain zeros.
 *
 * @param buffer The header's buffer
 */
export function reservedView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0x22, 3, 16) // 2 * 3 = 6 bytes
}

/**
 *
 */
export function directoryChainLengthView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x28, 32) // 4 * 1 = 4 bytes
}

/**
 *
 */
export function fatChainLengthView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x2C, 32) // 4 * 1 = 4 bytes
}

/**
 *
 */
export function directoryChainStartView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x30, 32) // 4 * 1 = 4 bytes
}

/**
 *
 */
export function transactionSignatureView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x34, 32) // 4 * 1 = 4 bytes
}

/**
 *
 * @param buffer
 */
export function miniSectorCutoffView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x38, 32) // 4 * 1 = 4 bytes
}

/**
 *
 */
export function miniFatStartView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x3C, 32) // 4 * 1 = 4 bytes
}

/**
 *
 * @param buffer
 */
export function miniFatChainLengthView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x40, 32) // 4 * 1 = 4 bytes
}

/**
 *
 * @param buffer
 */
export function difatChainStartView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x44, 32) // 4 * 1 = 4 bytes
}

export function difatChainLengthView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x48, 32) // 4 * 1 = 4 bytes
}

export function initialDifatChainView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0x4C, 109, 32) // 4 * 109 = 436 bytes
}

export function remainingSpaceView(buffer: DataView): UintArrayDataView {
    return createUintArrayDataView(buffer, 512, 3584, 32) // 512 === 1 << 0x9 and (1 << 0xc) - (1 << 0x9) === 3584
}

function resetHeader(buffer: DataView): void {
    headerSignatureView(buffer).set([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])
    headerClsidView(buffer).fill(0)
    minorVersionView(buffer).set(0x003E)
    bytesOrderView(buffer).set(0xFFFE)
    miniSectorShiftView(buffer).set(0x0006)
    reservedView(buffer).fill(0)
    directoryChainLengthView(buffer).set(0)
    fatChainLengthView(buffer).set(0)
    directoryChainStartView(buffer).set(SectorType.ENDOFCHAIN)
    transactionSignatureView(buffer).set(0)
    miniSectorCutoffView(buffer).set(0x00001000)
    miniFatStartView(buffer).set(SectorType.ENDOFCHAIN)
    miniFatChainLengthView(buffer).set(0)
    difatChainStartView(buffer).set(SectorType.ENDOFCHAIN)
    difatChainLengthView(buffer).set(0)
    initialDifatChainView(buffer).fill(SectorType.FREESECT)
}

/**
 *
 * @param buffer
 */
export function resetHeaderV3(buffer: DataView): void {
    resetHeader(buffer)
    majorVersionView(buffer).set(0x0003)
    sectorShiftView(buffer).set(0x0009)
}

/**
 *
 * @param buffer
 */
export function resetHeaderV4(buffer: DataView): void {
    resetHeader(buffer)
    majorVersionView(buffer).set(0x0004)
    sectorShiftView(buffer).set(0x000c)
    remainingSpaceView(buffer).fill(0)
}
