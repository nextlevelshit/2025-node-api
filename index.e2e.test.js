import { beforeAll, afterAll, describe, test, expect } from "vitest";
import { createServer } from "node:http";
import { Cache } from "./src/services/Cache.js";
import { createApp } from "./src/app.js";

const TEST_PORT = 1313;
const baseUrl = `http://localhost:${TEST_PORT}`;

describe("E2E Tests - Real Server", () => {
  let server;
  let app;
  let cache;

  beforeAll(async () => {
    // Create app instance for testing
    cache = new Cache({ debug: false });
    app = createApp(cache, { port: TEST_PORT });

    // Start server
    server = createServer(app);

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Server startup timeout"));
      }, 10000);

      server.listen(TEST_PORT, (err) => {
        clearTimeout(timeout);
        if (err) reject(err);
        else {
          console.log(`Test server running on ${TEST_PORT}`);
          resolve();
        }
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  describe("Real HTTP requests against running server", () => {
    test("complete user journey", async () => {
      // Create a resource
      const createResponse = await fetch(`${baseUrl}/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "e2e test data",
          timestamp: new Date().toISOString(),
          userAgent: "test-suite",
        }),
      });

      expect(createResponse.status).toBe(201);
      const { key } = await createResponse.json();

      // Retrieve it
      const getResponse = await fetch(`${baseUrl}/api/${key}`);
      expect(getResponse.status).toBe(200);

      const data = await getResponse.json();
      expect(data.message).toBe("e2e test data");
      expect(data.userAgent).toBe("test-suite");

      // Update it
      const updateResponse = await fetch(`${baseUrl}/api/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "updated via e2e",
          processed: true,
        }),
      });

      expect(updateResponse.status).toBe(200);
      const updateResult = await updateResponse.json();
      expect(updateResult.data.message).toBe("updated via e2e");
      expect(updateResult.data.processed).toBe(true);
      expect(updateResult.data.userAgent).toBe("test-suite");

      // Clean up
      const deleteResponse = await fetch(`${baseUrl}/api/${key}`, {
        method: "DELETE",
      });
      expect(deleteResponse.status).toBe(204);
    });

    test("serves static content", async () => {
      const response = await fetch(`${baseUrl}/`);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/text\/html/);

      const html = await response.text();
      expect(html).toContain("<!doctype html>");
      expect(html).toContain("1313");
    });

    test("handles load and maintains data consistency", async () => {
      // Create multiple resources rapidly
      const createPromises = Array.from({ length: 20 }, (_, i) =>
        fetch(`${baseUrl}/api`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loadTest: true,
            index: i,
            timestamp: Date.now(),
          }),
        }),
      );

      const createResponses = await Promise.all(createPromises);

      // All should succeed
      for (const response of createResponses) {
        expect(response.status).toBe(201);
      }

      // Get all keys
      const keysResponse = await fetch(`${baseUrl}/api`);
      const { keys } = await keysResponse.json();

      expect(keys.length).toBeGreaterThanOrEqual(20);

      // Verify data integrity by retrieving each
      const retrievalPromises = keys
        .slice(0, 10)
        .map((key) => fetch(`${baseUrl}/api/${key}`));

      const retrievals = await Promise.all(retrievalPromises);

      for (const retrieval of retrievals) {
        expect(retrieval.status).toBe(200);
        const data = await retrieval.json();
        expect(data).toBeDefined();
      }
    });
  });

  describe("Server behavior and error handling", () => {
    test("handles invalid routes gracefully", async () => {
      const response = await fetch(`${baseUrl}/nonexistent`);
      expect(response.status).toBe(404);
    });

    test("handles malformed requests", async () => {
      const response = await fetch(`${baseUrl}/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json }",
      });

      expect(response.status).toBe(400);
    });
  });
});
