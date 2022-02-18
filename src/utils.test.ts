// deno-lint-ignore-file no-explicit-any
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  fullWordSplit,
  idProp,
  intersect,
  lowercaseTrim,
  unwrap,
} from "./utils.ts";
import initSearch, { matchAllTerms } from "./index.ts";
import createSearch from "./index.ts";

// ID prop extract
Deno.test("returns the property value from an object", () => {
  const obj = { prop1: "a", prop2: "b", prop3: "c" };
  const fn = idProp<typeof obj>("prop2");

  assertEquals(fn(obj), "b");
});

// Trim normalizer
[
  ["converts the input to lowercase", "HeLlO wOrLd", "hello world"],
  ["trims trailing whitespace", "hello ", "hello"],
  ["trims leading whitespace", " world", "world"],
  ["normalizes an empty string", "", ""],
].forEach(([title, input, expected]) => {
  Deno.test(title, () => assertEquals(lowercaseTrim(input), expected));
});

Deno.test("normalizes undefined", () => {
  assertEquals(lowercaseTrim(undefined as any), undefined);
});

// Word split tokenizer
[
  ["hello world", ["hello", "world"]],
  ["hello 1234 world&*(@", ["hello", "1234", "world"]],
  ["he11o-world", ["he11o", "world"]],
  ["hello_world", ["hello_world"]],
  ["hello🌎world", ["hello", "world"]],
  ["*some markdown* [text](#)", ["some", "markdown", "text"]],
  [":emoji_code:", ["emoji_code"]],
  ["&*(@", []],
  ["", []],
  [undefined as any, []],
  ["Lorem ipsum. dolor, sit amet,  ", [
    "Lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
  ]],
].forEach(([input, expected]) => {
  Deno.test(`splits "${input}"`, () =>
    assertEquals(fullWordSplit(input), expected));
});

// Match all terms searcher
Deno.test("doesn't crash with empty options", () => {
  assert(initSearch());
});

(() => {
  const { search, hydrate } = createSearch<any>({
    searcher: matchAllTerms,
  });

  hydrate({
    lorem: ["1", "2", "3"],
    ipsum: ["1", "2", "3"],
    dolor: ["4", "5"],
    sit: ["2"],
    amet: ["3", "4"],
    consetetur: ["1", "2", "3", "4", "5"],
    sadipscing: ["0", "1", "2"],
    elitr: ["10"],
  }, Array(10).fill(0).map((_, i) => ({ id: (i + 1).toString() })));

  const searches: [string, string, string[] | never[]][] = [
    ["a term", "lorem", ["1", "2", "3"]],
    ["a non-existent term", "diam", []],
    ["no term", "", []],
    ["a term that normalizes to empty", ",.#$", []],
    ["narrowing with a second term", "lorem. amet?", ["3"]],
    ["narrowing with a second term (swapped)", "amet? lorem.", ["3"]],
    ["narrowing with a non-existent term", "consetetur diam", []],
    ["narrowing with a third term", "sit sadipscing **consetetur**", ["2"]],
    ["narrowing with a third, non-existent term", "sit sadipscing diam", []],
  ];

  searches.forEach(([title, input, expected]) => {
    Deno.test(
      `finds matches for ${title}`,
      () => {
        const results = search(input).map(({ id }) => id);
        assertEquals(results, expected);
      },
    );
  });
})();

// Unwrap
(() => {
  const obj = {
    toplevel: "top level prop",
    nested: {
      normal: "normal nested prop",
      1: "number nested prop",
      deep: {
        1: "deep nested prop",
        2: {
          deeper: "even deeper nested prop",
        },
      },
    },
  };

  const paths: [string | any[], string | undefined][] = [
    ["toplevel", "top level prop"],
    ["nested.normal", "normal nested prop"],
    ["nested.1", "number nested prop"],
    ["nested.deep.2.deeper", "even deeper nested prop"],
    ["nested.deep.does.not.exist", undefined],
    [["toplevel"], "top level prop"],
    [["nested", "normal"], "normal nested prop"],
    [["nested", 1], "number nested prop"],
    [["nested", "deep", 2, "deeper"], "even deeper nested prop"],
    [["nested", "deep", "does", "not", "exist"], undefined],
  ];

  paths.forEach(([input, expected]) => {
    Deno.test(`unwraps ${input}`, () => {
      assertEquals(unwrap(obj, input), expected);
    });
  });
})();

// Intersect
(() => {
  const sets: [string, number[][], number[]][] = [
    ["one set", [[1, 2, 3, 4]], [1, 2, 3, 4]],
    ["two intersecting sets", [[1, 2, 3, 4], [3, 4, 5]], [3, 4]],
    ["two identical sets", [[1, 2, 3], [1, 2, 3]], [1, 2, 3]],
    ["two disjunct sets", [[1, 2, 3], [4, 5, 6]], []],
    ["two sets where the first is empty", [[], [1, 2, 3]], []],
    ["two sets where the second is empty", [[1, 2, 3], []], []],
    ["three intersecting sets", [[1, 2], [2, 3], [1, 2, 3]], [2]],
    ["three identical sets", [[1, 2], [1, 2], [1, 2]], [1, 2]],
    ["three disjunct sets", [[1, 2], [3, 4], [4, 5]], []],
    ["three sets where the first is empty", [[], [1, 2], [2, 3]], []],
    ["three sets where the third is empty", [[1, 2], [2, 3], []], []],
  ];

  sets.forEach(([title, input, expected]) => {
    Deno.test(`intersects with ${title}`, () => {
      const result = Array.from(intersect(...input.map((i) => new Set(i))));
      assertEquals(result, expected);
    });
  });

  Deno.test("intersects with no sets at all", () => {
    assertEquals(Array.from(intersect()), []);
  });
})();
