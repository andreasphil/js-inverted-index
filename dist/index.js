// src/identifiers.ts
function idProp(prop) {
  return (document) => document[prop];
}

// src/normalizers.ts
var lowercaseTrim = (input) => input?.trim().toLowerCase();

// src/utils.ts
function unwrap(obj, prop) {
  if (!obj) {
    return void 0;
  }
  const path = Array.isArray(prop) ? prop : prop.split(".");
  const [head, ...tail] = path;
  if (tail.length) {
    return unwrap(obj[head], tail);
  } else {
    return obj[head];
  }
}
function intersect(...sets) {
  if (!sets.length || sets.some((set) => !set)) {
    return new Set();
  } else if (sets.length === 1) {
    return sets[0];
  }
  const setsCopy = [...sets];
  const a = setsCopy.shift();
  const b = setsCopy.shift();
  const intersection = new Set();
  a.forEach((itemFromA) => {
    if (b.has(itemFromA)) {
      intersection.add(itemFromA);
    }
  });
  setsCopy.unshift(intersection);
  return intersect(...setsCopy);
}

// src/searchers.ts
var matchAllTerms = (index, term, options) => {
  if (!term || Object.keys(index).length === 0) {
    return new Set();
  }
  const {tokenizer, normalizer} = options;
  const termTokens = tokenizer(term).map((token) => normalizer(token));
  const matches = termTokens.map((token) => index[token]);
  return intersect(...matches);
};

// src/tokenizers.ts
function regexSplit(exp) {
  return (input) => input ? input.match(exp) || [] : [];
}
var fullWordSplit = regexSplit(/\w+/g);

// src/index.ts
function addToIndex(index, documents, options) {
  const {tokenizer, identifier, normalizer, fields} = options;
  return documents.reduce((newIndex, document) => {
    const id = identifier(document);
    const values = fields.map((path) => unwrap(document, path));
    const tokens = values.flatMap((value) => tokenizer(value.toString())).map((token) => normalizer(token));
    tokens.forEach((token) => {
      if (newIndex[token]) {
        newIndex[token].add(id);
      } else {
        newIndex[token] = new Set([id]);
      }
    });
    return newIndex;
  }, index);
}
function useSearch(options = {}, initial) {
  const effectiveOptions = {
    tokenizer: fullWordSplit,
    identifier: idProp("id"),
    normalizer: lowercaseTrim,
    fields: [],
    searcher: matchAllTerms,
    ...options
  };
  const index = initial || {};
  return {
    add: (documents) => addToIndex(index, documents, effectiveOptions),
    search: (term) => effectiveOptions.searcher(index, term, effectiveOptions)
  };
}
export {
  useSearch as default,
  fullWordSplit,
  idProp,
  intersect,
  lowercaseTrim,
  matchAllTerms,
  regexSplit,
  unwrap
};
