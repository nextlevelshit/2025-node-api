# Node.js ExpressJS API (Caching Service) ⚡

A modern, minimal Node.js REST API built with ES modules, Express 5, and comprehensive testing via Vitest. Perfect for teaching contemporary web development patterns and testing strategies.

## TL;DR

```bash
npm install
npm start
# API running on http://localhost:1312
```

## What's Inside

This isn't your typical Express boilerplate. We're running:

- **Express 5.x** with ES modules (no more `require()` nonsense)
- **In-memory cache service** for blazing-fast data operations
- **Three-tier testing strategy** with unit, integration, and E2E coverage
- **Zero dependencies** for core functionality (Express + testing tools only)
- **Modern JavaScript** patterns throughout
- **Proper error handling** and HTTP status codes

## Architecture

```
src/
├── app.js                # Express app factory
├── routes/
│   └── api.js            # RESTful API endpoints
└── services/
    └── Cache.js          # In-memory key-value store
```

The cache service handles all CRUD operations with optional debug logging and override capabilities. API routes provide a clean REST interface over HTTP.

## API Reference

### Core Endpoints

```http
GET    /api           # List all keys
GET    /api/:key      # Retrieve data by key
POST   /api           # Create new entry (auto-generated key)
PUT    /api/:key      # Update existing or create new
DELETE /api/:key      # Remove entry
DELETE /api           # Clear all entries
```

### Examples

**Create data:**

```bash
curl -X POST http://localhost:1312/api \
  -H "Content-Type: application/json" \
  -d '{"name":"Wolfgang","city":"Stuttgart"}'
# Returns: {"key":"1735401234567"}
```

**Retrieve data:**

```bash
curl http://localhost:1312/api/1735401234567
# Returns: {"name":"Wolfgang","city":"Stuttgart"}
```

**Update data (merge behavior):**

```bash
curl -X PUT http://localhost:1312/api/1735401234567 \
  -H "Content-Type: application/json" \
  -d '{"age":25}'
# Returns: {"key":"1735401234567","data":{"name":"Wolfgang","city":"Stuttgart","age":25}}
```

## Testing Strategy: The Three Pillars 🏛️

This project implements a comprehensive three-tier testing approach that every modern developer should understand. Each tier serves a specific purpose and tests different aspects of your application.

### Unit Tests: Testing in Isolation 🔬

**What they test:** Individual functions and classes in complete isolation
**Why they matter:** Fast, reliable, and help you catch bugs early
**When to write them:** For every public method and edge case

```javascript
// From Cache.unit.test.js
test("creates and retrieves data with custom key", () => {
  const testData = { user: "wolfgang", city: "stuttgart" };
  const key = cache.create(testData, "custom-key");

  expect(key).toBe("custom-key");
  expect(cache.get("custom-key")).toEqual(testData);
});
```

**Key characteristics:**

- No external dependencies (database, network, filesystem)
- Use mocks/stubs for dependencies
- Run in milliseconds
- Test one thing at a time

Our unit tests cover:

- Cache CRUD operations with various data types
- Error handling for edge cases (missing keys, duplicates)
- Override functionality and merge behavior
- Debug logging capabilities

### Integration Tests: Testing Component Interactions 🔗

**What they test:** How different parts of your system work together
**Why they matter:** Catch issues that only appear when components interact
**When to write them:** For critical workflows and data flow

```javascript
// From app.integration.test.js
test("full CRUD lifecycle with real cache", async () => {
  // Create
  const createResponse = await request(app)
    .post("/api")
    .send({ name: "integration-test", status: "active" });

  expect(createResponse.status).toBe(201);
  const { key } = createResponse.body;

  // Verify it's actually in the cache
  expect(cache.keys).toContain(key);

  // Read, Update, Delete...
});
```

**Key characteristics:**

- Real components talking to each other
- Real cache instance, real Express app
- No external services (still no database/network)
- Test complete user workflows

Our integration tests verify:

- Full CRUD lifecycle through HTTP endpoints
- Cache and API routes working together
- Concurrent operations and data consistency
- Error scenarios with real component interactions

### E2E Tests: Testing the Full Stack 🌐

**What they test:** Your entire application as a user would experience it
**Why they matter:** Ensure everything works in a production-like environment
**When to write them:** For critical user journeys and deployment confidence

