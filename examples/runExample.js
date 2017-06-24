/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
require('source-map-support').install()
const leftpad = require('leftpad')
const rightpad = require('rightpad')
const readFileSync = require('fs').readFileSync
const {
  readFromNodeBuffer,
} = require('../node-build')
const Benchmark = require('benchmark')

function processFile(filename) {
  const buffer = readFileSync(filename)
  const bench = new Benchmark(`CFB#${filename}`, () => {
    readFromNodeBuffer(buffer)
  }, {
    defer: false,
    onComplete: () => {
      console.log(`number of operations per second ${bench.hz}`)
      console.log(`mean execution time ${bench.stats.mean * 1000} ms`)
      console.log(`margin of error ${bench.stats.moe * 1000} ms`)
    },
  })
  bench.run({
    async: false,
  })
  const cfb = readFromNodeBuffer(buffer)
  function ignoreSpecialValues(value) {
    return value <= 0xFFFFFFFA ? value.toString() : '-'
  }

  console.log('Directory entries')
  console.log(['index', rightpad('name', 32, ' '), 'sector', 'size',
    rightpad('leftId', 8, ' '), rightpad('rightId', 8, ' '), rightpad('childId', 8, ' '),
  ].join('\t'))
  cfb.directoryEntries.forEach((entry, index) => {
    console.log([index,
      rightpad(entry.getName(), 32),
      ignoreSpecialValues(entry.getStartingSectorLocation()),
      entry.getStreamSize(),
      leftpad(ignoreSpecialValues(entry.getLeftId()), 8, ' '),
      leftpad(ignoreSpecialValues(entry.getRightId()), 8, ' '),
      leftpad(ignoreSpecialValues(entry.getChildId()), 8, ' '),
    ].join('\t'))
  })

  console.log('directories', cfb.root)
}

for (let index = 2; index < process.argv.length; index++) { // eslint-disable-line no-plusplus
  const filename = process.argv[index]
  console.log('file', filename)
  processFile(filename)
  console.log('--------\n\n')
}
