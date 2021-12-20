# Inverted Index with JS

Lightweight index search for Deno and browsers with no runtime dependencies.

## Installation

```
npm i github:andreasphil/js-inverted-index
```

## Limitations

I originally implemented this as an exercise for [Stargaze](https://github.com/andreasphil/stargaze). It does what I needed it to at the time, but it's by no means feature complete or convenient to use. You'll probably want to try [js-search](https://github.com/bvaughn/js-search) instead.

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

const { search, add } = initSearch({
  fields: ["title", "director.name", "rating"],
})
```

`initSearch` returns an object with functions for interacting with the index:

```js
add(data)
search("germany") // -> Set [0, 1]
search("flaubert") // -> Set [3]
search("germany hembry") // -> Set [2]
```

In the default configuration, indexing splits the fields into words by matching the `\w+` regex, discards everything else, and converts the result to lowercase. Each obtained token is saved as a key in the index, with a list of the `id` of the matching documents as the values.

## Customization

By providing the corresponding callbacks to the index during initialization, you can customize how ...

- IDs are extracted from documents,
- values are tokenized,
- tokens are normalized, and
- search results are determined.

See the `IndexingOptions` type in [types.ts](src/types.ts) for all the required typings, and `initSearch` in [index.ts](src/index.ts) for an example with the default configuration.
