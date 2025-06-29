import { describe, test, expect, beforeEach, vi } from "vitest";
import { Cache } from "./Cache.js";

describe("Cache - Unit Tests", () => {
  let cache;

  beforeEach(() => {
    cache = new Cache({ debug: false });
    // Silence console for cleaner test output
    console.table = vi.fn();
    console.debug = vi.fn();
    console.warn = vi.fn();
    console.log = vi.fn();
  });

  describe("Core CRUD operations", () => {
    test("creates and retrieves data with custom key", () => {
      const testData = { user: "wolfgang", city: "stuttgart" };
      const key = cache.create(testData, "custom-key");

      expect(key).toBe("custom-key");
      expect(cache.get("custom-key")).toEqual(testData);
    });

    test("creates with auto-generated timestamp key when no key provided", () => {
      const testData = { auto: "generated" };
      const key = cache.create(testData);

      expect(key).toBeTruthy();
      expect(cache.get(key)).toEqual(testData);
      expect(cache.keys).toContain(key);
    });

    test("updates existing data with merge behavior", () => {
      cache.create({ name: "wolfgang", age: 30 }, "user-1");

      const result = cache.update("user-1", { age: 31, city: "stuttgart" });

      expect(result.key).toBe("user-1");
      expect(result.data).toEqual({
        name: "wolfgang",
        age: 31,
        city: "stuttgart",
      });
      expect(cache.get("user-1")).toEqual(result.data);
    });

    test("removes data completely", () => {
      cache.create({ temp: "data" }, "removeme");
      expect(cache.keys).toContain("removeme");

      cache.remove("removeme");

      expect(cache.keys).not.toContain("removeme");
      expect(() => cache.get("removeme")).toThrow("Key not found");
    });
  });

  describe("Error handling", () => {
    test("throws on duplicate key creation without override", () => {
      cache.create({ data: "first" }, "duplicate");

      expect(() => cache.create({ data: "second" }, "duplicate")).toThrow(
        "Key already in use",
      );
    });

    test("throws on accessing non-existent keys", () => {
      expect(() => cache.get("ghost")).toThrow("Key not found");
      expect(() => cache.update("ghost", {})).toThrow("Key not found");
      expect(() => cache.remove("ghost")).toThrow("Key not found");
    });
  });

  describe("Override functionality", () => {
    test("merges data when override is enabled", () => {
      const overrideCache = new Cache({ override: true });

      overrideCache.create({ name: "original", type: "test" }, "merge-test");
      overrideCache.create({ age: 25, city: "berlin" }, "merge-test");

      expect(overrideCache.get("merge-test")).toEqual({
        name: "original",
        type: "test",
        age: 25,
        city: "berlin",
      });
    });

    test("warns when overriding with override and debug enabled", () => {
      const overrideCache = new Cache({ override: true, debug: true });

      overrideCache.create({ original: true }, "warn-test");
      overrideCache.create({ updated: true }, "warn-test");

      expect(console.log).toHaveBeenCalledWith(
        "[Cache] Key warn-test already exists, overriding.",
      );
    });
  });

  describe("Collection operations", () => {
    test("provides keys and values collections", () => {
      cache.create({ value: 1 }, "key1");
      cache.create({ value: 2 }, "key2");
      cache.create({ value: 3 }, "key3");

      expect(cache.keys).toEqual(["key1", "key2", "key3"]);
      expect(cache.values).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });

    test("clears all data", () => {
      cache.create({ temp: 1 }, "temp1");
      cache.create({ temp: 2 }, "temp2");
      expect(cache.keys).toHaveLength(2);

      cache.clear();

      expect(cache.keys).toHaveLength(0);
      expect(cache.values).toHaveLength(0);
    });
  });

  describe("Debug logging", () => {
    test("logs when debug mode is enabled", () => {
      const debugCache = new Cache({ debug: true });

      debugCache.create({ test: "data" }, "debug-test");

      expect(console.log).toHaveBeenCalledWith(
        "[Cache] Creating key: debug-test",
      );
    });

    test("does not log when debug mode is disabled", () => {
      cache.create({ test: "data" }, "silent-test");

      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
