let readFileSync = require('fs').readFileSync
let readFromNodeBuffer = require('../node-build').readFromNodeBuffer

for (let index = 2; index < process.argv.length; index++) {
  let filename = process.argv[index]
  console.log('file', filename)
  processFile(filename)
  console.log('--------\n\n')
}

function processFile(filename) {
  let buffer = readFileSync(filename)
  let cfb = readFromNodeBuffer(buffer)
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
  cfb.fatChain.chains.forEach((buffer, startIndex) => {
    console.log(`startIndex ${startIndex}, byteLength ${buffer.byteLength}`)
  })

  function leftpad(str, len) {
    str = String(str);
    let i = -1;
    let ch = ' ';
    len = len - str.length;
    while (++i < len) {
      str = ch + str;
    }
    return str;
  }

  function rightpad(str, len) {
    str = String(str);
    let i = -1;
    let ch = ' ';
    len = len - str.length
    while (++i < len) {
      str = str + ch;
    }
    return str;
  }

  function ignoreSpecialValues(value) {
    return value <= 0xFFFFFFFA ? value.toString() : '-'
  }

  console.log('Directory entries')
  console.log(['index', rightpad('name', 32), 'sector', 'size',
    rightpad('leftId', 8), rightpad('rightId', 8), rightpad('childId', 8)
  ].join('\t'))
  cfb.directoryEntries.forEach((entry, index) => {
    console.log([index,
      rightpad(entry.name, 32),
      ignoreSpecialValues(entry.startingSectorLocation),
      entry.streamSize,
      leftpad(ignoreSpecialValues(entry.leftSiblingId), 8),
      leftpad(ignoreSpecialValues(entry.rightSiblingId), 8),
      leftpad(ignoreSpecialValues(entry.childId), 8)
    ].join('\t'))
  })

  console.log('directories', cfb.root)
}
