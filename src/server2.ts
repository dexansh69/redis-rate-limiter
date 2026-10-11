import express from "express";
import {tokenBucket}  from "./middleware/redis-token_bucket.js";

const app = express();

app.use(express.json());


app.post("/login", tokenBucket, (_req, res) => {
    res.json({ message: "Login through server 2" });
});

app.listen(5002, () => {
    console.log("Server 2 running on port 5002");
});