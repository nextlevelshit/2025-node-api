import { Router } from "express";
import { Cache } from "../services/Cache.js";

/**
 * Creates API routes for managing cache entries.
 * @param cache {Cache} - An instance of the Cache service
 * @returns {typeof Router}
 */
export function createApiRoutes(cache) {
  const router = Router();

  router.get("/", (req, res) => {
    try {
      const keys = cache.keys;
      res.json({ keys });
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });

  router.get("/:key", (req, res) => {
    try {
      const key = req.params.key;
      const data = cache.get(key);
      res.json(data);
    } catch (e) {
      console.error(e);
      res.sendStatus(404);
    }
  });

  router.post("/", (req, res) => {
    try {
      const data = req.body;
      const key = cache.create(data);
      res.status(201).json({ key });
    } catch (e) {
      res.sendStatus(500);
    }
  });

  router.put("/:key", (req, res) => {
    try {
      const key = req.params.key;
      const data = req.body;

      if (cache.cache.has(key)) {
        const updatedData = cache.update(key, data);
        res.json(updatedData);
      } else {
        const createdData = cache.create(data, key);
        res.status(201).json({ key: createdData });
      }
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });

  router.delete("/:key", (req, res) => {
    try {
      cache.remove(req.params.key);
      res.sendStatus(204);
    } catch (e) {
      res.status(404).json({ error: "Key not found" });
    }
  });

  router.delete("/", (req, res) => {
    try {
      cache.clear();
      res.sendStatus(204);
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });

  return router;
}
