/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
require("source-map-support").install();
const leftpad = require("leftpad");
const rightpad = require("rightpad");
const readFileSync = require("fs").readFileSync;
const { readFromNodeBuffer } = require("../dist/ms-cfb");
const Benchmark = require("benchmark");

const kMsiNumBits = 6;
const kMsiNumChars = 1 << kMsiNumBits;
const kMsiCharMask = kMsiNumChars - 1;
const kMsiStartUnicodeChar = 0x3800;
const kMsiUnicodeRange = kMsiNumChars * (kMsiNumChars + 1);
const g_MsiChars =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz._";

  // http://robmensching.com/blog/posts/2003/11/25/inside-the-msi-file-format/
  // http://robmensching.com/blog/posts/2004/2/10/inside-the-msi-file-format-again/
  // https://stackoverflow.com/questions/9709452/what-does-windows-installer-itself-actually-do-and-why-do-i-never-see-an-msi-mad/9709530#
function MsiBase64Decode(c) {
  const c0 = c % 64;
  const c1 = (c - c0) / 64;
  const result = '';
  if (c1 === 64) {
    return 
    result += g_MsiChars[c0];
    if (c1 == kMsiNumChars) break;
    result += g_MsiChars[c1];
  } else return "!";
}


function CompoundMsiNameToFileName(name) {
  let resultName = "";
  for (let i = 0; i < name.length; i++) {
    let c = name.codePointAt(i);
    if (c < kMsiStartUnicodeChar || c > kMsiStartUnicodeChar + kMsiUnicodeRange)
      return name;
    c -= kMsiStartUnicodeChar;

    const c0 = c & kMsiCharMask;
    const c1 = c >> kMsiNumBits;

    if (c1 <= kMsiNumChars) {
      resultName += g_MsiChars[c0];
      if (c1 == kMsiNumChars) break;
      resultName += g_MsiChars[c1];
    } else resultName += "!";
  }
  return resultName;
}

function processFile(filename) {
  const buffer = readFileSync(filename);
  const cfb = readFromNodeBuffer(buffer);
  function ignoreSpecialValues(value) {
    return value <= 0xfffffffa ? value.toString() : "-";
  }

  console.log("Directory entries");
  console.log(
    [
      "index",
      rightpad("name", 32, " "),
      "sector",
      "size",
      rightpad("leftId", 8, " "),
      rightpad("rightId", 8, " "),
      rightpad("childId", 8, " ")
    ].join("\t")
  );
  cfb.directoryEntries.forEach((entry, index) => {
    console.log(
      [
        index,
        rightpad(CompoundMsiNameToFileName(entry.getName()), 32, " "),
        ignoreSpecialValues(entry.getStartingSectorLocation()),
        entry.getStreamSize(),
        leftpad(ignoreSpecialValues(entry.getLeftId()), 8, " "),
        leftpad(ignoreSpecialValues(entry.getRightId()), 8, " "),
        leftpad(ignoreSpecialValues(entry.getChildId()), 8, " ")
      ].join("\t")
    );
  });

  //console.log("directories", cfb.root);
}

for (let index = 2; index < process.argv.length; index++) {
  // eslint-disable-line no-plusplus
  const filename = process.argv[index];
  console.log("file", filename);
  processFile(filename);
  console.log("--------\n\n");
}
