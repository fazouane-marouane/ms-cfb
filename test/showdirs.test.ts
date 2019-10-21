import { readFromNodeBuffer } from '../src';
import { readFileSync } from 'fs';
import Benchmark from 'benchmark';

const kMsiNumBits = 6;
const kMsiNumChars = 1 << kMsiNumBits;
const kMsiCharMask = kMsiNumChars - 1;
const kMsiStartUnicodeChar = 0x3800;
const kMsiUnicodeRange = kMsiNumChars * (kMsiNumChars + 1);
const g_MsiChars =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz._';

// http://robmensching.com/blog/posts/2003/11/25/inside-the-msi-file-format/
// http://robmensching.com/blog/posts/2004/2/10/inside-the-msi-file-format-again/
// https://stackoverflow.com/questions/9709452/what-does-windows-installer-itself-actually-do-and-why-do-i-never-see-an-msi-mad/9709530#
function MsiBase64Decode(c: number) {
  const c0 = c % 64;
  const c1 = (c - c0) / 64;
  const result = '';
  if (c1 === 64) {
    return;
    // result += g_MsiChars[c0];
    // if (c1 == kMsiNumChars) break;
    // result += g_MsiChars[c1];
  } else return '!';
}

function CompoundMsiNameToFileName(name: string) {
  let resultName = '';
  for (let i = 0; i < name.length; i++) {
    let c = name.codePointAt(i)!;
    if (c < kMsiStartUnicodeChar || c > kMsiStartUnicodeChar + kMsiUnicodeRange)
      return name;
    c -= kMsiStartUnicodeChar;

    const c0 = c & kMsiCharMask;
    const c1 = c >> kMsiNumBits;

    if (c1 <= kMsiNumChars) {
      resultName += g_MsiChars[c0];
      if (c1 == kMsiNumChars) break;
      resultName += g_MsiChars[c1];
    } else resultName += '!';
  }
  return resultName;
}

function processFile(filename: string) {
  const buffer = readFileSync(filename);
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

describe('showdirs', () => {
  it.each([['dummy.doc'], ['message.msg'], ['examples/template.oft']])(
    'works',
    filename => {
      processFile(filename);
    }
  );
});
