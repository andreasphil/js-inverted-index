import { IndexingOptions, Search, SearchIndex } from "./types";
/**
 * Creates a new search index and returns functions for interacting with it.
 *
 * @param options Configuration for the index
 * @param initial Existing search index
 */
export default function initSearch<DocumentType = any, IdType = any>(options?: Partial<IndexingOptions>, initial?: SearchIndex<IdType>): Search<DocumentType, IdType>;
export * from "./utils";
