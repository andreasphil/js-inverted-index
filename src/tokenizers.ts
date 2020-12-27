import { TokenizeFn } from "."

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
