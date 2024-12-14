<h1 align="center">
  JS Inverted Index 🐕
</h1>

<p align="center">
  <strong>Lightweight, dependency-free index search with SSR support</strong>
</p>

- 🏃‍♂️ Simple and efficient for when you need just a little bit more than
  `Array.filter()`
- 📦 Supports SSR with client side hydration
- 🛠 Customizable tokenization/normalization/search/etc. handlers
- 🐛 Tiny (<1kb min+gzip) footprint with no runtime dependencies
- 🦕 Use everywhere: works with Deno, Node.js, and in the browser

## Installation

From a CDN:

```js
import createSearch from "https://esm.sh/gh/andreasphil/js-inverted-index@<tag>";
```

With a package manager:

```sh
npm i github:andreasphil/js-inverted-index#<tag>
```

## Usage

This package implements a simple
[inverted index](https://en.wikipedia.org/wiki/Inverted_index) for `string`s or
stringified data, called documents. To get started, initialize the index and
tell it which properties should be indexed:

```js
const data = [
  { id: 1, title: "Terror, The", director: { name: "Noella Grassot" } },
  { id: 2, title: "Tortured", director: { name: "Carlotta Hembry" } },
  {
    id: 3,
    title: "Early Summer (Bakushû)",
    director: { name: "Zaneta Flaubert" },
  },
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

In the default configuration, indexing splits the fields into words by matching
the `\w+` regex, discards everything else, and converts the result to lowercase.
Each obtained token is saved as a key in the index, with a list of the `id`s of
the matching documents as the values. Documents added to the index are saved too
and will be returned as the search results.

### SSR

Once built, the search index can be saved and restored. This can be useful, for
example, if you want to generate the index on the server, and send the complete
index instead of computing it in the client.

```js
// Server
const { search, add, dump } = createSearch({
  /* Options */
});
add(yourDocuments);
const serializedIndex = JSON.stringify(dump);

// Client
const { search, hydrate } = createSearch({
  /* Options */
});
hydrate(JSON.parse(serializedIndex), yourDocuments); // Documents won't be included in the dump
search("query"); // Use as usual
```

### API

See [lib.d.ts](./dist/lib.d.ts) for all available methods and docs.

## Development

This library is built with [esbuild](https://esbuild.github.io). Packages are managed by [pnpm](https://pnpm.io). Tests are powered by [Node.js' test runner](https://nodejs.org/en/learn/test-runner/introduction). The following commands are available:

```sh
pnpm test         # Run tests once
pnpm test:watch   # Run tests in watch mode
pnpm build        # Typecheck, emit declarations and bundle
```
