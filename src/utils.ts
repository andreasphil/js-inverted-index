/**
 * Specifies a nested property inside an object.
 */
export type PropPath = string | any[]

/**
 * Recursively reads the value of a property from nested object structures. For
 * example:
 *
 * getNestedProp({ a: { b: 'value' }}, 'a.b') // => 'value'
 * getNestedProp({ a: { b: 'value' }}, ['a', 'b']) // => 'value'
 *
 * @param obj Object to get the value from
 * @param prop Path to the property inside the object. Can be an array or a
 *             string with property names separated by '.')
 * @returns The property value. Can be undefined if the specified property
 *          doesn't exist
 */
export function unwrap<T = any>(
  obj: Record<string, any>,
  prop: PropPath
): T | undefined {
  if (!obj) {
    return undefined
  }

  const path = Array.isArray(prop) ? prop : prop.split(".")
  const [head, ...tail] = path

  if (tail.length) {
    return unwrap(obj[head], tail)
  } else {
    return obj[head]
  }
}

/**
 * Returns the intersection of multiple sets.
 *
 * @param sets Sets to get common elements from
 * @returns Set containing the elements shared among the source sets
 */
export function intersect<T = any>(...sets: Set<T>[]): Set<T> {
  if (!sets.length || sets.some(set => !set)) {
    return new Set()
  } else if (sets.length === 1) {
    return sets[0]
  }

  const setsCopy = [...sets]

  const a = setsCopy.shift()
  const b = setsCopy.shift()
  const intersection = new Set<T>()

  a!.forEach(itemFromA => {
    if (b!.has(itemFromA)) {
      intersection.add(itemFromA)
    }
  })

  setsCopy.unshift(intersection)

  return intersect(...setsCopy)
}
