// @ts-check
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import createSearch, * as s from "./mod.js";

/* -------------------------------------------------- *
 * Helpers                                            *
 * -------------------------------------------------- */

describe("unwrap", () => {
  const obj = {
    toplevel: "top level prop",
    nested: {
      normal: "normal nested prop",
      1: "number nested prop",
      deep: { 1: "deep nested prop", 2: { deeper: "even deeper nested prop" } },
    },
  };

  test("unwraps a top level prop by string", () => {
    assert.equal(s.unwrap(obj, "toplevel"), "top level prop");
  });

  test("unwraps a nested prop by string", () => {
    assert.equal(s.unwrap(obj, "nested.normal"), "normal nested prop");
  });

  test("unwraps a nested prop with a number key by string", () => {
    assert.equal(s.unwrap(obj, "nested.1"), "number nested prop");
  });

  test("unwraps a deeply nested prop by string", () => {
    assert.equal(
      s.unwrap(obj, "nested.deep.2.deeper"),
      "even deeper nested prop"
    );
  });

  test("returns undefined if the prop doesn't exist by string", () => {
    assert.equal(s.unwrap(obj, "nested.deep.does.not.exist"), undefined);
  });

  test("unwraps a toplevel prop from array", () => {
    assert.equal(s.unwrap(obj, ["toplevel"]), "top level prop");
  });

  test("unwraps a nested prop from array", () => {
    assert.equal(s.unwrap(obj, ["nested", "normal"]), "normal nested prop");
  });

  test("unwraps a nested prop with a number key from array", () => {
    // @ts-expect-error Testing a different key type on purpose
    assert.equal(s.unwrap(obj, ["nested", 1]), "number nested prop");
  });

  test("unwraps a deeply nested prop from array", () => {
    assert.equal(
      // @ts-expect-error Testing a different key type on purpose
      s.unwrap(obj, ["nested", "deep", 2, "deeper"]),
      "even deeper nested prop"
    );
  });

  test("returns undefined if the prop doesn't exist from array", () => {
    assert.equal(
      s.unwrap(obj, ["nested", "deep", "does", "not", "exist"]),
      undefined
    );
  });
});

describe("intersect", () => {
  test("one set", () => {
    const input = [[1, 2, 3, 4]];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, [1, 2, 3, 4]);
  });

  test("two intersecting sets", () => {
    const input = [
      [1, 2, 3, 4],
      [3, 4, 5],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, [3, 4]);
  });

  test("two identical sets", () => {
    const input = [
      [1, 2, 3],
      [1, 2, 3],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, [1, 2, 3]);
  });

  test("two disjunct sets", () => {
    const input = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, []);
  });

  test("two sets where the first is empty", () => {
    const input = [[], [1, 2, 3]];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, []);
  });

  test("two sets where the second is empty", () => {
    const input = [[1, 2, 3], []];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, []);
  });

  test("three intersecting sets", () => {
    const input = [
      [1, 2],
      [2, 3],
      [1, 2, 3],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, [2]);
  });

  test("three identical sets", () => {
    const input = [
      [1, 2],
      [1, 2],
      [1, 2],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, [1, 2]);
  });

  test("three disjunct sets", () => {
    const input = [
      [1, 2],
      [3, 4],
      [4, 5],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, []);
  });

  test("three sets where the first is empty", () => {
    const input = [[], [1, 2], [2, 3]];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, []);
  });

  test("three sets where the third is empty", () => {
    const input = [[1, 2], [2, 3], []];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assert.deepEqual(result, []);
  });

  test("intersects with no sets at all", () => {
    assert.deepEqual(Array.from(s.intersect()), []);
  });
});

describe("idProp", () => {
  test("returns the property value from an object", () => {
    const obj = { prop1: "a", prop2: "b", prop3: "c" };
    const fn = s.idProp("prop2");
    assert.equal(fn(obj), "b");
  });
});

/* -------------------------------------------------- *
 * Normalizers                                        *
 * -------------------------------------------------- */

describe("normalizers", () => {
  describe("lowercaseTrim", () => {
    test("converts the input to lowercase", () => {
      assert.equal(s.lowercaseTrim("HeLlO wOrLd"), "hello world");
    });

    test("trims trailing whitespace", () => {
      assert.equal(s.lowercaseTrim("hello "), "hello");
    });

    test("trims leading whitespace", () => {
      assert.equal(s.lowercaseTrim(" world"), "world");
    });

    test("normalizes an empty string", () => {
      assert.equal(s.lowercaseTrim(""), "");
    });

    test("normalizes undefined", () => {
      // @ts-expect-error Testing an edge case on purpose
      assert.equal(s.lowercaseTrim(undefined), undefined);
    });
  });
});

