/**
 * Asserts that a given value is not `null` or `undefined` and returns the given value.
 * Otherwise it will throw an exception.
 */
export function assetIsDefined<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) {
    throw new Error(`Expected a value. received${value}`)
  }

  return value
}
