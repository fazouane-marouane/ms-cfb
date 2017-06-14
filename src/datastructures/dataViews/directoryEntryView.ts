/**
 *
 */
export function directoryEntryNameView(buffer: ArrayBuffer): Uint16Array {
  return new Uint16Array(buffer, 0x00, 32) // 2 * 32 = 64 bytes
}

export function directoryEntryNameLengthView(buffer: ArrayBuffer): Uint16Array {
  return new Uint16Array(buffer, 0x40, 1) // 2 * 1 = 2 bytes
}

export function objectTypeView(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer, 0x42, 1) // 1 * 1 = 1 byte
}

export function flagColorView(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer, 0x43, 1) // 1 * 1 = 1 byte
}

export function leftSiblingIdView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x44, 1) // 4 * 1 = 4 bytes
}

export function rightSiblingIdView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x48, 1) // 4 * 1 = 4 bytes
}

export function childIdView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x4C, 1) // 4 * 1 = 4 bytes
}

export function clsidView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x50, 4) // 4 * 4 = 16 bytes
}

export function stateBitsView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x60, 1) // 4 * 1 = 4 bytes
}

export function creationTimeView(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer, 0x64, 8) // 1 * 8 = 8 bytes
}

export function modificationTimeView(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer, 0x6C, 8) // 1 * 8 = 8 bytes
}

export function startingSectorLocationView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x74, 1) // 4 * 1 = 4 bytes
}

export function streamSizeView(buffer: ArrayBuffer): Uint32Array {
  return new Uint32Array(buffer, 0x78, 2) // 4 * 2 = 8 bytes
}
