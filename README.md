# useSearch

**Lightweight index search for the frontend with no runtime dependencies. If `Array.filter()` is almost good enough, but not quite 👀**

## Installation

There's no package on npm for the time being, but you can install the latest version by referencing this repository in your `package.json`:

```json
{
  "dependencies": {
    "use-search": "github:andreasphil/use-search"
  }
}
```

## Basic usage

This package implements a simple [inverted index](https://en.wikipedia.org/wiki/Inverted_index) for `string`s or stringified data, called documents. To get started, initialize the index and tell it which properties should be indexed:

```js
const data = [
  {
    id: 1,
    title: "Terror, The",
    director: {
      name: "Noella Grassot",
    },
    rating: 3,
    country: "Germany",
  },
  {
    id: 2,
    title: "Tortured",
    director: {
      name: "Carlotta Hembry",
    },
    rating: 2,
    country: "Germany",
  },
  {
    id: 3,
    title: "Early Summer (Bakushû)",
    director: {
      name: "Zaneta Flaubert",
    },
    rating: 5,
    country: "Switzerland",
  },
]

const { search, add } = useSearch({
  fields: ["title", "director.name", "rating"],
})
```

`useSearch` returns an object with functions for interacting with the index:

```js
add(data)
search("germany") // -> Set [0, 1]
search("flaubert") // -> Set [3]
search("germany hembry") // -> Set [2]
```

In the default configuration, indexing splits the fields into words by matching the `\w+` regex, discards everything else, and converts the result to lowercase. Each obtained token is saved as a key in the index, with a list of the `id` of the matching documents as the values. Search terms are processed analogously and return results for exact matches of all terms.

## Customization

The process for adding a document to the index looks something like this:

1. Grab the ID from the document (defaults to getting the `id` property)
2. Unrwap the values for all configured fields from the document
3. Split each value into tokens (defaults to matching `\w+`)
4. Normalize all tokens (defaults to lowercase + trim)
5. Add all tokens to the index together with the ID of the document

When searching for a term, `search` runs the term through the same tokenization and normalization handlers in order to produce consistent results.

Most of these defaults can be overridden with custom logic by passing a handler function in the `useSearch` options. The full default configuration is:

```js
import { fullWordSplit } from "./tokenizers"
import { idProp } from "./identifiers"
import { lowercaseTrim } from "./normalizers"
import { matchAllTerms } from "./searchers"

const { search, add } = useSearch({
  identifier: idProp("id"),
  tokenizer: fullWordSplit,
  normalizer: lowercaseTrim,
  searcher: matchAllTerms,

  // `fields` always has to be configured
})
```

See [index.ts](src/index.ts) for all the required typings and additional information.

Implementing your own handlers for each of these options allows you to tweak the search behavior according to your needs, for example:

- If you want to allow partial matches, implement a tokenizer that returns not just full words but also all substrings (e.g. `dog` becomes `d`, `do`, `dog`, `og`, `g`)
- If you want search to be case sensitive, replace the lowercase trim normalizer with one that keeps the original casing
- If you need to find results that match _any_ of the search terms instead of _all_ terms, use a different searcher

## Limitations

useSearch was originally implemented as part of [Stargaze](https://github.com/andreasphil/stargaze) and does what I needed it to at the time, but it's by no means feature complete. Some limitations include:

- Searches and indexes only string fields (or what you get after `toString`-ing the field)
- Can't change the index much after it's been created - no updating or removing documents
- You can restore an existing index (`useSearch(options, initialIndex)`) on initialization, but there's currently no way to export the current state of an index
- Results are returned in their order in the index, no weighing whatsoever
- Only supports full matches, no partial matches
- Stores IDs instead of a reference to the original object
