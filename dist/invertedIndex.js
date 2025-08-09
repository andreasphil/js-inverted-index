// src/invertedIndex.js
function unwrap(obj, prop) {
  if (!obj) return void 0;
  const path = Array.isArray(prop) ? prop : prop.split(".");
  const [head, ...tail] = path;
  if (tail.length) return unwrap(obj[head], tail);
  else return obj[head];
}
function intersect(...sets) {
  if (!sets.length || sets.some((set) => !set)) return /* @__PURE__ */ new Set();
  else if (sets.length === 1) return sets[0];
  const setsCopy = [...sets];
  const a = setsCopy.shift();
  const b = setsCopy.shift();
  const intersection = /* @__PURE__ */ new Set();
  a.forEach((itemFromA) => {
    if (b.has(itemFromA)) intersection.add(itemFromA);
  });
  setsCopy.unshift(intersection);
  return intersect(...setsCopy);
}
function idProp(prop) {
  return (document) => document[prop]?.toString?.();
}
var lowercaseTrim = (input) => input?.trim().toLowerCase();
var matchAllTerms = (index, term, options) => {
  if (!term || Object.keys(index).length === 0) {
    return /* @__PURE__ */ new Set();
  }
  const { tokenizer, normalizer } = options;
  const termTokens = tokenizer(term).map((token) => normalizer(token));
  const matches = termTokens.map((token) => index[token]);
  return intersect(...matches);
};
function regexSplit(exp) {
  return (input) => input ? input.match(exp) || [] : [];
}
var fullWordSplit = regexSplit(/\w+/g);
var startsWith = (input) => {
  const inputWords = fullWordSplit(input);
  const tokens = /* @__PURE__ */ new Set();
  inputWords.filter((word) => word.length > 0).forEach((word) => {
    for (let i = 1; i <= word.length; i++) {
      tokens.add(word.substring(0, i));
    }
  });
  return Array.from(tokens);
};
function createSearch(options = {}) {
  const effectiveOptions = {
    tokenizer: fullWordSplit,
    identifier: idProp("id"),
    normalizer: lowercaseTrim,
    searcher: matchAllTerms,
    fields: [],
    ...options
  };
  let index = /* @__PURE__ */ Object.create(null);
  let indexedDocuments = {};
  const search = (term) => {
    const matches = [];
    const idMatches = effectiveOptions.searcher(index, term, effectiveOptions);
    idMatches.forEach((id) => {
      if (indexedDocuments[id]) matches.push(indexedDocuments[id]);
    });
    return matches;
  };
  const add = (documents) => {
    const { tokenizer, identifier, normalizer, fields } = effectiveOptions;
    documents.forEach((document) => {
      const id = identifier(document);
      indexedDocuments[id] = document;
      fields.map((path) => unwrap(document, path)).filter(
        /** @returns {value is Stringable} */
        (value) => !!value?.toString
      ).flatMap((value) => tokenizer(value.toString())).map((token) => normalizer(token)).forEach((token) => {
        if (index[token]) index[token].add(id);
        else index[token] = /* @__PURE__ */ new Set([id]);
      });
    });
  };
  const dump = () => {
    const dumpInit = {};
    return Object.entries(index).reduce((all, [k, v]) => {
      all[k] = Array.from(v);
      return all;
    }, dumpInit);
  };
  const hydrate = (dump2, documents) => {
    const indexInit = {};
    const documentsInit = {};
    index = Object.entries(dump2).reduce((all, [k, v]) => {
      all[k] = new Set(v);
      return all;
    }, indexInit);
    indexedDocuments = documents.reduce((all, i) => {
      all[effectiveOptions.identifier(i)] = i;
      return all;
    }, documentsInit);
  };
  return { search, add, dump, hydrate };
}
export {
  createSearch as default,
  fullWordSplit,
  idProp,
  intersect,
  lowercaseTrim,
  matchAllTerms,
  regexSplit,
  startsWith,
  unwrap
};
