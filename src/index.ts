import { idProp } from "./identifiers"
import { lowercaseTrim } from "./normalizers"
import { matchAllTerms } from "./searchers"
import { fullWordSplit } from "./tokenizers"
import { PropPath, unwrap } from "./utils"

/**
 * An inverted index mapping search terms to a set of IDs of objects matching
 * the search term.
 */
export type SearchIndex<T = any> = Record<string, Set<T>>

/**
 * Takes a document and returns a value that can be used for uniqeuly
 * identifying the document.
 *
 * @param document Original document
 * @returns Identifier of the document
 */
export type IdentifyFn<T = any, U = any> = (document: T) => U

/**
 * Takes a string and splits it into individual tokens. These tokens will be
 * used for building the search index.
 *
 * @param input Source string
 * @returns Tokens found in the source string
 */
export type TokenizeFn = (input: string) => string[]

/**
 * Takes a string and returns it in a normalized format, e.g. converts it to
 * lowercase and trim leading/trailing whitespace.
 *
 * @param input Source string
 * @returns Normalized string
 */
export type NormalizeFn = (input: string) => string

/**
 * Takes and index and returns all search results for the specified term. Calls
 * to the function will also pass the original indexing options. These can be
 * used for normalizing and tokenizing the search term in the same way the
 * documents in the index are in order to make matches more likely.
 *
 * @param index Index to search in
 * @param term Term to search for
 * @param options Options used for generating the index
 * @returns Set of IDs of documents matching the term
 */
export type SearchFn<T = any> = (
  index: SearchIndex,
  term: string,
  options: IndexingOptions // eslint-disable-line
) => Set<T>

/**
 * Specifies configuration for building a search index.
 */
export type IndexingOptions = {
  /**
   * Callback used for extracting an ID from a document.
   */
  identifier: IdentifyFn

  /**
   * Callback used for splitting a value of a document into individual tokens.
   */
  tokenizer: TokenizeFn

  /**
   * Callback used for normalizing the format of the tokens.
   */
  normalizer: NormalizeFn

  /**
   * Callback used for looking up terms in the index.
   */
  searcher: SearchFn

  /**
   * An array containing the properties that should be indexed.
   */
  fields: PropPath[]
}

/**
 * The closure returned when the search has been initialized. Contains methods
 * for interacting with the index, such as adding documents or searching.
 */
export type Search<T = any, U = any> = {
  /**
   * Adds new documents to the index.
   */
  add: (documents: T[]) => void

  /**
   * Returns matches for a term in the index.
   */
  search: (term: string) => Set<U>
}

/**
 * Adds the specified data to an existing search index.
 *
 * @param index Existing index
 * @param documents New data to add
 * @param options Indexing options
 * @returns Combined search index containing the old and new data
 */
function addToIndex<T = any>(
  index: SearchIndex,
  documents: T[],
  options: IndexingOptions
): SearchIndex {
  const { tokenizer, identifier, normalizer, fields } = options

  return documents.reduce<SearchIndex>((newIndex, document) => {
    // Get the ID of the document
    const id = identifier(document)

    // Extract the specified fields from the document
    const values = fields
      .map(path => unwrap(document, path))
      .filter(value => !!value)

    // Split the values into individual tokens and normalize the tokens
    const tokens = values
      .flatMap(value => tokenizer(value.toString()))
      .map(token => normalizer(token))

    // Map all tokens to the IDs of the documents they're contained in
    tokens.forEach(token => {
      if (newIndex[token]) {
        newIndex[token].add(id)
      } else {
        newIndex[token] = new Set([id])
      }
    })

    return newIndex
  }, index)
}

/**
 * Creates a new search index and returns functions for interacting with it.
 *
 * @param options Configuration for the index
 * @param initial Existing search index
 */
export default function useSearch<DocumentType = any, IdType = any>(
  options: Partial<IndexingOptions> = {},
  initial?: SearchIndex<IdType>
): Search<DocumentType, IdType> {
  // Merge custom and default options
  const effectiveOptions: IndexingOptions = {
    tokenizer: fullWordSplit,
    identifier: idProp("id"),
    normalizer: lowercaseTrim,
    fields: [],
    searcher: matchAllTerms,
    ...options,
  }

  const index = initial || {}

  return {
    add: documents => addToIndex(index, documents, effectiveOptions),
    search: term => effectiveOptions.searcher(index, term, effectiveOptions),
  }
}

// Expose utilities and building blocks for customization
export * from "./identifiers"
export * from "./normalizers"
export * from "./searchers"
export * from "./tokenizers"
export * from "./utils"
