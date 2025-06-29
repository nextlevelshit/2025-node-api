import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

/**
 * HTML Template Service
 * Simple template rendering with {{key}} placeholder replacement.
 */
export class Html {
  /**
   * @param {Object} options - Configuration options
   * @param {boolean} options.debug - Enable debug logging (default: false)
   * @param {string} options.basePath - Base path for template files (default: current directory)
   */
  constructor(options = { debug: false, basePath: null }) {
    this.options = options;
    this.basePath = options.basePath || dirname(fileURLToPath(import.meta.url));
  }

  /**
   * Render a template with replacements
   * @param {string} templatePath - Path to template file (Note: relative to basePath or absolute to current directory)
   * @param {Object} replacements - Key-value pairs for placeholder replacement
   * @returns {string} - Rendered HTML string
   */
  render(templatePath, replacements = {}) {
    if (!templatePath) {
      throw new Error("Template path is required");
    }

    const template = this.readFile(templatePath);
    return this.replace(template, replacements);
  }

  /**
   * Read template file from disk
   * @param {string} filePath - Path to template file
   * @returns {string} - Template content
   */
  readFile(filePath) {
    const fullPath = join(this.basePath, filePath);

    try {
      return readFileSync(fullPath, "utf8");
    } catch (error) {
      throw new Error(
        `Failed to read template file: ${filePath} - ${error.message}`,
      );
    }
  }

  /**
   * Replace placeholders in template with values
   * @param {string} template - Template string with {{key}} placeholders
   * @param {Object} replacements - Replacement values
   * @returns {string} - Processed template
   */
  replace(template, replacements) {
    if (!template) {
      throw new Error("Template content is required");
    }

    if (!replacements || typeof replacements !== "object") {
      throw new Error("Replacements must be an object");
    }

    return Object.entries(replacements).reduce((html, [key, value]) => {
      if (value === undefined || value === null) {
        this.log(
          `Warning: Replacing ${key} with empty string (value was ${value})`,
        );
        value = "";
      }

      // Convert non-string values to strings safely
      const stringValue =
        typeof value === "object" ? JSON.stringify(value) : String(value);

      const regex = new RegExp(`{{\\s*${this.escapeRegex(key)}\\s*}}`, "g");
      return html.replace(regex, stringValue);
    }, template);
  }

  /**
   * Escape special regex characters in replacement keys
   * @param {string} string - String to escape
   * @returns {string} - Escaped string
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Log debug messages
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.options.debug) {
      console.log(`[Html] ${message}`);
    }
  }
}
