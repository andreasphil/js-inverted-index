import { SearchFn } from "."
import { intersect } from "./utils"

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
export const matchAllTerms: SearchFn = (index, term, options) => {
  if (!term || Object.keys(index).length === 0) {
    return new Set()
  }

  const { tokenizer, normalizer } = options
  const termTokens = tokenizer(term).map(token => normalizer(token))
  const matches = termTokens.map(token => index[token])

  return intersect(...matches)
}
