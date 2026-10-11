import type { Request, Response, NextFunction } from "express";
import type {Redis} from "ioredis";
export default function rate_limit_sliding_window(
    redisClient: Redis,
    limit: number,
    window: number
) {
    const script=``


    
}