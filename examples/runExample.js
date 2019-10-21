/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
require('source-map-support').install();
const leftpad = require('leftpad');
const rightpad = require('rightpad');
const readFileSync = require('fs').readFileSync;
const { readFromNodeBuffer } = require('../dist/ms-cfb');

for (let index = 2; index < process.argv.length; index++) {
  // eslint-disable-line no-plusplus
  const filename = process.argv[index];
  console.log('file', filename);
  processFile(filename);
  console.log('--------\n\n');
}
