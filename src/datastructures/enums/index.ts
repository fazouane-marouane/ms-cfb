/**
 *
 */
// tslint:disable-next-line:variable-name
export const ColorFlag = {
  RED: 0x00,
  BLACK: 0x01,
};

/**
 *
 */
// tslint:disable-next-line:variable-name
export const ObjectType = {
  UNALLOCATED: 0x00,
  STORAGE: 0x01,
  STREAM: 0x02,
  ROOTSTORAGE: 0x05,
};

/**
 *
 */
// tslint:disable-next-line:variable-name
export const SectorType = {
  MAXREGSECT: 0xfffffffa,
  DIFSECT: 0xfffffffc,
  FATSECT: 0xfffffffd,
  ENDOFCHAIN: 0xfffffffe,
  FREESECT: 0xffffffff,
};

/**
 *
 */
// tslint:disable-next-line:variable-name
export const StreamType = {
  MAXREGSID: 0xfffffffa,
  NOSTREAM: 0xffffffff,
};
