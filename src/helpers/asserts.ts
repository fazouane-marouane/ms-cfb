/**
 * Assert that a given value is not `null` or `undefined` and returns the given value.
 * Otherwise it will throw an exception.
 */
export function assertIsDefined<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) {
    throw new Error(`assert ${value} is defined`)
  }

  return value
}
