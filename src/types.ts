// deno-lint-ignore-file no-explicit-any

/** Specifies a nested property inside an object */
export type PropPath = string | string[];

/** Strings or stuff that can be converted into a string */
export type Stringable = string | { toString: () => string };

/** Documents that can be added to the search index */
export type Searchable = Record<string, unknown>;

/** Mapping of search terms to the IDs of matching documents */
export type SearchIndex = Record<string, Set<string>>;

/** Search index with an ID array instead of a set (for JSON serialization) */
export type SearchIndexDump = Record<string, string[]>;

/**
 * Takes a document and returns a value that can be used for uniqeuly
 * identifying the document.
 *
 * @param document Original document
 * @returns Identifier of the document
 */
export type IdentifierFn<T extends Searchable = any, U = string> = (
  document: T,
) => U;

/**
 * Takes a string and splits it into individual tokens. These tokens will be
 * used for building the search index.
 *
 * @param input Source string
 * @returns Tokens found in the source string
 */
export type TokenizerFn = (input: string) => string[];

/**
 * Takes a string and returns it in a normalized format, e.g. converts it to
 * lowercase and trim leading/trailing whitespace.
 *
 * @param input Source string
 * @returns Normalized string
 */
export type NormalizerFn = (input: string) => string;

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
export type SearcherFn = (
  index: SearchIndex,
  term: string,
  options: IndexingOptions,
) => Set<string>;

/** Specifies configuration for building a search index. */
export type IndexingOptions = {
  /** Callback used for extracting an ID from a document. */
  identifier: IdentifierFn;
  /** Callback used for splitting a value of a document into tokens. */
  tokenizer: TokenizerFn;
  /** Callback used for normalizing the format of the tokens. */
  normalizer: NormalizerFn;
  /** Callback used for looking up terms in the index. */
  searcher: SearcherFn;
  /** An array containing the properties that should be indexed. */
  fields: PropPath[];
};

/**
 * The closure returned when the search has been initialized. Contains methods
 * for interacting with the index, such as adding documents or searching.
 */
export type Search<T extends Searchable = any> = {
  search: (term: string) => T[];
  add: (documents: T[]) => void;
  dump: () => SearchIndexDump;
  hydrate: (index: SearchIndexDump, documents: T[]) => void;
};
