/**
 * Determines whether two sequences are equal
 * @param fst first sequence
 * @param snd second sequence
 */
export function arraysAreEqual<T>(fst: T[] | null, snd: T[] | null) : boolean {
  if (fst === snd) {
    return true
  }
  if (!fst || !snd || fst.length !== snd.length) {
    return false
  }

  return fst.every((value: T, index: number) => value === snd[index])
}