/* -------------------------------------------------- *
 * Tokenizers                                         *
 * -------------------------------------------------- */

describe("tokenizers", () => {
  describe("fullWordSplit", () => {
    test("splits a simple string", () => {
      assert.deepEqual(s.fullWordSplit("hello world"), ["hello", "world"]);
    });

    test("keeps letters and numbers", () => {
      assert.deepEqual(s.fullWordSplit("a 12 b&*(@"), ["a", "12", "b"]);
    });

    test("splits non-word characters", () => {
      assert.deepEqual(s.fullWordSplit("he11o-world"), ["he11o", "world"]);
    });

    test("doesn't split word characters", () => {
      assert.deepEqual(s.fullWordSplit("hello_world"), ["hello_world"]);
    });

    test("omits emojis", () => {
      assert.deepEqual(s.fullWordSplit("hello🌎world"), ["hello", "world"]);
    });

    test("omits markdown", () => {
      assert.deepEqual(s.fullWordSplit("*markdown* [text](#)"), [
        "markdown",
        "text",
      ]);
    });

    test("trims non-word characters", () => {
      assert.deepEqual(s.fullWordSplit(":emoji_code:"), ["emoji_code"]);
    });

    test("returns empty array if no words are in the string", () => {
      assert.deepEqual(s.fullWordSplit("&*(@"), []);
    });

    test("returns empty array if the string is empty", () => {
      assert.deepEqual(s.fullWordSplit(""), []);
    });

    test("returns empty array if the input is undefined", () => {
      // @ts-expect-error Testing an edge case on purpose
      assert.deepEqual(s.fullWordSplit(undefined), []);
    });
  });

  describe("startsWith", () => {
    test("splits a single word", () => {
      assert.deepEqual(s.startsWith("hello"), [
        "h",
        "he",
        "hel",
        "hell",
        "hello",
      ]);
    });

    test("splits multiple words", () => {
      assert.deepEqual(s.startsWith("hi hi"), ["h", "hi"]);
    });

    test("returns empty array if the input is undefined", () => {
      // @ts-expect-error Testing an edge case on purpose
      assert.deepEqual(s.startsWith(undefined), []);
    });

    test("returns empty array if no words are in the string", () => {
      assert.deepEqual(s.startsWith("&*(@"), []);
    });

    test("returns empty array if the string is empty", () => {
      assert.deepEqual(s.startsWith(""), []);
    });
  });
});

/* -------------------------------------------------- *
 * Matchers                                           *
 * -------------------------------------------------- */

describe("matchers", () => {
  const { search, hydrate } = createSearch({
    searcher: s.matchAllTerms,
  });

  hydrate(
    {
      lorem: ["1", "2", "3"],
      ipsum: ["1", "2", "3"],
      dolor: ["4", "5"],
      sit: ["2"],
      amet: ["3", "4"],
      consetetur: ["1", "2", "3", "4", "5"],
      sadipscing: ["0", "1", "2"],
      elitr: ["10"],
    },
    Array(10)
      .fill(0)
      .map((_, i) => ({ id: (i + 1).toString() }))
  );

  test("finds matches for a term", () => {
    assert.deepEqual(
      search("lorem").map(({ id }) => id),
      ["1", "2", "3"]
    );
  });

  test("finds matches for a non-existent term", () => {
    assert.deepEqual(
      search("diam").map(({ id }) => id),
      []
    );
  });

  test("finds matches for no term", () => {
    assert.deepEqual(
      search("").map(({ id }) => id),
      []
    );
  });

  test("finds matches for a term that normalizes to empty", () => {
    assert.deepEqual(
      search(",.#$").map(({ id }) => id),
      []
    );
  });

  test("finds matches for narrowing with a second term", () => {
    assert.deepEqual(
      search("lorem. amet?").map(({ id }) => id),
      ["3"]
    );
  });

  test("finds matches for narrowing with a second term (swap)", () => {
    assert.deepEqual(
      search("amet? lorem.").map(({ id }) => id),
      ["3"]
    );
  });

  test("finds matches for narrowing with a non-existent term", () => {
    assert.deepEqual(
      search("consetetur diam").map(({ id }) => id),
      []
    );
  });

  test("finds matches for narrowing with a third term", () => {
    assert.deepEqual(
      search("sit sadipscing **consetetur**").map(({ id }) => id),
      ["2"]
    );
  });

  test("finds matches for narrowing with a third, non-existent term", () => {
    assert.deepEqual(
      search("sit sadipscing diam").map(({ id }) => id),
      []
    );
  });
});

/* -------------------------------------------------- *
 * Search index                                       *
 * -------------------------------------------------- */

// Match all terms searcher
describe("search", () => {
  test("doesn't crash with empty options", () => {
    assert(createSearch());
  });
});
