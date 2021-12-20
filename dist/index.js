function unwrap1(obj, prop) {
    if (!obj) {
        return undefined;
    }
    const path = Array.isArray(prop) ? prop : prop.split(".");
    const [head, ...tail] = path;
    if (tail.length) {
        return unwrap1(obj[head], tail);
    } else {
        return obj[head];
    }
}
function intersect1(...sets) {
    if (!sets.length || sets.some((set)=>!set
    )) {
        return new Set();
    } else if (sets.length === 1) {
        return sets[0];
    }
    const setsCopy = [
        ...sets
    ];
    const a = setsCopy.shift();
    const b = setsCopy.shift();
    const intersection = new Set();
    a.forEach((itemFromA)=>{
        if (b.has(itemFromA)) {
            intersection.add(itemFromA);
        }
    });
    setsCopy.unshift(intersection);
    return intersect1(...setsCopy);
}
function idProp1(prop) {
    return (document)=>document[prop]
    ;
}
const lowercaseTrim1 = (input)=>input?.trim().toLowerCase()
;
const matchAllTerms1 = (index, term, options)=>{
    if (!term || Object.keys(index).length === 0) {
        return new Set();
    }
    const { tokenizer , normalizer  } = options;
    const termTokens = tokenizer(term).map((token)=>normalizer(token)
    );
    const matches = termTokens.map((token)=>index[token]
    );
    return intersect1(...matches);
};
function regexSplit1(exp) {
    return (input)=>input ? input.match(exp) || [] : []
    ;
}
const fullWordSplit1 = regexSplit1(/\w+/g);
export { unwrap1 as unwrap };
export { intersect1 as intersect };
export { idProp1 as idProp };
export { lowercaseTrim1 as lowercaseTrim };
export { matchAllTerms1 as matchAllTerms };
export { regexSplit1 as regexSplit };
export { fullWordSplit1 as fullWordSplit };
function addToIndex(index, documents, options) {
    const { tokenizer , identifier , normalizer , fields  } = options;
    return documents.reduce((newIndex, document)=>{
        const id = identifier(document);
        fields.map((path)=>unwrap1(document, path)
        ).filter((value)=>!!value
        ).flatMap((value)=>tokenizer(value.toString())
        ).map((token)=>normalizer(token)
        ).forEach((token)=>{
            if (newIndex[token]) {
                newIndex[token].add(id);
            } else {
                newIndex[token] = new Set([
                    id
                ]);
            }
        });
        return newIndex;
    }, index);
}
function initSearch(options = {
}, initial) {
    const effectiveOptions = {
        tokenizer: fullWordSplit1,
        identifier: idProp1("id"),
        normalizer: lowercaseTrim1,
        fields: [],
        searcher: matchAllTerms1,
        ...options
    };
    const index = initial || {
    };
    return {
        add: (documents)=>addToIndex(index, documents, effectiveOptions)
        ,
        search: (term)=>effectiveOptions.searcher(index, term, effectiveOptions)
    };
}
export { initSearch as default };
