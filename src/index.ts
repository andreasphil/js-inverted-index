import type {
  IndexingOptions,
  Search,
  Searchable,
  SearchIndex,
  SearchIndexDump,
  Stringable,
} from "./types.ts";
import {
  fullWordSplit,
  idProp,
  lowercaseTrim,
  matchAllTerms,
  unwrap,
} from "./utils.ts";

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

// Expose utilities and building blocks for customization
export * from "./utils.ts";
