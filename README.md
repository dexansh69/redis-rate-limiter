# Redis Rate Limiter

A Redis-backed rate-limiting project built with Node.js, TypeScript, Express.js, and Redis. This project implements multiple rate-limiting algorithms and demonstrates distributed rate limiting using shared Redis state across multiple Express server instances.

**Repository:** [redis-rate-limiter](https://github.com/dexansh69/redis-rate-limiter)

## Tech Stack

* Node.js
* TypeScript
* Express.js
* Redis
* Lua scripting
* Postman

## Features

* Fixed Window Counter
* Sliding Window Log using Redis Sorted Sets
* Token Bucket using Redis Hashes and Lua
* Express rate-limiting middleware
* HTTP `429 Too Many Requests` responses
* `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers
* `Retry-After` calculation
* Shared rate limiting across two Express servers using Redis
* Request testing with Postman Collection Runner

## How It Works

The Express middleware checks each incoming request against the configured rate limit. Redis stores the bucket state, while a Lua script performs the Token Bucket state updates atomically.

When the request limit is exhausted, the API returns `429 Too Many Requests`.

## Distributed Rate Limiting

Two Express servers run on separate ports:

* Server 1: `localhost:5001`
* Server 2: `localhost:5002`

Both servers share the same Redis instance and rate-limit key for the same client. Requests sent to either server consume tokens from the shared bucket.

With a bucket capacity of five tokens and negligible refill between requests, the first five requests are allowed and the sixth is rejected.

## Testing

Tested using Postman Collection Runner and `curl`.

* Verified allowed and rejected requests.
* Verified rate-limit response headers.
* Alternated requests between both server instances.
* Confirmed that both servers share the same Redis rate-limit state.

## Getting Started

### Prerequisites

* Node.js and npm
* Redis running locally or at a reachable Redis URL

### Clone the repository

```bash
git clone https://github.com/dexansh69/redis-rate-limiter.git
cd redis-rate-limiter
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root and configure the Redis connection URL and any other variables required by the application.

Example:

```env
REDIS_URL=redis://localhost:6379
PORT=5001
```

Use the variable names and ports expected by your actual code.

### Run the application

Start each server using the development scripts or commands configured in `package.json`. Run both servers simultaneously to test distributed rate limiting.

## Key Learnings

* Implementing different rate-limiting algorithms.
* Managing shared state with Redis.
* Using Redis Lua scripts for atomic operations.
* Integrating rate limiting into Express middleware.
* Understanding distributed rate limiting across multiple servers.
* Testing API behavior using Postman and `curl`.

## Future Improvements

* Add automated unit and integration tests.
* Improve Redis failure handling.
* Test concurrent requests and edge cases.
* Containerize the application and Redis using Docker Compose.
* Add monitoring and configurable per-route limits.

## Author

**Devansh Garg**

GitHub: [@dexansh69](https://github.com/dexansh69)
