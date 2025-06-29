import { setInterval } from "node:timers/promises";
import { port } from "./src/config/constants.js";
import { Cache } from "./src/services/Cache.js";
import { createApp } from "./src/app.js";

const cache = new Cache();
const app = createApp(cache, { port });

const server = app.listen(port, () => {
  const stats = () =>
    console.debug({
      "Server URL": `http://localhost:${port}`,
      "API Endpoints": `http://localhost:${port}/api`,
      "Cache Size": cache.cache.size,
      "Cache Keys": cache.keys.join(),
      Operations: {
        "Clear Cache": `curl -X DELETE http://localhost:${port}/api`,
      },
    });

  setInterval(stats, 3_000);
});

process.on("SIGINT", () => {
  console.log(`Shutting down server running on ${port}`);
  server.close(() => {
    process.exit(0);
  });
});

// Export for testing
export { app, server, cache };
