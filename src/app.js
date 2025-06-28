import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { createApiRoutes } from "./routes/api.js";

export function createApp(cache, options = {}) {
  const app = express();

  app.use(express.json());
  app.use("/api", createApiRoutes(cache));

  // Static HTML route
  app.get("/", (req, res) => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const port = options.port;

    const htmlContent = readFileSync(
      join(__dirname, "../index.html"),
      "utf8",
    ).replace(/{{PORT}}/g, port);

    res.send(htmlContent);
  });

  return app;
}
