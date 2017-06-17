import { createUintArrayDataView, createUintDataView, UintArrayDataView, UintDataView } from '../../helpers/uintDataViews'

function partialDifatArrayView(buffer: ArrayBuffer): UintArrayDataView {
  return createUintArrayDataView(buffer, 0, buffer.byteLength / 4 - 1, 32) // buffer.byteLength - 4 bytes
}

function nextDifatSectorIndexView(buffer: ArrayBuffer): UintDataView {
  return createUintDataView(buffer, buffer.byteLength - 4, 32) // 4 bytes
}

/**
 *
 */
export function getPartialDifatArray(buffer: ArrayBuffer): number[] {
  return partialDifatArrayView(buffer).getValue()
}

/**
 *
 * @param buffer
 */
export function getNextDifatSectorIndex(buffer: ArrayBuffer): number {
  return nextDifatSectorIndexView(buffer).getValue()
}
