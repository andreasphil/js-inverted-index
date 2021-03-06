import { PropPath, IdentifyFn, NormalizeFn, SearchFn, TokenizeFn } from "./types";
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
export declare function unwrap<T = any>(obj: Record<string, any>, prop: PropPath): T | undefined;
/**
 * Returns the intersection of multiple sets.
 *
 * @param sets Sets to get common elements from
 * @returns Set containing the elements shared among the source sets
 */
export declare function intersect<T = any>(...sets: Set<T>[]): Set<T>;
/**
 * Identifies documents by the value of a property.
 *
 * @param prop Name of the ID prop
 * @returns Callback returning the value of the ID prop for a document
 */
export declare function idProp<T = any>(prop: keyof T): IdentifyFn<T>;
/**
 * Removes leading/trailing whitespace and converts the value to lowercase.
 */
export declare const lowercaseTrim: NormalizeFn;
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
export declare const matchAllTerms: SearchFn;
/**
 * Returns a new tokenizer that splits a value based on the specified regex.
 *
 * @param exp Regex used for splitting a value
 * @returns Callback splitting values based on the specified regex
 */
export declare function regexSplit(exp: RegExp): TokenizeFn;
/**
 * Returns a tokenizer that splits values on word boundaries.
 */
export declare const fullWordSplit: TokenizeFn;
