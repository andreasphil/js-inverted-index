import { build, emptyDir } from "dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {},
  test: false,
  scriptModule: false,
  package: {
    name: "@andreasphil/js-inverted-index",
    version: Deno.args[0],
    description: "Lightweight, dependency-free index search with SSR support",
    author: "Andreas Philippi",
    license: "MIT",
    type: "module",
    main: "npm/mod.js",
    repository: "https://github.com/andreasphil/js-inverted-index",
  },
});
