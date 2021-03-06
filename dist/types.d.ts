/**
 * Specifies a nested property inside an object.
 */
export declare type PropPath = string | any[];
/**
 * Mapping of search terms to a set of the IDs of objects matching the search
 * term.
 */
export declare type SearchIndex<T = any> = Record<string, Set<T>>;
/**
 * Takes a document and returns a value that can be used for uniqeuly
 * identifying the document.
 *
 * @param document Original document
 * @returns Identifier of the document
 */
export declare type IdentifyFn<T = any, U = any> = (document: T) => U;
/**
 * Takes a string and splits it into individual tokens. These tokens will be
 * used for building the search index.
 *
 * @param input Source string
 * @returns Tokens found in the source string
 */
export declare type TokenizeFn = (input: string) => string[];
/**
 * Takes a string and returns it in a normalized format, e.g. converts it to
 * lowercase and trim leading/trailing whitespace.
 *
 * @param input Source string
 * @returns Normalized string
 */
export declare type NormalizeFn = (input: string) => string;
/**
 * Takes and index and returns all search results for the specified term. Calls
 * to the function will also use the original indexing options. These can be
 * used for normalizing and tokenizing the search term in the same way the
 * documents in the index are in order to make matches more likely.
 *
 * @param index Index to search in
 * @param term Term to search for
 * @param options Options used for generating the index
 * @returns Set of IDs of documents matching the term
 */
export declare type SearchFn<T = any> = (index: SearchIndex, term: string, options: IndexingOptions) => Set<T>;
/**
 * Specifies configuration for building a search index.
 */
export declare type IndexingOptions = {
    /**
     * Callback used for extracting an ID from a document.
     */
    identifier: IdentifyFn;
    /**
     * Callback used for splitting a value of a document into individual tokens.
     */
    tokenizer: TokenizeFn;
    /**
     * Callback used for normalizing the format of the tokens.
     */
    normalizer: NormalizeFn;
    /**
     * Callback used for looking up terms in the index.
     */
    searcher: SearchFn;
    /**
     * An array containing the properties that should be indexed.
     */
    fields: PropPath[];
};
/**
 * The closure returned when the search has been initialized. Contains methods
 * for interacting with the index, such as adding documents or searching.
 */
export declare type Search<T = any, U = any> = {
    /**
     * Adds new documents to the index.
     */
    add: (documents: T[]) => void;
    /**
     * Returns matches for a term in the index.
     */
    search: (term: string) => Set<U>;
};
