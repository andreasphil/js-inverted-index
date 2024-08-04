import { assert, assertEquals } from "jsr:@std/assert@1.0.2";
import createSearch, * as s from "./mod.js";

/* -------------------------------------------------- *
 * Helpers                                            *
 * -------------------------------------------------- */

Deno.test("unwrap", async (t) => {
  const obj = {
    toplevel: "top level prop",
    nested: {
      normal: "normal nested prop",
      1: "number nested prop",
      deep: { 1: "deep nested prop", 2: { deeper: "even deeper nested prop" } },
    },
  };

  await t.step("unwraps a top level prop by string", () => {
    assertEquals(s.unwrap(obj, "toplevel"), "top level prop");
  });

  await t.step("unwraps a nested prop by string", () => {
    assertEquals(s.unwrap(obj, "nested.normal"), "normal nested prop");
  });

  await t.step("unwraps a nested prop with a number key by string", () => {
    assertEquals(s.unwrap(obj, "nested.1"), "number nested prop");
  });

  await t.step("unwraps a deeply nested prop by string", () => {
    assertEquals(
      s.unwrap(obj, "nested.deep.2.deeper"),
      "even deeper nested prop"
    );
  });

  await t.step("returns undefined if the prop doesn't exist by string", () => {
    assertEquals(s.unwrap(obj, "nested.deep.does.not.exist"), undefined);
  });

  await t.step("unwraps a toplevel prop from array", () => {
    assertEquals(s.unwrap(obj, ["toplevel"]), "top level prop");
  });

  await t.step("unwraps a nested prop from array", () => {
    assertEquals(s.unwrap(obj, ["nested", "normal"]), "normal nested prop");
  });

  await t.step("unwraps a nested prop with a number key from array", () => {
    // @ts-expect-error Testing a different key type on purpose
    assertEquals(s.unwrap(obj, ["nested", 1]), "number nested prop");
  });

  await t.step("unwraps a deeply nested prop from array", () => {
    assertEquals(
      // @ts-expect-error Testing a different key type on purpose
      s.unwrap(obj, ["nested", "deep", 2, "deeper"]),
      "even deeper nested prop"
    );
  });

  await t.step("returns undefined if the prop doesn't exist from array", () => {
    assertEquals(
      s.unwrap(obj, ["nested", "deep", "does", "not", "exist"]),
      undefined
    );
  });
});

Deno.test("intersect", async (t) => {
  await t.step("one set", () => {
    const input = [[1, 2, 3, 4]];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, [1, 2, 3, 4]);
  });

  await t.step("two intersecting sets", () => {
    const input = [
      [1, 2, 3, 4],
      [3, 4, 5],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, [3, 4]);
  });

  await t.step("two identical sets", () => {
    const input = [
      [1, 2, 3],
      [1, 2, 3],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, [1, 2, 3]);
  });

  await t.step("two disjunct sets", () => {
    const input = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, []);
  });

  await t.step("two sets where the first is empty", () => {
    const input = [[], [1, 2, 3]];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, []);
  });

  await t.step("two sets where the second is empty", () => {
    const input = [[1, 2, 3], []];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, []);
  });

  await t.step("three intersecting sets", () => {
    const input = [
      [1, 2],
      [2, 3],
      [1, 2, 3],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, [2]);
  });

  await t.step("three identical sets", () => {
    const input = [
      [1, 2],
      [1, 2],
      [1, 2],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, [1, 2]);
  });

  await t.step("three disjunct sets", () => {
    const input = [
      [1, 2],
      [3, 4],
      [4, 5],
    ];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, []);
  });

  await t.step("three sets where the first is empty", () => {
    const input = [[], [1, 2], [2, 3]];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, []);
  });

  await t.step("three sets where the third is empty", () => {
    const input = [[1, 2], [2, 3], []];
    const result = Array.from(s.intersect(...input.map((i) => new Set(i))));
    assertEquals(result, []);
  });

  await t.step("intersects with no sets at all", () => {
    assertEquals(Array.from(s.intersect()), []);
  });
});

Deno.test("returns the property value from an object", () => {
  const obj = { prop1: "a", prop2: "b", prop3: "c" };
  const fn = s.idProp("prop2");
  assertEquals(fn(obj), "b");
});

/* -------------------------------------------------- *
 * Normalizers                                        *
 * -------------------------------------------------- */

