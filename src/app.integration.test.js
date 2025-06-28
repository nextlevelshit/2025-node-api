import { describe, test, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { Cache } from "./services/Cache.js";
import { createApp } from "./app.js";

describe("App Integration Tests", () => {
  let app;
  let cache;

  beforeEach(() => {
    cache = new Cache({ debug: false });
    app = createApp(cache, { port: 1312 });
    // Silence console for cleaner test output
    console.table = vi.fn();
    console.debug = vi.fn();
    console.warn = vi.fn();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe("Complete API workflows", () => {
    test("full CRUD lifecycle with real cache", async () => {
      // Create
      const createResponse = await request(app)
        .post("/api")
        .send({
          name: "integration-test",
          status: "active",
          metadata: { created: "2025-06-28" },
        });

      expect(createResponse.status).toBe(201);
      const { key } = createResponse.body;
      expect(key).toBeTruthy();

      // Verify it's actually in the cache
      expect(cache.keys).toContain(key);

      // Read
      const getResponse = await request(app).get(`/api/${key}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toEqual({
        name: "integration-test",
        status: "active",
        metadata: { created: "2025-06-28" },
      });

      // Update
      const updateResponse = await request(app)
        .put(`/api/${key}`)
        .send({
          status: "updated",
          metadata: { updated: "2025-06-28" },
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data).toEqual({
        name: "integration-test",
        status: "updated",
        metadata: { updated: "2025-06-28" },
      });

      // Verify update persisted
      const getUpdatedResponse = await request(app).get(`/api/${key}`);
      expect(getUpdatedResponse.body.status).toBe("updated");

      // Delete
      const deleteResponse = await request(app).delete(`/api/${key}`);
      expect(deleteResponse.status).toBe(204);

      // Verify deletion
      expect(cache.keys).not.toContain(key);
      const getAfterDelete = await request(app).get(`/api/${key}`);
      expect(getAfterDelete.status).toBe(404);
    });

    test("handles concurrent operations correctly", async () => {
      const concurrentRequests = 3;
      const operations = Array.from({ length: concurrentRequests }, (_, i) =>
        request(app)
          .post("/api")
          .send({
            id: i,
            data: `concurrent-test-${i}`,
            timestamp: Date.now(),
          }),
      );

      const responses = await Promise.all(operations);

      // All should succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.key).toBeTruthy();
      });

      // Verify all entries exist
      const keysResponse = await request(app).get("/api");
      expect(keysResponse.body.keys).toHaveLength(concurrentRequests);

      // Verify each entry is retrievable
      const retrievalPromises = responses.map((response) =>
        request(app).get(`/api/${response.body.key}`),
      );

      const retrievals = await Promise.all(retrievalPromises);
      retrievals.forEach((retrieval, index) => {
        expect(retrieval.status).toBe(200);
        expect(retrieval.body.id).toBe(index);
      });
    });
  });

  describe("Static content serving", () => {
    test("serves HTML frontend", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/text\/html/);
      expect(response.text).toContain("1312"); // Port replacement worked
    });
  });

  describe("Edge cases and error scenarios", () => {
    test("handles malformed JSON in POST", async () => {
      const response = await request(app)
        .post("/api")
        .send("{ invalid json")
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
    });

    test("PUT creates new resource when key doesn't exist", async () => {
      const response = await request(app)
        .put("/api/brand-new-key")
        .send({ created: "via-put" });

      expect(response.status).toBe(201);
      expect(response.body.key).toBe("brand-new-key");

      // Verify it's actually there
      const getResponse = await request(app).get("/api/brand-new-key");
      expect(getResponse.body.created).toBe("via-put");
    });

    test("handles empty request bodies gracefully", async () => {
      const response = await request(app).post("/api").send({});

      expect(response.status).toBe(201);
      expect(response.body.key).toBeTruthy();
    });
  });
});
