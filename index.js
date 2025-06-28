import { port } from "./src/config/constants.js";
import { Cache } from "./src/services/Cache.js";
import { createApp } from "./src/app.js";

const cache = new Cache();
const app = createApp(cache, { port });

const server = app.listen(port, () => {
  console.log(`Server läuft auf ${port}`);
});

process.on("SIGINT", () => {
  console.log(`Shutting down server running on ${port}`);
  server.close(() => {
    process.exit(0);
  });
});

// Export for testing
export { app, server, cache };
