import { describe, test, expect, beforeEach, vi } from "vitest";
import { createApiRoutes } from "./api.js";
import express from "express";
import request from "supertest";

describe("API Routes - Unit Tests", () => {
  let app;
  let mockCache;

  beforeEach(() => {
    // Mock cache with all required methods
    mockCache = {
      keys: [],
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      cache: new Map(), // For the has() check in PUT route
    };

    // Create minimal app with just our routes
    app = express();
    app.use(express.json());
    app.use("/api", createApiRoutes(mockCache));

    // Silence console for tests
    console.error = vi.fn();
  });

  describe("GET /api", () => {
    test("returns all keys", async () => {
      mockCache.keys = ["key1", "key2", "key3"];

      const response = await request(app).get("/api");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ keys: ["key1", "key2", "key3"] });
    });

    test("handles cache errors gracefully", async () => {
      // Simulate cache throwing an error
      Object.defineProperty(mockCache, "keys", {
        get: () => {
          throw new Error("Cache failure");
        },
      });

      const response = await request(app).get("/api");

      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("GET /api/:key", () => {
    test("returns data for existing key", async () => {
      const testData = { name: "test", value: 42 };
      mockCache.get.mockReturnValue(testData);

      const response = await request(app).get("/api/testkey");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(testData);
      expect(mockCache.get).toHaveBeenCalledWith("testkey");
    });

    test("returns 404 for non-existent key", async () => {
      mockCache.get.mockImplementation(() => {
        throw new Error("Key not found");
      });

      const response = await request(app).get("/api/missing");

      expect(response.status).toBe(404);
      expect(mockCache.get).toHaveBeenCalledWith("missing");
    });
  });

  describe("POST /api", () => {
    test("creates new entry and returns key", async () => {
      const testData = { message: "hello world" };
      mockCache.create.mockReturnValue("generated-key");

      const response = await request(app).post("/api").send(testData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ key: "generated-key" });
      expect(mockCache.create).toHaveBeenCalledWith(testData);
    });

    test("handles creation errors", async () => {
      mockCache.create.mockImplementation(() => {
        throw new Error("Creation failed");
      });

      const response = await request(app).post("/api").send({ data: "test" });

      expect(response.status).toBe(500);
    });
  });

  describe("PUT /api/:key", () => {
    test("updates existing key", async () => {
      const updateData = { status: "updated" };
      const resultData = { key: "existing", data: updateData };

      mockCache.cache.set("existing", { original: "data" });
      mockCache.update.mockReturnValue(resultData);

      const response = await request(app).put("/api/existing").send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(resultData);
      expect(mockCache.update).toHaveBeenCalledWith("existing", updateData);
    });

    test("creates new key if it doesn't exist", async () => {
      const newData = { fresh: "data" };
      mockCache.create.mockReturnValue("new-key");

      const response = await request(app).put("/api/new-key").send(newData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ key: "new-key" });
      expect(mockCache.create).toHaveBeenCalledWith(newData, "new-key");
    });

    test("handles update errors", async () => {
      const updateData = { status: "updated" };

      mockCache.cache.set("existing", { original: "data" });
      mockCache.update.mockImplementation(() => {
        throw new Error("Update failed");
      });

      const response = await request(app).put("/api/existing").send(updateData);

      expect(response.status).toBe(500);
      expect(mockCache.update).toHaveBeenCalledWith("existing", updateData);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/:key", () => {
    test("removes existing key", async () => {
      const response = await request(app).delete("/api/deleteme");

      expect(response.status).toBe(204);
      expect(mockCache.remove).toHaveBeenCalledWith("deleteme");
    });

    test("returns 404 for non-existent key", async () => {
      mockCache.remove.mockImplementation(() => {
        throw new Error("Key not found");
      });

      const response = await request(app).delete("/api/missing");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Key not found" });
    });
  });

  describe("/api DELETE", () => {
    test("clears all cache entries", async () => {
      const response = await request(app).delete("/api");

      expect(response.status).toBe(204);
      expect(mockCache.clear).toHaveBeenCalled();
    });

    test("handles clear errors", async () => {
      mockCache.clear.mockImplementation(() => {
        throw new Error("Clear failed");
      });

      const response = await request(app).delete("/api");

      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
