/**
 * @jest-environment node
 */
import { readFromNodeBuffer } from '../src';
import { readFileSync } from 'fs';
import Benchmark from 'benchmark';
import { resolve } from 'path';

function processFile(filename: string) {
  const buffer = readFileSync(filename);
  const bench = new Benchmark(
    `CFB#${filename}`,
    () => {
      readFromNodeBuffer(buffer);
    },
    {
      defer: false,
      onComplete: () => {
        console.log(`number of operations per second ${bench.hz}`);
        console.log(`mean execution time ${bench.stats.mean * 1000} ms`);
        console.log(`margin of error ${bench.stats.moe * 1000} ms`);
      },
    }
  );
  bench.run({
    async: false,
  });
  const cfb = readFromNodeBuffer(buffer);
  function ignoreSpecialValues(value: number) {
    return value <= 0xfffffffa ? value.toString() : '-';
  }

  console.log('Directory entries');
  console.log(
    [
      'index',
      'name'.padEnd(32, ' '),
      'sector',
      'size',
      'leftId'.padEnd(8, ' '),
      'rightId'.padEnd(8, ' '),
      'childId'.padEnd(8, ' '),
    ].join('\t')
  );
  cfb.directoryEntries.forEach((entry, index) => {
    console.log(
      [
        index,
        entry.getName().padEnd(32, ' '),
        ignoreSpecialValues(entry.getStartingSectorLocation()),
        entry.getStreamSize(),
        ignoreSpecialValues(entry.getLeftId()).padStart(8, ' '),
        ignoreSpecialValues(entry.getRightId()).padStart(8, ' '),
        ignoreSpecialValues(entry.getChildId()).padStart(8, ' '),
      ].join('\t')
    );
  });

  console.log('directories', cfb.root);
}

describe('benchmark', () => {
  it.each([['dummy.doc'], ['message.msg'], ['template.oft']])(
    'works',
    filename => {
      processFile(resolve(__dirname, `./sample-files/${filename}`));
    }
  );
});
