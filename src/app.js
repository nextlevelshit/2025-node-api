import express from "express";
import { createApiRoutes } from "./routes/api.js";
import { Html } from "./services/Html.js";

/**
 * Creates an Express application with API routes and static HTML serving.
 * @param cache - An instance of the Cache service for managing data
 * @param options - {{port: string}} Optional configuration options for the app
 * @returns {Express}
 */
export function createApp(cache, options) {
  const app = express();

  // Enable cors
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  // Enable JSON parsing for incoming requests
  app.use(express.json());
  // Add routes for API endpoints
  app.use("/api", createApiRoutes(cache));
  // Static HTML route
  app.get("/", (req, res) => {
    const html = new Html({ debug: process.env.NODE_ENV === "development" });

    try {
      const content = html.render("../../index.html", {
        PORT: options.port,
      });
      res.send(content);
    } catch (error) {
      console.error("Template rendering failed:", error.message);
      res.status(500).send("Internal Server Error");
    }
  });

  return app;
}
