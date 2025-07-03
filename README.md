# Node.js ExpressJS API (Caching Service)

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
- **Four-tier testing strategy** with static analysis, unit, integration, and E2E coverage
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

## Testing Strategy: The Four Pillars 🏛️

This project implements a comprehensive four-tier testing approach. Each tier serves a specific purpose and tests different aspects of your application with increasing realism but decreasing speed.

### 1. Static Analysis: Code Quality Checks 🔍

**What it tests:** Syntax errors and code quality issues without execution  
**Tool:** ESLint  
**Speed:** ⚡ ~10ms  
**When to run:** Before every commit

```bash
npm run lint
```

**Key characteristics:**

- Catches syntax errors, unused variables, undefined references
- Zero runtime overhead
- First line of defense against bugs

### 2. Unit Tests: Testing in Isolation 🔬

**What they test:** Individual functions and classes with all dependencies mocked  
**Tool:** Vitest with mocks  
**Speed:** ⚡ ~50ms  
**When to run:** Constantly during development

```javascript
// From Cache.unit.test.js
test("creates and retrieves data with custom key", () => {
  const cache = new Cache();
  const testData = { user: "wolfgang", city: "stuttgart" };
  const key = cache.create(testData, "custom-key");

  expect(key).toBe("custom-key");
  expect(cache.get("custom-key")).toEqual(testData);
});
```

**Key characteristics:**

- **Complete isolation** - every dependency is mocked
- **Deterministic** - same input always produces same output
- **Fast** - no I/O, no network, no filesystem
- **Focused** - test one function at a time

### 3. Integration Tests: Component Interaction Testing 🔗

**What they test:** How your components work together, but still in-process  
**Tool:** Vitest + Supertest (no real server)  
**Speed:** 🟡 ~200ms  
**When to run:** Before commits

```javascript
// From app.integration.test.js
import request from "supertest"; // ← Key difference: supertest, not fetch
import { createApp } from "./app.js";

test("full CRUD lifecycle with real cache", async () => {
  // supertest creates a test server internally - no real HTTP
  const createResponse = await request(app) // ← In-process request
    .post("/api")
    .send({ name: "integration-test", status: "active" });

  expect(createResponse.status).toBe(201);
  const { key } = createResponse.body;

  // Verify it's actually in the cache (real cache instance)
  expect(cache.keys).toContain(key);
});
```

**Key characteristics:**

- **Real components** - actual Cache and Express app instances
- **Supertest magic** - simulates HTTP without actual server startup
- **In-process** - everything runs in the same Node.js process
- **No network** - no real TCP connections or ports

**Further links:**

- [Unit Testing vs Integration Testing - Key Differences](https://www.alexhyett.com/unit-testing-vs-integration-testing/#:~:text=Do%20integration%20tests%20use%20mocks,running%20just%20before%20a%20release.)

### 4. E2E Tests: Full Stack Reality 🌐

**What they test:** Your entire application exactly as users experience it  
**Tool:** Vitest + real fetch() + real server  
**Speed:** 🔴 ~1000ms  
**When to run:** Before deployments

```javascript
// From index.e2e.test.js
beforeAll(async () => {
  // Start actual server on real port
  server = createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
});

test("complete user journey", async () => {
  // Real HTTP request over TCP to actual running server
  const createResponse = await fetch(`${baseUrl}/api`, {
    // ← Real fetch, not supertest
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "e2e test data",
      timestamp: new Date().toISOString(),
    }),
  });

  expect(createResponse.status).toBe(201);
});
```

**Key characteristics:**

- **Real server** - actual HTTP server listening on TCP port
- **Real network** - genuine HTTP requests over localhost
- **Real environment** - tests server startup, CORS, middleware stack
- **User perspective** - exactly what your users experience

## The Critical Differences Explained

| Test Type       | Import Pattern                     | Request Method              | Server Status | Speed     | What's Real             |
| --------------- | ---------------------------------- | --------------------------- | ------------- | --------- | ----------------------- |
| **Unit**        | `import { Cache }`                 | Direct method calls         | No server     | ⚡ 10ms   | Nothing - all mocked    |
| **Integration** | `import request from "supertest"`  | `request(app).get()`        | Simulated     | 🟡 100ms  | Components, not network |
| **E2E**         | `beforeAll(() => server.listen())` | `fetch("http://localhost")` | Real server   | 🔴 1000ms | Everything              |

### Why This Matters

**Integration tests catch:** "My cache works, my routes work, but they don't work _together_"

```javascript
// Integration - tests that cache + routes integrate properly
const response = await request(app).post("/api").send(data);
expect(cache.keys).toContain(response.body.key); // Direct cache access
```

**E2E tests catch:** "Everything works in isolation, but fails when deployed"

```javascript
// E2E - tests the complete network stack
const response = await fetch(`http://localhost:${port}/api`, { ... });
// No direct cache access - testing through the network boundary
```

## Test Execution & Development Workflow

```bash
# Development with hot reload
npm start

# Run specific test tiers (in order of feedback speed)
npm run test.unit        # 50ms - Run constantly
npm run test.integration # 200ms - Run before commits
npm run test.e2e         # 1000ms - Run before deployments

# Run all tests
npm test

# Coverage report
npm run test.coverage
```

### The Testing Pyramid in Action

```
    E2E (Few, Slow, High Confidence)
      /\
     /  \
    /    \   Integration (Some, Medium, Component Confidence)
   /      \
  /        \
 /__________\ Unit (Many, Fast, Logic Confidence)
```

**Development workflow:**

1. **Write unit tests first** - fast feedback on logic
2. **Add integration tests** - verify components play nice
3. **Minimal E2E tests** - critical user journeys only

## Test Environment Setup

### Unit Tests

```javascript
// All dependencies mocked
const mockCache = {
  get: vi.fn(),
  create: vi.fn(),
  // ... complete mock interface
};
```

### Integration Tests

```javascript
// Real instances, no mocks
cache = new Cache({ debug: false });
app = createApp(cache, { port: 1312 });
// supertest handles the HTTP simulation
```

### E2E Tests

```javascript
// Real server lifecycle
beforeAll(async () => {
  server = createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});
```

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

> "The right test at the right level catches bugs at the right time."

This project demonstrates that **test architecture > test coverage**. Each tier serves a specific purpose:

- **Static analysis** → Catch syntax errors before runtime
- **Unit tests** → Fast feedback on logic errors
- **Integration tests** → Component interaction verification
- **E2E tests** → User experience validation

The four-tier approach ensures you catch bugs at the optimal level - fixing a unit test takes seconds, debugging an E2E failure takes minutes.
