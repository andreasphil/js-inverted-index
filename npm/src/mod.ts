// deno-lint-ignore-file no-explicit-any

/* -------------------------------------------------- *
 * Types                                              *
 * -------------------------------------------------- */

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

/* -------------------------------------------------- *
 * Helpers                                            *
 * -------------------------------------------------- */

/**
 * Recursively reads the value of a property from nested object structures. For
 * example:
 *
 * getNestedProp({ a: { b: 'value' }}, 'a.b') // => 'value'
 * getNestedProp({ a: { b: 'value' }}, ['a', 'b']) // => 'value'
 */
export function unwrap(
  obj: Record<string, any>,
  prop: PropPath,
): Stringable | undefined {
  if (!obj) return undefined;

  const path = Array.isArray(prop) ? prop : prop.split(".");
  const [head, ...tail] = path;

  if (tail.length) return unwrap(obj[head], tail);
  else return obj[head];
}

/**
 * Returns the intersection of multiple sets.
 *
 * @param sets Sets to get common elements from
 * @returns Set containing the elements shared among the source sets
 */
export function intersect<T = unknown>(...sets: Set<T>[]): Set<T> {
  if (!sets.length || sets.some((set) => !set)) return new Set();
  else if (sets.length === 1) return sets[0];

  const setsCopy = [...sets];
  const a = setsCopy.shift();
  const b = setsCopy.shift();
  const intersection = new Set<T>();

  a!.forEach((itemFromA) => {
    if (b!.has(itemFromA)) intersection.add(itemFromA);
  });

  setsCopy.unshift(intersection);

  return intersect(...setsCopy);
}

/** Identifies documents by the value of a property */
export function idProp<T extends Record<string, any>>(
  prop: keyof T,
): IdentifierFn<T> {
  return (document) => document[prop]?.toString?.();
}

/* -------------------------------------------------- *
 * Normalizers                                        *
 * -------------------------------------------------- */

/** Removes leading/trailing whitespace and converts the value to lowercase */
export const lowercaseTrim: NormalizerFn = (input) =>
  input?.trim().toLowerCase();

/* -------------------------------------------------- *
 * Matchers                                           *
 * -------------------------------------------------- */

/**
 * Looks up all ID entries in the index for a search term. The search term is
 * split according to the provided matcher expression. If the term consists of
 * multiple words, only results containing all words are returned.
 */
export const matchAllTerms: SearcherFn = (index, term, options) => {
  if (!term || Object.keys(index).length === 0) {
    return new Set();
  }

  const { tokenizer, normalizer } = options;
  const termTokens = tokenizer(term).map((token) => normalizer(token));
  const matches = termTokens.map((token) => index[token]);

  return intersect(...matches);
};

/* -------------------------------------------------- *
 * Tokenizers                                         *
 * -------------------------------------------------- */

/** Returns a new tokenizer that splits a value based on the specified regex */
export function regexSplit(exp: RegExp): TokenizerFn {
  return (input) => (input ? input.match(exp) || [] : []);
}

/** Returns a tokenizer that splits values on word boundaries */
export const fullWordSplit = regexSplit(/\w+/g);

/**
 * Returns a tokenizer that returns the word itself as well as anything that
 * that would return true if used with `startsWith`, e.g. for dog, return d,
 * do, and dog.
 */
export const startsWith: TokenizerFn = (input) => {
  const inputWords: string[] = fullWordSplit(input);
  const tokens = new Set<string>();

  inputWords
    .filter((word) => word.length > 0)
    .forEach((word) => {
      for (let i = 1; i <= word.length; i++) {
        tokens.add(word.substring(0, i));
      }
    });

  return Array.from(tokens);
};

/* -------------------------------------------------- *
 * Search index                                       *
 * -------------------------------------------------- */

/** Creates a new search index and returns functions for interacting with it */
export default function createSearch<T extends Searchable>(
  options: Partial<IndexingOptions> = {},
): Search<T> {
  // Merge custom and default options
  const effectiveOptions: IndexingOptions = {
    tokenizer: fullWordSplit,
    identifier: idProp("id"),
    normalizer: lowercaseTrim,
    searcher: matchAllTerms,
    fields: [],
    ...options,
  };

  /** Map of possible search terms -> document IDs */
  let index: SearchIndex = {};
  /** Map of document IDs -> original documents */
  let indexedDocuments: Record<string, T> = {};

  /** Search the list of documents for a specific search term */
  const search: Search<T>["search"] = (term) => {
    const matches: T[] = [];
    const idMatches = effectiveOptions.searcher(index, term, effectiveOptions);
    idMatches.forEach((id) => {
      if (indexedDocuments[id]) matches.push(indexedDocuments[id]);
    });

    return matches;
  };

  const add: Search<T>["add"] = (documents) => {
    const { tokenizer, identifier, normalizer, fields } = effectiveOptions;

    documents.forEach((document) => {
      const id = identifier(document);
      indexedDocuments[id] = document;

      fields
        .map((path) => unwrap(document, path))
        .filter((value): value is Stringable => !!value?.toString)
        .flatMap((value) => tokenizer(value.toString()))
        .map((token) => normalizer(token))
        .forEach((token) => {
          if (index[token]) index[token].add(id);
          else index[token] = new Set([id]);
        });
    });
  };

  const dump: Search<T>["dump"] = () =>
    Object.entries(index).reduce<SearchIndexDump>((all, [k, v]) => {
      all[k] = Array.from(v);
      return all;
    }, {});

  const hydrate: Search<T>["hydrate"] = (
    dump: SearchIndexDump,
    documents: T[],
  ) => {
    index = Object.entries(dump).reduce<SearchIndex>((all, [k, v]) => {
      all[k] = new Set(v);
      return all;
    }, {});

    indexedDocuments = documents.reduce<Record<string, T>>((all, i) => {
      all[effectiveOptions.identifier(i)] = i;
      return all;
    }, {});
  };

  return { search, add, dump, hydrate };
}
