/**
 *
 */
export enum ColorFlag {
  RED = 0x00,
  BLACK = 0x01
}

/**
 *
 */
export enum ObjectType {
  UNALLOCATED = 0x00,
  STORAGE = 0x01,
  STREAM = 0x02,
  ROOTSTORAGE = 0x05
}

/**
 *
 */
export enum SectorType {
  MAXREGSECT = 0xFFFFFFFA,
  DIFSECT = 0xFFFFFFFC,
  FATSECT = 0xFFFFFFFD,
  ENDOFCHAIN = 0xFFFFFFFE,
  FREESECT = 0xFFFFFFFF
}

/**
 *
 */
export enum StreamType {
  MAXREGSID = 0xFFFFFFFA,
  NOSTREAM = 0xFFFFFFFF
}
