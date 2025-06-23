import request from "supertest";
import { jest } from "@jest/globals";

// Mock the dependencies
jest.mock("./src/config/constants.js", () => ({
  port: 3000,
}));

// Mock the Cache class
jest.mock("./src/services/Cache.js", () => {
  return {
    Cache: jest.fn().mockImplementation(() => {
      return {
        get: jest.fn(),
        create: jest.fn(),
      };
    }),
  };
});

// Import after the mocks are set up
import { Cache } from "./src/services/Cache.js";

describe("Express API Server", () => {
  let app;
  let mockCache;
  let server;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset modules to get a fresh instance with fresh mocks
    jest.resetModules();

    // Re-import the app with fresh mocks
    const indexModule = require("./index.js");
    app = indexModule.app; // This assumes you export 'app' in index.js
    server = indexModule.server;

    // Get the mock instance of Cache that was created in index.js
    mockCache = Cache.mock.results[0].value;

    // Mock console methods to reduce test noise
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Close the server after each test
    if (server) {
      server.close();
    }
  });

  describe("GET /api/:key", () => {
    test("should return data for a valid key", async () => {
      const mockData = { name: "test data" };
      mockCache.get.mockReturnValue(mockData);

      const response = await request(app).get("/api/123456789");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(mockCache.get).toHaveBeenCalledWith("123456789");
    });

    test("should return 500 if key is not found", async () => {
      mockCache.get.mockImplementation(() => {
        throw new Error("Key not found");
      });

      const response = await request(app).get("/api/nonexistent");

      expect(response.status).toBe(500);
      expect(mockCache.get).toHaveBeenCalledWith("nonexistent");
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("POST /api", () => {
    test("should create a new cache entry", async () => {
      const testData = { name: "new data" };

      const response = await request(app)
        .post("/api")
        .send(testData)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(mockCache.create).toHaveBeenCalledWith(testData);
    });

    test("should return 500 if creation fails", async () => {
      const testData = { name: "new data" };

      mockCache.create.mockImplementation(() => {
        throw new Error("Creation failed");
      });

      const response = await request(app)
        .post("/api")
        .send(testData)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(500);
      expect(mockCache.create).toHaveBeenCalledWith(testData);
    });
  });

  describe("Server shutdown", () => {
    test("should handle SIGINT signal", () => {
      // Mock process.exit to prevent actual exit
      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

      // Mock server.close to call the callback immediately
      server.close = jest.fn((callback) => callback());

      // Simulate SIGINT event
      process.emit("SIGINT");

      expect(server.close).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);

      // Restore the mocked function
      mockExit.mockRestore();
    });
  });
});
