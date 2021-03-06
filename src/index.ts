import { IndexingOptions, Search, SearchIndex } from "./types"
import {
  fullWordSplit,
  idProp,
  lowercaseTrim,
  matchAllTerms,
  unwrap,
} from "./utils"

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

    fields
      // Extract the specified fields from the document
      .map(path => unwrap(document, path))
      .filter(value => !!value)

      // Split the values into individual tokens and normalize the tokens
      .flatMap(value => tokenizer(value.toString()))
      .map(token => normalizer(token))

      // Map all tokens to the IDs of the documents they're contained in
      .forEach(token => {
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
export default function initSearch<DocumentType = any, IdType = any>(
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
export * from "./utils"
