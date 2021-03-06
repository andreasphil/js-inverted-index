import {
  PropPath,
  IdentifyFn,
  NormalizeFn,
  SearchFn,
  TokenizeFn,
} from "./types"

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

/**
 * Identifies documents by the value of a property.
 *
 * @param prop Name of the ID prop
 * @returns Callback returning the value of the ID prop for a document
 */
export function idProp<T = any>(prop: keyof T): IdentifyFn<T> {
  return document => document[prop]
}

/**
 * Removes leading/trailing whitespace and converts the value to lowercase.
 */
export const lowercaseTrim: NormalizeFn = input => input?.trim().toLowerCase()

/**
 * Looks up all ID entries in the index for a search term. The search term is
 * split according to the provided matcher expression. If the term consists of
 * multiple words, only results containing all words are returned.
 *
 * @param index Search index to get the results from
 * @param term Search term to look up
 * @param options Indexing options
 * @returns A set containing the IDs associated with the search term
 */
export const matchAllTerms: SearchFn = (index, term, options) => {
  if (!term || Object.keys(index).length === 0) {
    return new Set()
  }

  const { tokenizer, normalizer } = options
  const termTokens = tokenizer(term).map(token => normalizer(token))
  const matches = termTokens.map(token => index[token])

  return intersect(...matches)
}

/**
 * Returns a new tokenizer that splits a value based on the specified regex.
 *
 * @param exp Regex used for splitting a value
 * @returns Callback splitting values based on the specified regex
 */
export function regexSplit(exp: RegExp): TokenizeFn {
  return input => (input ? input.match(exp) || [] : [])
}

/**
 * Returns a tokenizer that splits values on word boundaries.
 */
export const fullWordSplit = regexSplit(/\w+/g)
