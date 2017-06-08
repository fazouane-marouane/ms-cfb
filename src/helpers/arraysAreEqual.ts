export function arraysAreEqual<T>(fst: T[], snd: T[]) {
  if (fst === snd) return true
  if (!fst || !snd) return false
  if (fst.length !== snd.length) return false
  for (var i = 0; i < fst.length; ++i) {
    if (fst[i] !== snd[i]) return false
  }
  return true
}
