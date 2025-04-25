import express from "express";
import {port} from "./src/config/constants.js"

const app = express();

app.use(express.json());

app.get("/api", async (req, res) => {
    res.json({message: "test"});
});

app.post("/api", async (req, res) => {
    try {
        const body = req.body;

        console.log(body);

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