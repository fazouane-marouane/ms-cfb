import { createUintArrayDataView, createUintDataView, UintArrayDataView, UintDataView } from '../../helpers/uintDataViews'

/**
 *
 */
export function directoryEntryNameView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0x00, 32, 16) // 2 * 32 = 64 bytes
}

export function directoryEntryNameLengthView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x40, 16) // 2 * 1 = 2 bytes
}

export function objectTypeView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x42, 8) // 1 * 1 = 1 byte
}

export function flagColorView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x43, 8) // 1 * 1 = 1 byte
}

export function leftSiblingIdView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x44, 32) // 4 * 1 = 4 bytes
}

export function rightSiblingIdView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x48, 32) // 4 * 1 = 4 bytes
}

export function childIdView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x4C, 32) // 4 * 1 = 4 bytes
}

export function clsidView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0x50, 4, 32) // 4 * 4 = 16 bytes
}

export function stateBitsView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x60, 32) // 4 * 1 = 4 bytes
}

export function creationTimeView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0x64, 8, 8) // 1 * 8 = 8 bytes
}

export function modificationTimeView(buffer: DataView): UintArrayDataView {
  return createUintArrayDataView(buffer, 0x6C, 8, 8) // 1 * 8 = 8 bytes
}

export function startingSectorLocationView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x74, 32) // 4 * 1 = 4 bytes
}

export function streamSizeView(buffer: DataView): UintDataView {
  return createUintDataView(buffer, 0x78, 64) // 4 * 2 = 8 bytes
}
