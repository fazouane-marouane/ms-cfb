import { createUintArrayDataView, UintArrayDataView } from '../../helpers/uintDataViews'

function partialFatArrayView(buffer: ArrayBuffer): UintArrayDataView {
  return createUintArrayDataView(buffer, 0, buffer.byteLength / 4, 32)
}

/**
 *
 * @param buffer
 */
export function getPartialFatArray(buffer: ArrayBuffer): number[] {
  return partialFatArrayView(buffer).getValue()
}
