import { readFileSync } from 'fs'
import { readFileFromBuffer } from './readers/readFile'
import { SectorType } from './datastructures/enums'

let buffer = readFileSync(process.argv[2])
let cfb = readFileFromBuffer(buffer)
let header = cfb.header
let sectors = cfb.sectors
console.log('signature', header.headerSignature)
console.log('version', header.version)
console.log('bytesOrder', header.bytesOrder)
console.log('start of directoryChain', header.startOfDirectoryChain)
console.log('start of minifat', header.startOfMiniFat)
console.log('start of difat', header.startOfDifat)
console.log('sector size', header.sectorSize)
console.log('number of fat sectors', header.numberOfFatSectors)
console.log('number of sectors', sectors.length)
console.log('number of chains', cfb.fatChain.chains.size)
cfb.fatChain.chains.forEach((chain, startIndex) => {
  console.log(`startIndex ${startIndex}, byteLength ${chain.buffer.byteLength}`)
})

function leftpad (str: string, len: number) {
  str = String(str);
  let i = -1;
  let ch = ' ';
  len = len - str.length;
  while (++i < len) {
    str = ch + str;
  }
  return str;
}
function rightpad (str: string, len: number) {
  str = String(str);
  let i = -1;
  let ch = ' ';
  len = len - str.length
  while (++i < len) {
    str = str + ch;
  }
  return str;
}

function ignoreSpecialValues(value: number): string {
  return value <= SectorType.MAXREGSECT? value.toString(): '-'
}

console.log('Directory entries')
console.log(['index', rightpad('name', 32), 'sector', 'size',
  rightpad('leftId', 8), rightpad('rightId', 8), rightpad('childId', 8)].join('\t'))
cfb.directoryEntries.entries.forEach((entry, index) => {
  console.log([index,
    rightpad(entry.name, 32),
    ignoreSpecialValues(entry.startingSectorLocation),
    entry.streamSize,
    leftpad(ignoreSpecialValues(entry.leftSiblingId), 8),
    leftpad(ignoreSpecialValues(entry.rightSiblingId), 8),
    leftpad(ignoreSpecialValues(entry.childId), 8)].join('\t'))
})

console.log('directories', cfb.root)
