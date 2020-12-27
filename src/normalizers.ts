import { NormalizeFn } from "."

/**
 * Removes leading/trailing whitespace and converts the value to lowercase.
 */
export const lowercaseTrim: NormalizeFn = input => input?.trim().toLowerCase()
