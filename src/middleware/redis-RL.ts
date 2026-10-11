
import type { Request, Response, NextFunction } from "express";
import type {Redis} from "ioredis";

export default function rate_limit(
    redisClient: Redis,
    limit: number,
    window: number
) {
    const script = `
        local count = redis.call("INCR", KEYS[1])

        if count == 1 then
            redis.call("EXPIRE", KEYS[1], ARGV[1])
        end

        return count
    `;

    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const ip = req.ip;

            if (!ip) {
                return res.status(400).json({
                    message: "Unable to identify IP address"
                });
            }

            const key = `rate-limit:${ip}`;

            const result = await redisClient.eval(
                script,
                1,
                key,
                window
            );

            const count = Number(result);
            const ttl = await redisClient.ttl(key);
            const remaining = Math.max(0, limit - count);

            res.setHeader("X-RateLimit-Limit", limit);
            res.setHeader("X-RateLimit-Remaining", remaining);
            res.setHeader("X-RateLimit-Reset", ttl);

            if (count > limit) {
                res.setHeader("Retry-After", ttl);

                return res.status(429).json({
                    message: "Too many requests",
                    retry_after: ttl
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}