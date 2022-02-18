# JavaScript Inverted Index Search

Lightweight index search for Deno and browsers with no runtime dependencies.

> ⚠️ Work in progress. Things are most certainly incomplete and/or broken, and will definitely change. You'll probably want to try [js-search](https://github.com/bvaughn/js-search) instead.

- 🏃‍♂️ Simple and efficient for when you need just a little bit more than `Array.filter()`
- 📦 Supports SSR with client side hydration
- 🛠 Customizable tokenization/normalization/search/etc. handlers
- 🐛 Tiny footprint with no runtime dependencies

## Installation

```
npm i github:andreasphil/js-inverted-index#<tag>
```

## Basic usage

This package implements a simple [inverted index](https://en.wikipedia.org/wiki/Inverted_index) for `string`s or stringified data, called documents. To get started, initialize the index and tell it which properties should be indexed:

```js
const data = [
  { id: 1, title: "Terror, The", director: { name: "Noella Grassot", } },
  { id: 2, title: "Tortured", director: { name: "Carlotta Hembry" } },
  { id: 3, title: "Early Summer (Bakushû)", director: { name: "Zaneta Flaubert" } },
];

const { search, add } = createSearch({
  fields: ["title", "director.name"],
});
```

`createSearch` returns an object with functions for interacting with the index:

```js
add(data);
search("germany"); // -> [{ id: 1 /*...*/ }, { id: 2 /*...*/ }]
```

In the default configuration, indexing splits the fields into words by matching the `\w+` regex, discards everything else, and converts the result to lowercase. Each obtained token is saved as a key in the index, with a list of the `id`s of the matching documents as the values. Documents added to the index are saved too and will be returned as the search results.

## SSR

Once built, the search index can be saved and restored. This can be useful, for example, if you want to generate the index on the server, and send the complete index instead of computing it in the client.

```js
// Server
const { search, add, dump } = createSearch({ /* Options */ });
add(yourDocuments);
const serializedIndex = JSON.stringify(dump);

// Client
const { search, hydrate } = createSearch({ /* Options */ });
hydrate(JSON.parse(serializedIndex), yourDocuments); // Document's won't be included in the dump
search("query"); // Use as usual
```

## Customization

By providing the corresponding callbacks to the index during initialization, you can customize how ...

- IDs are extracted from documents,
- values are tokenized,
- tokens are normalized, and
- search results are determined.

See the `IndexingOptions` type in [types.ts](src/types.ts) for all the required typings, and `createSearch` in [index.ts](src/index.ts) for an example with the default configuration.
