import express from "express";
import type { Request, Response } from "express";
import redisClient from "./config/redis.js";
import dotenv from "dotenv";
import {tokenBucket}  from "./middleware/redis-token_bucket.js";
import rate_limit from "./middleware/redis-RL.js";

dotenv.config();

const app = express();
app.use(express.json());



app.get("/check", async (req: Request, res: Response) => {
    const check = await redisClient.ping();

    res.send({
        message: "Redis is working",
        ping: check
    });
});

app.use(tokenBucket); // 5 requests per minute

app.post("/login", async (req: Request, res: Response) => {
   
    res.json({
        user:"you are logged in"
    })
    
});

app.listen(process.env.PORT || 5001, () => {
    console.log(
        `Server is running on port ${process.env.PORT || 5001}`
    );
});