// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

function unwrap(obj, prop) {
    if (!obj) return undefined;
    const path = Array.isArray(prop) ? prop : prop.split(".");
    const [head, ...tail] = path;
    if (tail.length) return unwrap(obj[head], tail);
    else return obj[head];
}
function intersect(...sets) {
    if (!sets.length || sets.some((set)=>!set)) return new Set();
    else if (sets.length === 1) return sets[0];
    const setsCopy = [
        ...sets
    ];
    const a = setsCopy.shift();
    const b = setsCopy.shift();
    const intersection = new Set();
    a.forEach((itemFromA)=>{
        if (b.has(itemFromA)) intersection.add(itemFromA);
    });
    setsCopy.unshift(intersection);
    return intersect(...setsCopy);
}
function idProp(prop) {
    return (document)=>document[prop]?.toString?.();
}
const lowercaseTrim = (input)=>input?.trim().toLowerCase();
const matchAllTerms = (index, term, options)=>{
    if (!term || Object.keys(index).length === 0) {
        return new Set();
    }
    const { tokenizer , normalizer  } = options;
    const termTokens = tokenizer(term).map((token)=>normalizer(token));
    const matches = termTokens.map((token)=>index[token]);
    return intersect(...matches);
};
function regexSplit(exp) {
    return (input)=>input ? input.match(exp) || [] : [];
}
const fullWordSplit = regexSplit(/\w+/g);
const startsWith = (input)=>{
    const inputWords = fullWordSplit(input);
    const tokens = new Set();
    inputWords.filter((word)=>word.length > 0).forEach((word)=>{
        for(let i = 1; i <= word.length; i++){
            tokens.add(word.substring(0, i));
        }
    });
    return Array.from(tokens);
};
export { unwrap as unwrap };
export { intersect as intersect };
export { idProp as idProp };
export { lowercaseTrim as lowercaseTrim };
export { matchAllTerms as matchAllTerms };
export { regexSplit as regexSplit };
export { fullWordSplit as fullWordSplit };
export { startsWith as startsWith };
function createSearch(options = {}) {
    const effectiveOptions = {
        tokenizer: fullWordSplit,
        identifier: idProp("id"),
        normalizer: lowercaseTrim,
        searcher: matchAllTerms,
        fields: [],
        ...options
    };
    let index = {};
    let indexedDocuments = {};
    const search = (term)=>{
        const matches = [];
        const idMatches = effectiveOptions.searcher(index, term, effectiveOptions);
        idMatches.forEach((id)=>{
            if (indexedDocuments[id]) matches.push(indexedDocuments[id]);
        });
        return matches;
    };
    const add = (documents)=>{
        const { tokenizer , identifier , normalizer , fields  } = effectiveOptions;
        documents.forEach((document)=>{
            const id = identifier(document);
            indexedDocuments[id] = document;
            fields.map((path)=>unwrap(document, path)).filter((value)=>!!value?.toString).flatMap((value)=>tokenizer(value.toString())).map((token)=>normalizer(token)).forEach((token)=>{
                if (index[token]) index[token].add(id);
                else index[token] = new Set([
                    id
                ]);
            });
        });
    };
    const dump = ()=>Object.entries(index).reduce((all, [k, v])=>{
            all[k] = Array.from(v);
            return all;
        }, {});
    const hydrate = (dump, documents)=>{
        index = Object.entries(dump).reduce((all, [k, v])=>{
            all[k] = new Set(v);
            return all;
        }, {});
        indexedDocuments = documents.reduce((all, i)=>{
            all[effectiveOptions.identifier(i)] = i;
            return all;
        }, {});
    };
    return {
        search,
        add,
        dump,
        hydrate
    };
}
export { createSearch as default };
