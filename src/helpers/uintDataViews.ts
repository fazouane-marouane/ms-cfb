import { range, sliceView } from '.'

export type UintSize = 8 | 16 | 32 | 64

/**
 * Generic getter/setter for unsigned integer values on a `DataView` object
 */
export class UintDataView {
  constructor(private dataview: DataView, private size: UintSize, private byteOffset: number) {
    if (size !== 8 && size !== 16 && size !== 32 && size !== 64) {
      throw new Error('Not a valid byteSize for an integer')
    }
  }

  // tslint:disable-next-line:no-reserved-keywords
  public get(littleEndianness: boolean = true): number {
    const { dataview, byteOffset } = this
    switch (this.size) {
      case 8:
        return dataview.getUint8(byteOffset)
      case 16:
        return dataview.getUint16(byteOffset, littleEndianness)
      case 32:
        return dataview.getUint32(byteOffset, littleEndianness)
      default: // 64
        const [v1, v2] = [dataview.getUint32(byteOffset, littleEndianness),
        dataview.getUint32(byteOffset + 4, littleEndianness)]

        // least-significant-4-bytes + most-significant-4-bytes * Math.pow(2, 32)
        // when using little endian: most-significant-4-bytes === v2
        // when using big endian: most-significant-4-bytes === v1
        return (littleEndianness ? v2 : v1) * 0x100000000 + (littleEndianness ? v1 : v2)
    }
  }

  // tslint:disable-next-line:no-reserved-keywords
  public set(value: number, littleEndianness: boolean = true): void {
    const { dataview, byteOffset } = this
    switch (this.size) {
      case 8:
        dataview.setUint8(byteOffset, value)
        break
      case 16:
        dataview.setUint16(byteOffset, value, littleEndianness)
        break
      case 32:
        dataview.setUint32(byteOffset, value, littleEndianness)
        break
      default: // 64
        // tslint:disable-next-line:no-bitwise
        const v1 = value >>> 0 // least-significant-4-bytes
        const v2 = (value - v1) / 0x100000000 // most-significant-4-bytes
        dataview.setUint32(byteOffset + (littleEndianness ? 0 : 4), v1, littleEndianness)
        dataview.setUint32(byteOffset + (littleEndianness ? 4 : 0), v2, littleEndianness)
        break
    }
  }
}

/**
 * Generic getter/setter for an array of unsigned integer values on a `DataView` object
 */
export class UintArrayDataView {
  constructor(dataview: DataView, size: UintSize) {
    const byteSize = size / 8
    this.dataviews = range(0, dataview.byteLength / byteSize)
      // tslint:disable-next-line:no-non-null-assertion
      .map((index: number) => new UintDataView(dataview, size, index * byteSize))
  }

  // tslint:disable-next-line:no-reserved-keywords
  public get(littleEndianness: boolean = true): number[] {
    return this.dataviews.map((dataview: UintDataView) => dataview.get(littleEndianness))
  }

  // tslint:disable-next-line:no-reserved-keywords
  public set(values: number[], littleEndianness: boolean = true): void {
    this.dataviews.forEach((dataview: UintDataView, index: number) => {
      dataview.set(values[index], littleEndianness)
    })
  }

  public fill(value: number, littleEndianness: boolean = true): void {
    this.dataviews.forEach((dataview: UintDataView) => {
      dataview.set(value, littleEndianness)
    })
  }

  private dataviews: UintDataView[]
}

export function createUintDataView(view: DataView, byteOffset: number, size: UintSize): UintDataView {
  return new UintDataView(sliceView(view, byteOffset, size / 8), size, 0)
}

export function createUintArrayDataView(view: DataView, byteOffset: number, length: number, size: UintSize): UintArrayDataView {
  return new UintArrayDataView(sliceView(view, byteOffset, length * size / 8), size)
}
