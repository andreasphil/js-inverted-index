import { IdentifyFn } from "."

/**
 * Identifies documents by the value of a property.
 *
 * @param prop Name of the ID prop
 * @returns Callback returning the value of the ID prop for a document
 */
export function idProp<T = any>(prop: keyof T): IdentifyFn<T> {
  return document => document[prop]
}
