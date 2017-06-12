/**
 * Tells whether the parameter passed is indeed a boolean.
 */
function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Tells whether the statement "fst implies snd" is true or not.
 * @param fst The left hand side predicate
 * @param snd The right hand side predicate
 */
export function imply(fst: boolean | (() => boolean), snd: boolean | (() => boolean)): boolean {
  if (isBoolean(fst)) {
    if (isBoolean(snd)) {
      return fst <= snd
    }
    return fst <= snd()
  }
  return imply(fst(), snd)
}
