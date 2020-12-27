import anyTest, { Macro, TestInterface } from "ava"
import useSearch, { matchAllTerms, Search } from "../src"

type SearchContext = { search: Search<any, number>["search"] }
const test = anyTest as TestInterface<SearchContext>

test.before(t => {
  const { search } = useSearch<any, number>(
    {
      searcher: matchAllTerms,
    },
    {
      lorem: new Set([1, 2, 3]),
      ipsum: new Set([1, 2, 3]),
      dolor: new Set([4, 5]),
      sit: new Set([2]),
      amet: new Set([3, 4]),
      consetetur: new Set([1, 2, 3, 4, 5]),
      sadipscing: new Set([0, 1, 2]),
      elitr: new Set([10]),
    }
  )

  t.context.search = search
})

test("doesn't crash with empty options", t => {
  t.notThrows(() => useSearch())
})

const matchAllTermsMacro: Macro<[string, number[]], SearchContext> = (
  t,
  input,
  expected
) => {
  const results = Array.from(t.context.search(input))
  t.deepEqual(results, expected)
}

matchAllTermsMacro.title = (title = "", input) =>
  `finds matches for ${title}${title ? " " : ""}"${input}"`

test("a term", matchAllTermsMacro, "lorem", [1, 2, 3])
test("a non-existent term", matchAllTermsMacro, "diam", [])
test("no term", matchAllTermsMacro, "", [])
test("a term that normalizes to empty", matchAllTermsMacro, ",.#$  ", [])
test("narrowing with a second term", matchAllTermsMacro, "lorem. amet?", [3])

test(
  "narrowing with a second term (swapped)",
  matchAllTermsMacro,
  "amet? lorem.",
  [3]
)

test(
  "narrowing with a non-existent term",
  matchAllTermsMacro,
  "consetetur diam",
  []
)

test(
  "narrowing with a third term",
  matchAllTermsMacro,
  "sit sadipscing **consetetur**",
  [2]
)

test(
  "narrowing with a third, non-existent term",
  matchAllTermsMacro,
  "sit sadipscing diam",
  []
)
