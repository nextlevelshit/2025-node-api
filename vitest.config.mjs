import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use Node.js environment (default, but explicit)
    environment: "node",

    // Global test setup
    globals: false, // Prefer explicit imports for better IDE support

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "coverage/",
        "src/config/",
        "**/*.config.{js,ts,mjs}",
        "**/*.test.{js,ts}",
        "**/index.js", // Main entry point
      ],
    },

    // Test file patterns
    include: [
      "**/*.{test,spec}.{js,mjs,ts}",
      "**/*.{unit,integration,e2e}.test.{js,mjs,ts}",
    ],

    // Exclude patterns
    exclude: ["node_modules/", "dist/", "build/"],

    // Timeout settings
    testTimeout: 30000, // 30s for e2e tests
    hookTimeout: 30000,

    // Reporter configuration
    reporter: process.env.CI ? ["verbose", "github-actions"] : ["verbose"],

    // Concurrent testing
    pool: "forks", // Better isolation for server tests
    poolOptions: {
      forks: {
        singleFork: true, // Avoid port conflicts in e2e tests
      },
    },

    // Setup files
    setupFiles: [],

    // Watch mode ignore patterns
    watchExclude: ["node_modules/**", "dist/**", "coverage/**"],
  },

  // Vite-specific config (if needed for preprocessing)
  esbuild: {
    target: "node18", // Match your Node version
  },
});
