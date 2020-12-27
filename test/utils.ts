import test, { Macro } from "ava"
import { intersect, PropPath, unwrap } from "../src"

const unwrapMacro: Macro<[PropPath, any]> = (t, input, expected) => {
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
  }

  t.is(unwrap(obj, input), expected)
}

unwrapMacro.title = (title = "", input) =>
  `unwraps ${title}${title ? ": " : ""}${input}`

test("string path", unwrapMacro, "toplevel", "top level prop")

test("string path", unwrapMacro, "nested.normal", "normal nested prop")

test("string path", unwrapMacro, "nested.1", "number nested prop")

test(
  "string path",
  unwrapMacro,
  "nested.deep.2.deeper",
  "even deeper nested prop"
)

test(
  "non-existent string path",
  unwrapMacro,
  "nested.deep.does.not.exist",
  undefined
)

test("array path", unwrapMacro, ["toplevel"], "top level prop")

test("array path", unwrapMacro, ["nested", "normal"], "normal nested prop")

test("array path", unwrapMacro, ["nested", 1], "number nested prop")

test(
  "array path",
  unwrapMacro,
  ["nested", "deep", 2, "deeper"],
  "even deeper nested prop"
)

test(
  "non-existent array path",
  unwrapMacro,
  "nested.deep.does.not.exist",
  undefined
)

const intersectMacro: Macro<[number[][], number[]]> = (t, input, expected) => {
  const result = intersect(...input.map(i => new Set(i)))
  t.deepEqual(Array.from(result), expected)
}

intersectMacro.title = title => `intersects with ${title}`

test("a single set", intersectMacro, [[1, 2, 3, 4]], [1, 2, 3, 4])

test(
  "two intersecting sets",
  intersectMacro,
  [
    [1, 2, 3, 4],
    [3, 4, 5],
  ],
  [3, 4]
)

test(
  "two identical sets",
  intersectMacro,
  [
    [1, 2, 3],
    [1, 2, 3],
  ],
  [1, 2, 3]
)

test(
  "two sets without intersection",
  intersectMacro,
  [
    [1, 2, 3],
    [4, 5, 6],
  ],
  []
)

test("two sets when the first is empty", intersectMacro, [[], [1, 2, 3]], [])

test("two sets when the second is empty", intersectMacro, [[1, 2, 3], []], [])

test(
  "three intersecting sets",
  intersectMacro,
  [
    [1, 2],
    [2, 3],
    [1, 2, 3],
  ],
  [2]
)

test(
  "three identical sets",
  intersectMacro,
  [
    [1, 2],
    [1, 2],
    [1, 2],
  ],
  [1, 2]
)

test(
  "three sets without intersection",
  intersectMacro,
  [
    [1, 2],
    [3, 4],
    [4, 5],
  ],
  []
)

test(
  "three sets when the first is empty",
  intersectMacro,
  [[], [1, 2, 3], [4, 5, 6]],
  []
)

test(
  "three sets when the third is empty",
  intersectMacro,
  [[1, 2], [2, 3], []],
  []
)

test("intersects with no sets", t => {
  t.deepEqual(intersect(), new Set())
})
