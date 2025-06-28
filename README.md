# Node.js ExpressJS API (Caching Service) ⚡

A modern, minimal Node.js REST API built with ES modules, Express 5, and comprehensive testing via Vitest. Perfect for rapid prototyping and learning contemporary web development patterns.

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
- **Comprehensive testing** with unit, integration, and E2E coverage
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

## Development

### Quick Start

```bash
# Clone and install
npm install

# Development with hot reload
npm start

# Run all tests
npm test

# Test categories
npm run test.unit        # Unit tests only
npm run test.integration # Integration tests
npm run test.e2e        # End-to-end tests

# Test with coverage
npm run test.coverage

# Format code
npm run format
```

### Environment

The dev server runs on port `1312` (configurable via `PORT` env var). The cache service initializes empty on startup - perfect for development iteration.

### Testing Strategy

We've got three test layers:

1. **Unit tests** - Individual components in isolation
2. **Integration tests** - App + cache working together
3. **E2E tests** - Real HTTP requests against running server

All tests use Vitest for that sweet modern testing experience with ES modules support.

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

## Why This Stack?

- **ES Modules**: The future of JavaScript modularity
- **Express 5**: Latest stable with improved async support
- **Vitest**: Faster than Jest, built for ES modules
- **Minimal dependencies**: Less attack surface, easier auditing
- **Test-driven**: Comprehensive coverage from day one

## License

WTFPL - Do whatever you want with this code. It's 2025, information wants to be free.

---

_Built with ❤️ for the next generation of DHBW students_
