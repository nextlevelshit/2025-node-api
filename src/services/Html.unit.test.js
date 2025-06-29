import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { Html } from "./Html.js";
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

describe("Html - Unit Tests", () => {
  let html;
  let testDir;

  beforeEach(() => {
    testDir = join(process.cwd(), "test-templates");
    mkdirSync(testDir, { recursive: true });

    html = new Html({
      debug: false,
      basePath: testDir,
    });

    // Mock console methods
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe("Core rendering functionality", () => {
    test("renders template with single replacement", () => {
      writeFileSync(join(testDir, "simple.html"), "Hello {{name}}!");

      const result = html.render("simple.html", { name: "Wolfgang" });

      expect(result).toBe("Hello Wolfgang!");
    });

    test("renders template with multiple replacements", () => {
      writeFileSync(
        join(testDir, "multi.html"),
        "Server running on port {{PORT}} in {{ENV}} mode",
      );

      const result = html.render("multi.html", {
        PORT: "1313",
        ENV: "development",
      });

      expect(result).toBe("Server running on port 1313 in development mode");
    });

    test("handles templates with no placeholders", () => {
      writeFileSync(join(testDir, "static.html"), "<h1>Static Content</h1>");

      const result = html.render("static.html", { unused: "value" });

      expect(result).toBe("<h1>Static Content</h1>");
    });

    test("handles whitespace in placeholders", () => {
      writeFileSync(
        join(testDir, "spaces.html"),
        "{{ name }} lives in {{ city }}",
      );

      const result = html.render("spaces.html", {
        name: "Wolfgang",
        city: "Stuttgart",
      });

      expect(result).toBe("Wolfgang lives in Stuttgart");
    });

    test("handles repeated placeholders", () => {
      writeFileSync(
        join(testDir, "repeated.html"),
        "{{name}} says hi, {{name}}!",
      );

      const result = html.render("repeated.html", { name: "Wolfgang" });

      expect(result).toBe("Wolfgang says hi, Wolfgang!");
    });
  });

  describe("Error handling", () => {
    test("throws on missing template file", () => {
      expect(() => html.render("nonexistent.html", {})).toThrow(
        "Failed to read template file",
      );
    });

    test("throws on empty template path", () => {
      expect(() => html.render("", {})).toThrow("Template path is required");

      expect(() => html.render(null, {})).toThrow("Template path is required");
    });

    test("throws on invalid replacements", () => {
      writeFileSync(join(testDir, "test.html"), "{{test}}");

      expect(() => html.render("test.html", null)).toThrow(
        "Replacements must be an object",
      );

      expect(() => html.render("test.html", "string")).toThrow(
        "Replacements must be an object",
      );
    });

    test("throws on empty template content", () => {
      expect(() => html.replace("", { test: "value" })).toThrow(
        "Template content is required",
      );
    });
  });

  describe("Edge cases and data types", () => {
    test("handles undefined and null values gracefully", () => {
      writeFileSync(
        join(testDir, "nulls.html"),
        "{{defined}} {{undefined}} {{null}}",
      );

      const result = html.render("nulls.html", {
        defined: "value",
        undefined: undefined,
        null: null,
      });

      expect(result).toBe("value  ");
    });

    test("converts objects to JSON strings", () => {
      writeFileSync(join(testDir, "object.html"), "Data: {{data}}");

      const result = html.render("object.html", {
        data: { key: "value", num: 42 },
      });

      expect(result).toBe('Data: {"key":"value","num":42}');
    });

    test("handles numbers and booleans", () => {
      writeFileSync(
        join(testDir, "types.html"),
        "Port: {{port}}, Debug: {{debug}}",
      );

      const result = html.render("types.html", {
        port: 1313,
        debug: true,
      });

      expect(result).toBe("Port: 1313, Debug: true");
    });

    test("handles special regex characters in keys", () => {
      writeFileSync(
        join(testDir, "regex.html"),
        "{{$special}} {{(parentheses)}} {{key.with.dots}}",
      );

      const result = html.render("regex.html", {
        $special: "works",
        "(parentheses)": "also works",
        "key.with.dots": "dots work too",
      });

      expect(result).toBe("works also works dots work too");
    });

    test("ignores missing replacement keys", () => {
      writeFileSync(
        join(testDir, "missing.html"),
        "{{exists}} {{missing}} {{alsoExists}}",
      );

      const result = html.render("missing.html", {
        exists: "here",
        alsoExists: "present",
      });

      expect(result).toBe("here {{missing}} present");
    });
  });

  describe("Debug logging", () => {
    test("logs warnings when debug enabled", () => {
      const debugHtml = new Html({ debug: true, basePath: testDir });
      writeFileSync(join(testDir, "debug.html"), "{{test}} {{undefined}}");

      debugHtml.render("debug.html", {
        test: "value",
        undefined: undefined,
      });

      expect(console.log).toHaveBeenCalledWith(
        "[Html] Warning: Replacing undefined with empty string (value was undefined)",
      );
    });

    test("does not log when debug disabled", () => {
      writeFileSync(join(testDir, "silent.html"), "{{test}} {{undefined}}");

      html.render("silent.html", {
        test: "value",
        undefined: undefined,
      });

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("Configuration options", () => {
    test("uses custom base path", () => {
      const customDir = join(process.cwd(), "custom-templates");
      mkdirSync(customDir, { recursive: true });

      const customHtml = new Html({ basePath: customDir });
      writeFileSync(join(customDir, "custom.html"), "Custom {{path}}");

      const result = customHtml.render("custom.html", { path: "template" });

      expect(result).toBe("Custom template");

      rmSync(customDir, { recursive: true, force: true });
    });
  });
});
