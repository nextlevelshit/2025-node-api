import express from "express";
import {port} from "./src/config/constants.js"

const app = express();

app.listen(port, () => {
    console.log(`Server läuft auf ${port}`);
});