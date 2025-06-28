import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { port } from "./src/config/constants.js";
import { Cache } from "./src/services/Cache.js";

const cache = new Cache();

const app = express();
app.use(express.json());

app.get("/api", async (req, res) => {
  try {
    const keys = cache.keys;

    res.json({ keys });
  } catch (e) {
    console.error(e);

    res.sendStatus(500);
  }
});

app.get("/api/:key", async (req, res) => {
  try {
    const key = req.params.key;

    const data = cache.get(key);

    res.json(data);
  } catch (e) {
    console.error(e);

    res.sendStatus(404);
  }
});

app.post("/api", async (req, res) => {
  try {
    const data = req.body;

    const { key } = cache.create(data);

    res.status(201).json({ key });
  } catch (e) {
    res.sendStatus(500);
  }
});

app.put("/api/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const data = req.body;

    if (key) {
      const updatedData = cache.update(key, data);
      res.json(updatedData);
    } else {
      const createdDate = cache.create(data, key);
      res.status(201).json(createdDate);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const htmlContent = readFileSync(
    join(__dirname, "index.html"),
    "utf8",
  ).replace(/{{PORT}}/g, port);
  res.send(htmlContent);
});

const server = app.listen(port, () => {
  console.log(`Server läuft auf ${port}`);
});

process.on("SIGINT", () => {
  console.log(`Shutting down server running on ${port}`);

  server.close(() => {
    process.exit(0);
  });
});
