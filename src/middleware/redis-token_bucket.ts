
import type { Request, Response, NextFunction } from "express";
import redis from "../config/redis.js";

const CAPACITY = 5;
const REFILL_RATE = 4; // tokens per second
const COST = 1;

const tokenBucketScript = `
local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "tokens", "lastRefillTime")

local tokens = tonumber(data[1])
local lastRefillTime = tonumber(data[2])

-- Initialize a new bucket
if tokens == nil or lastRefillTime == nil then
    tokens = capacity
    lastRefillTime = now
end

-- Refill tokens according to elapsed time
local elapsed = math.max(0, (now - lastRefillTime) / 1000)
tokens = math.min(capacity, tokens + elapsed * refillRate)

-- Update timestamp
lastRefillTime = now

-- Check whether request is allowed
local allowed = 0

if tokens >= cost then
    tokens = tokens - cost
    allowed = 1
end

-- Save updated bucket state
redis.call(
    "HSET", key,
    "tokens", tokens,
    "lastRefillTime", lastRefillTime
)

-- Expire inactive bucket after one minute
redis.call("EXPIRE", key, 60)

return { allowed, tokens}
`;

export async function tokenBucket(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const ip = req.ip ?? "unknown";
        const key = `rate_limit:token_bucket:${ip}`;
        const now = Date.now();

        const result = (await redis.eval(
            tokenBucketScript,
            1,
            key,
            CAPACITY,
            REFILL_RATE,
            COST,
            now
        )) as [number, number];
        const [allowed, remainingTokens] = result;

        res.setHeader("X-RateLimit-Limit", String(CAPACITY));
        res.setHeader(
            "X-RateLimit-Remaining",
            String(Math.floor(remainingTokens))
        );
        console.log("allowed:", allowed);
console.log("remainingTokens:", remainingTokens);
console.log("COST:", COST);
console.log("REFILL_RATE:", REFILL_RATE);

            const retry_after=Math.ceil(
    (COST - remainingTokens) / REFILL_RATE
);
        if (allowed === 0) {
            res.setHeader("Retry-After", String(Math.ceil(retry_after)));

            res.status(429).json({
                message: "Too many requests",
                retry_after: retry_after
            });
            return;
        }

        next();
    } catch (error) {
        console.error("Token bucket error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
        return;
    }
}