```javascript
// From index.e2e.test.js
test("complete user journey", async () => {
  // Real HTTP request to actual running server
  const createResponse = await fetch(`${baseUrl}/api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "e2e test data",
      timestamp: new Date().toISOString(),
    }),
  });

  expect(createResponse.status).toBe(201);
  // Continue with real HTTP calls...
});
```

**Key characteristics:**

- Real server running on actual port
- Real HTTP requests using `fetch()`
- Tests the entire stack from network to storage
- Simulates actual user interactions

Our E2E tests validate:

- Server startup and shutdown procedures
- Real HTTP requests and responses
- Load handling and data consistency under stress
- Static content serving and error handling

## Test Execution & Development Workflow

```bash
# Development with hot reload
npm start

# Run all tests (recommended for CI/CD)
npm test

# Run specific test categories
npm run test.unit        # ~50ms - Run constantly during development
npm run test.integration # ~200ms - Run before commits
npm run test.e2e         # ~1000ms - Run before deploymentsf

# Test with coverage report
npm run test.coverage

# Format code
npm run format
```

### When to Run What Tests

**During development:** Unit tests only (fast feedback loop)

```bash
npm run test.unit -- --watch
```

**Before git commit:** Unit + Integration tests

```bash
npm run test.unit && npm run test.integration
```

**Before deployment:** All tests

```bash
npm test
```

## Test Doubles & Mocking Strategy

### Unit Test Mocks

```javascript
// From api.unit.test.js - Complete cache mock
mockCache = {
  keys: [],
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  cache: new Map(), // For the has() check in PUT route
};
```

### Integration Test Reality

```javascript
// From app.integration.test.js - Real instances
cache = new Cache({ debug: false });
app = createApp(cache, { port: 1312 });
```

### E2E Test Environment

```javascript
// From index.e2e.test.js - Real server
server = createServer(app);
server.listen(TEST_PORT, callback);
```

## Testing Best Practices Demonstrated

1. **Test Independence:** Each test can run in isolation
2. **Descriptive Names:** Tests read like specifications
3. **Arrange-Act-Assert:** Clear test structure
4. **Error Testing:** Both happy path and edge cases
5. **Async Handling:** Proper `async/await` usage
6. **Resource Cleanup:** `beforeEach`/`afterAll` hooks
7. **Realistic Data:** Tests use domain-appropriate examples

## Development

### Quick Start

```bash
# Clone and install
npm install

# Development with hot reload
npm start

# Run tests in watch mode during development
npm run test.unit -- --watch
```

### Environment

The dev server runs on port `1312` (configurable via `PORT` env var). The cache service initializes empty on startup - perfect for development iteration.

## Cache Service Deep Dive

The `Cache` class is the heart of data persistence:

```javascript
import { Cache } from "./src/services/Cache.js";

const cache = new Cache({
  debug: true, // Enable console logging
  override: true, // Allow key overwrites with merge
});

// Basic operations
const key = cache.create({ user: "data" });
const data = cache.get(key);
cache.update(key, { more: "data" });
cache.remove(key);

// Collections
cache.keys; // All keys as array
cache.values; // All values as array
cache.clear(); // Nuclear option
```

## Production Considerations

This is a development/learning project. For production:

- Add persistent storage (Redis, PostgreSQL, etc.)
- Implement authentication/authorization
- Add rate limiting and request validation
- Set up proper logging (Winston, Pino)
- Add health checks and metrics
- Configure CORS appropriately
- Add database integration tests
- Set up CI/CD with all test tiers

## Why This Stack?

- **ES Modules**: The future of JavaScript modularity
- **Express 5**: Latest stable with improved async support
- **Vitest**: Faster than Jest, built for ES modules, superior DX
- **Minimal dependencies**: Less attack surface, easier auditing
- **Test-driven**: Comprehensive coverage from day one
- **Educational**: Clear separation of concerns for learning

## Testing Philosophy

> "Confidence comes from having the right tests, not the most tests."

This project demonstrates that **test quality > test quantity**. Each test tier serves a specific purpose:

- **Unit tests** give you confidence in your logic
- **Integration tests** give you confidence in your architecture
- **E2E tests** give you confidence in your user experience

The three-tier approach ensures you catch bugs at the right level - fixing a unit test is faster than debugging an E2E failure.

## License

WTFPL - Do whatever you want with this code. It's 2025, information wants to be free.

---

_Built with ❤️ for the next generation of DHBW students who will change the world_
