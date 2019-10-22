import {
  createUintArrayDataView,
  UintArrayDataView,
} from '../../helpers/uintDataViews';

function partialFatArrayView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0, buffer.byteLength / 4, 32);
}

/**
 *
 * @param buffer
 */
export function getPartialFatArray(buffer: DataView): number[] {
  return partialFatArrayView(buffer).get();
}