Deno.test("normalizers", async (t) => {
  await t.step("lowercaseTrim", async (t) => {
    await t.step("converts the input to lowercase", () => {
      assertEquals(s.lowercaseTrim("HeLlO wOrLd"), "hello world");
    });

    await t.step("trims trailing whitespace", () => {
      assertEquals(s.lowercaseTrim("hello "), "hello");
    });

    await t.step("trims leading whitespace", () => {
      assertEquals(s.lowercaseTrim(" world"), "world");
    });

    await t.step("normalizes an empty string", () => {
      assertEquals(s.lowercaseTrim(""), "");
    });

    await t.step("normalizes undefined", () => {
      // @ts-expect-error Testing an edge case on purpose
      assertEquals(s.lowercaseTrim(undefined), undefined);
    });
  });
});

/* -------------------------------------------------- *
 * Tokenizers                                         *
 * -------------------------------------------------- */

Deno.test("tokenizers", async (t) => {
  await t.step("fullWordSplit", async (t) => {
    await t.step("splits a simple string", () => {
      assertEquals(s.fullWordSplit("hello world"), ["hello", "world"]);
    });

    await t.step("keeps letters and numbers", () => {
      assertEquals(s.fullWordSplit("a 12 b&*(@"), ["a", "12", "b"]);
    });

    await t.step("splits non-word characters", () => {
      assertEquals(s.fullWordSplit("he11o-world"), ["he11o", "world"]);
    });

    await t.step("doesn't split word characters", () => {
      assertEquals(s.fullWordSplit("hello_world"), ["hello_world"]);
    });

    await t.step("omits emojis", () => {
      assertEquals(s.fullWordSplit("hello🌎world"), ["hello", "world"]);
    });

    await t.step("omits markdown", () => {
      assertEquals(s.fullWordSplit("*markdown* [text](#)"), [
        "markdown",
        "text",
      ]);
    });

    await t.step("trims non-word characters", () => {
      assertEquals(s.fullWordSplit(":emoji_code:"), ["emoji_code"]);
    });

    await t.step("returns empty array if no words are in the string", () => {
      assertEquals(s.fullWordSplit("&*(@"), []);
    });

    await t.step("returns empty array if the string is empty", () => {
      assertEquals(s.fullWordSplit(""), []);
    });

    await t.step("returns empty array if the input is undefined", () => {
      // @ts-expect-error Testing an edge case on purpose
      assertEquals(s.fullWordSplit(undefined), []);
    });
  });

  await t.step("startsWith", async (t) => {
    await t.step("splits a single word", () => {
      assertEquals(s.startsWith("hello"), ["h", "he", "hel", "hell", "hello"]);
    });

    await t.step("splits multiple words", () => {
      assertEquals(s.startsWith("hi hi"), ["h", "hi"]);
    });

    await t.step("returns empty array if the input is undefined", () => {
      // @ts-expect-error Testing an edge case on purpose
      assertEquals(s.startsWith(undefined), []);
    });

    await t.step("returns empty array if no words are in the string", () => {
      assertEquals(s.startsWith("&*(@"), []);
    });

    await t.step("returns empty array if the string is empty", () => {
      assertEquals(s.startsWith(""), []);
    });
  });
});

/* -------------------------------------------------- *
 * Matchers                                           *
 * -------------------------------------------------- */

Deno.test("matchers", async (t) => {
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

  await t.step("finds matches for a term", () => {
    assertEquals(
      search("lorem").map(({ id }) => id),
      ["1", "2", "3"]
    );
  });

  await t.step("finds matches for a non-existent term", () => {
    assertEquals(
      search("diam").map(({ id }) => id),
      []
    );
  });

  await t.step("finds matches for no term", () => {
    assertEquals(
      search("").map(({ id }) => id),
      []
    );
  });

  await t.step("finds matches for a term that normalizes to empty", () => {
    assertEquals(
      search(",.#$").map(({ id }) => id),
      []
    );
  });

  await t.step("finds matches for narrowing with a second term", () => {
    assertEquals(
      search("lorem. amet?").map(({ id }) => id),
      ["3"]
    );
  });

  await t.step("finds matches for narrowing with a second term (swap)", () => {
    assertEquals(
      search("amet? lorem.").map(({ id }) => id),
      ["3"]
    );
  });

  await t.step("finds matches for narrowing with a non-existent term", () => {
    assertEquals(
      search("consetetur diam").map(({ id }) => id),
      []
    );
  });

  await t.step("finds matches for narrowing with a third term", () => {
    assertEquals(
      search("sit sadipscing **consetetur**").map(({ id }) => id),
      ["2"]
    );
  });

  await t.step(
    "finds matches for narrowing with a third, non-existent term",
    () => {
      assertEquals(
        search("sit sadipscing diam").map(({ id }) => id),
        []
      );
    }
  );
});

/* -------------------------------------------------- *
 * Search index                                       *
 * -------------------------------------------------- */

// Match all terms searcher
Deno.test("doesn't crash with empty options", () => {
  assert(createSearch());
});
