import test from "ava"
import { idProp } from "../src"

test("returns the property value from an object", t => {
  const obj = { prop1: "a", prop2: "b", prop3: "c" }
  const fn = idProp<typeof obj>("prop2")

  t.is(fn(obj), "b")
})
