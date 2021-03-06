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
function idProp(prop) {
  return (document) => document[prop];
}
var lowercaseTrim = (input) => input?.trim().toLowerCase();
var matchAllTerms = (index, term, options) => {
  if (!term || Object.keys(index).length === 0) {
    return new Set();
  }
  const {tokenizer, normalizer} = options;
  const termTokens = tokenizer(term).map((token) => normalizer(token));
  const matches = termTokens.map((token) => index[token]);
  return intersect(...matches);
};
function regexSplit(exp) {
  return (input) => input ? input.match(exp) || [] : [];
}
var fullWordSplit = regexSplit(/\w+/g);

// src/index.ts
function addToIndex(index, documents, options) {
  const {tokenizer, identifier, normalizer, fields} = options;
  return documents.reduce((newIndex, document) => {
    const id = identifier(document);
    fields.map((path) => unwrap(document, path)).filter((value) => !!value).flatMap((value) => tokenizer(value.toString())).map((token) => normalizer(token)).forEach((token) => {
      if (newIndex[token]) {
        newIndex[token].add(id);
      } else {
        newIndex[token] = new Set([id]);
      }
    });
    return newIndex;
  }, index);
}
function initSearch(options = {}, initial) {
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
  initSearch as default,
  fullWordSplit,
  idProp,
  intersect,
  lowercaseTrim,
  matchAllTerms,
  regexSplit,
  unwrap
};
