import express from "express";
import {port} from "./src/config/constants.js"
import {Cache} from "./src/services/Cache.js"

const app = express();
const cache = new Cache();

app.use(express.json());

app.get("/api/:key", async (req, res) => {
    try {
        const key = req.params.key;

        const data = cache.get(key);

        res.json(data);
    } catch (e) {
        console.error(e);

        res.sendStatus(500);
    }
});

app.post("/api", async (req, res) => {
    try {
        const body = req.body;

        cache.create(body);

        res.sendStatus(201);
    } catch (e) {
        res.sendStatus(500);
    }
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