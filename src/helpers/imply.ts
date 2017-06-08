function isBoolean(predicate: boolean | (() => boolean)): predicate is boolean {
  return typeof predicate === 'boolean'
}

export function imply(fst: boolean | (() => boolean), snd: boolean | (() => boolean)): boolean {
  if (isBoolean(fst)) {
    if (isBoolean(snd)) {
      return fst <= snd
    }
    return fst <= snd()
  }
  return imply(fst(), snd)
}
