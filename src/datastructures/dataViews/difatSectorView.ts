import { createUintArrayDataView, createUintDataView, UintArrayDataView, UintDataView } from '../../helpers/uintDataViews'

function partialDifatArrayView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0, buffer.byteLength / 4 - 1, 32) // buffer.byteLength - 4 bytes
}

function nextDifatSectorIndexView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, buffer.byteLength - 4, 32) // 4 bytes
}

/**
 *
 */
export function getPartialDifatArray(buffer: DataView): number[] {
  return partialDifatArrayView(buffer).get()
}

/**
 *
 * @param buffer
 */
export function getNextDifatSectorIndex(buffer: DataView): number {
  return nextDifatSectorIndexView(buffer).get()
}
