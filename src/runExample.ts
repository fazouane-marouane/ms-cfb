import { readFileSync } from 'fs'
import { readFileFromBuffer } from './readers/readFile'

let buffer = readFileSync(process.argv[2])
let cfb = readFileFromBuffer(buffer)
let header = cfb.header
let sectors = cfb.sectors
console.log('signature', header.headerSignature)
console.log('version', header.version)
console.log('bytesOrder', header.bytesOrder)
console.log('start of minifat', header.startOfMiniFat)
console.log('start of difat', header.startOfDifat)
console.log('sector size', header.sectorSize)
console.log('number of fat sectors', header.numberOfFatSectors)
console.log('fatSectors', cfb.fatSectorIndices)
console.log('number of sectors', sectors.length)
