export function sliceView(
  view: DataView,
  byteOffset: number,
  length?: number
): DataView {
  return new DataView(view.buffer, view.byteOffset + byteOffset, length);
}

export function createStream(
  views: DataView[],
  byteLength: number
): ArrayBuffer {
  const tmp = new Uint8Array(byteLength);
  let accumulatedByteLength = 0;
  // tslint:disable-next-line:no-increment-decrement
  for (
    let index = 0;
    index < views.length && accumulatedByteLength < byteLength;
    index++
  ) {
    const view = views[index];
    const toRead = Math.min(
      byteLength - accumulatedByteLength,
      view.byteLength
    );
    tmp.set(
      new Uint8Array(view.buffer, view.byteOffset, toRead),
      accumulatedByteLength
    );
    accumulatedByteLength += toRead;
  }

  return tmp.buffer;
}

export function sliceInnerBuffer(
  view: DataView,
  byteOffset: number,
  length?: number
): ArrayBuffer {
  return view.buffer.slice(view.byteOffset + byteOffset, length);
}

/**
 * Split a `buffer` into an array of chunks of same length of `chunkSize`.
 * If `buffer` can't be split evenly, the final chunk will be the remaining elements.
 *
 * @param {ArrayBuffer} buffer The buffer to process
 * @param {number} chunkSize The length of each chunk
 */
export function chunkBuffer(view: DataView, chunkSize: number): DataView[] {
  const numberOfFixedSizeChunks = Math.floor(view.byteLength / chunkSize);
  const remainingBytes = view.byteLength % chunkSize;
  const result = Array<DataView>(numberOfFixedSizeChunks);
  // tslint:disable-next-line:no-increment-decrement
  for (let index = 0; index < numberOfFixedSizeChunks; index++) {
    result[index] = sliceView(view, chunkSize * index, chunkSize);
  }
  if (remainingBytes > 0) {
    result.push(
      sliceView(view, chunkSize * numberOfFixedSizeChunks, remainingBytes)
    );
  }

  return result;
}

/**
 *
 * @param view
 * @param chunkSize
 * @param action
 */
export function chunkBufferForEach(
  view: DataView,
  chunkSize: number,
  action: (chunk: DataView, chunkId: number) => void
): void {
  const numberOfFixedSizeChunks = Math.floor(view.byteLength / chunkSize);
  const remainingBytes = view.byteLength % chunkSize;
  let index = 0;
  // tslint:disable-next-line:no-increment-decrement
  for (; index < numberOfFixedSizeChunks; index++) {
    action(sliceView(view, chunkSize * index, chunkSize), index);
  }
  if (remainingBytes > 0) {
    action(
      sliceView(view, chunkSize * numberOfFixedSizeChunks, remainingBytes),
      index
    );
  }
}

/**
 * Join an array of `buffers`
 *
 * @param buffers buffers to be joined
 */
export function joinViews(views: DataView[]): DataView {
  const totalBytes = views
    .map((view: DataView): number => view.byteLength)
    .reduce((acc: number, val: number): number => acc + val);
  const tmp = new Uint8Array(totalBytes);
  views.reduce((accumulatedByteLength: number, view: DataView): number => {
    tmp.set(
      new Uint8Array(view.buffer, view.byteOffset, view.byteLength),
      accumulatedByteLength
    );

    return accumulatedByteLength + view.byteLength;
  }, 0);

  return new DataView(tmp.buffer);
}
