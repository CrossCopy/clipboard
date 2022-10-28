
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "index.ts",
    demo: "demo.ts"
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["esm", "cjs"],
  treeshake: true,
});
