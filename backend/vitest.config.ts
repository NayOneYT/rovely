import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    globalSetup: "./vitest.global-setup.ts",
    setupFiles: ["./tests/load-env.ts", "./vitest.setup.ts"]
  }
})