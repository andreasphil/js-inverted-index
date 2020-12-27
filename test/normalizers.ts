import test, { Macro } from "ava"
import { lowercaseTrim } from "../src"

const lowercaseTrimMacro: Macro<[string, string | undefined]> = (
  t,
  input,
  expected
) => {
  t.is(lowercaseTrim(input), expected)
}

lowercaseTrimMacro.title = input => `normalizes ${input}`

test(
  "converts the input to lowercase",
  lowercaseTrimMacro,
  "HeLlO wOrLd",
  "hello world"
)

test("trims trailing whitespace", lowercaseTrimMacro, "hello ", "hello")
test("trims leading whitespace", lowercaseTrimMacro, " world", "world")
test("normalizes an empty string", lowercaseTrimMacro, "", "")
test("normalizes undefined", lowercaseTrimMacro, undefined as any, undefined)
