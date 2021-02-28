/**
 * Specifies a nested property inside an object.
 */
export declare type PropPath = string | any[];
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
