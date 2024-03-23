// deno-lint-ignore-file no-explicit-any
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
export function unwrap(obj, prop) {
    if (!obj)
        return undefined;
    const path = Array.isArray(prop) ? prop : prop.split(".");
    const [head, ...tail] = path;
    if (tail.length)
        return unwrap(obj[head], tail);
    else
        return obj[head];
}
/**
 * Returns the intersection of multiple sets.
 *
 * @param sets Sets to get common elements from
 * @returns Set containing the elements shared among the source sets
 */
export function intersect(...sets) {
    if (!sets.length || sets.some((set) => !set))
        return new Set();
    else if (sets.length === 1)
        return sets[0];
    const setsCopy = [...sets];
    const a = setsCopy.shift();
    const b = setsCopy.shift();
    const intersection = new Set();
    a.forEach((itemFromA) => {
        if (b.has(itemFromA))
            intersection.add(itemFromA);
    });
    setsCopy.unshift(intersection);
    return intersect(...setsCopy);
}
/** Identifies documents by the value of a property */
export function idProp(prop) {
    return (document) => document[prop]?.toString?.();
}
/* -------------------------------------------------- *
 * Normalizers                                        *
 * -------------------------------------------------- */
/** Removes leading/trailing whitespace and converts the value to lowercase */
export const lowercaseTrim = (input) => input?.trim().toLowerCase();
/* -------------------------------------------------- *
 * Matchers                                           *
 * -------------------------------------------------- */
/**
 * Looks up all ID entries in the index for a search term. The search term is
 * split according to the provided matcher expression. If the term consists of
 * multiple words, only results containing all words are returned.
 */
export const matchAllTerms = (index, term, options) => {
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
export function regexSplit(exp) {
    return (input) => (input ? input.match(exp) || [] : []);
}
/** Returns a tokenizer that splits values on word boundaries */
export const fullWordSplit = regexSplit(/\w+/g);
/**
 * Returns a tokenizer that returns the word itself as well as anything that
 * that would return true if used with `startsWith`, e.g. for dog, return d,
 * do, and dog.
 */
export const startsWith = (input) => {
    const inputWords = fullWordSplit(input);
    const tokens = new Set();
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
export default function createSearch(options = {}) {
    // Merge custom and default options
    const effectiveOptions = {
        tokenizer: fullWordSplit,
        identifier: idProp("id"),
        normalizer: lowercaseTrim,
        searcher: matchAllTerms,
        fields: [],
        ...options,
    };
    /** Map of possible search terms -> document IDs */
    let index = {};
    /** Map of document IDs -> original documents */
    let indexedDocuments = {};
    /** Search the list of documents for a specific search term */
    const search = (term) => {
        const matches = [];
        const idMatches = effectiveOptions.searcher(index, term, effectiveOptions);
        idMatches.forEach((id) => {
            if (indexedDocuments[id])
                matches.push(indexedDocuments[id]);
        });
        return matches;
    };
    const add = (documents) => {
        const { tokenizer, identifier, normalizer, fields } = effectiveOptions;
        documents.forEach((document) => {
            const id = identifier(document);
            indexedDocuments[id] = document;
            fields
                .map((path) => unwrap(document, path))
                .filter((value) => !!value?.toString)
                .flatMap((value) => tokenizer(value.toString()))
                .map((token) => normalizer(token))
                .forEach((token) => {
                if (index[token])
                    index[token].add(id);
                else
                    index[token] = new Set([id]);
            });
        });
    };
    const dump = () => Object.entries(index).reduce((all, [k, v]) => {
        all[k] = Array.from(v);
        return all;
    }, {});
    const hydrate = (dump, documents) => {
        index = Object.entries(dump).reduce((all, [k, v]) => {
            all[k] = new Set(v);
            return all;
        }, {});
        indexedDocuments = documents.reduce((all, i) => {
            all[effectiveOptions.identifier(i)] = i;
            return all;
        }, {});
    };
    return { search, add, dump, hydrate };
}
