import { fileURLToPath } from "url";
import { dirname, relative } from "path";

// Get current working directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cwd = process.cwd();

/**
 * Trace the caller of this function and return the relative path and line number.
 * @returns {{relativePath: string, lineNumber: number}}
 */
export const getTrace = () => {
  // Use a custom Error to capture the stack trace
  const stack = new Error().stack;

  // Parse the stack trace string (more reliable than prepareStackTrace shenanigans)
  const stackLines = stack.split("\n");
  const callerLine = stackLines[2]; // [0] is "Error", [1] is trace(), [2] is actual caller

  // Extract file and line info with regex
  const match =
    callerLine.match(/at .* \((.+):(\d+):(\d+)\)/) ||
    callerLine.match(/at (.+):(\d+):(\d+)/);

  if (match) {
    const [, filepath, lineNumber] = match;
    const relativePath = relative(cwd, filepath.replace("file://", ""));
    return {
      relativePath,
      lineNumber: parseInt(lineNumber, 10),
    };
  } else {
    throw new Error(`Could not parse stack trace: ${callerLine}`);
  }
};
