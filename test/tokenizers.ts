import anyTest, { Macro, TestInterface } from "ava"
import { fullWordSplit } from "../src"
import { TokenizeFn } from "../src/types"

const test = anyTest as TestInterface<{ tokenizer: TokenizeFn }>

test.before(t => {
  t.context.tokenizer = fullWordSplit
})

test("creates", t => {
  t.truthy(t.context.tokenizer)
})

const splitWordsMacro: Macro<[string, string[]], { tokenizer: TokenizeFn }> = (
  t,
  input,
  expected
) => {
  t.deepEqual(t.context.tokenizer(input), expected)
}

splitWordsMacro.title = (title, input, expected) => `splits ${input}`

test(splitWordsMacro, "hello world", ["hello", "world"])
test(splitWordsMacro, "hello 1234 world&*(@", ["hello", "1234", "world"])
test(splitWordsMacro, "he11o-world", ["he11o", "world"])
test(splitWordsMacro, "hello_world", ["hello_world"])
test(splitWordsMacro, "hello🌎world", ["hello", "world"])
test(splitWordsMacro, "*some markdown* [text](#)", ["some", "markdown", "text"])
test(splitWordsMacro, ":emoji_code:", ["emoji_code"])
test(splitWordsMacro, "&*(@", [])
test(splitWordsMacro, "", [])
test(splitWordsMacro, undefined as any, [])

test(splitWordsMacro, "Lorem ipsum. dolor, sit amet,  ", [
  "Lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
])
