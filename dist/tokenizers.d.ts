import { TokenizeFn } from ".";
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
