# Redis Rate Limiter

A rate-limiting system built using **Node.js, TypeScript, Express.js, and Redis** to control the number of requests a client can make within a given time period.

This project explores multiple rate-limiting algorithms and demonstrates how Redis can maintain shared request state across multiple Express server instances.

## Features

* Implemented three rate-limiting algorithms.
* Integrated Redis with Express middleware.
* Used Redis Sorted Sets for sliding-window request tracking.
* Used Redis Hashes and Lua scripts for Token Bucket state management and atomic operations.
* Returns HTTP `429 Too Many Requests` when the request limit is exceeded.
* Includes rate-limit response headers and `Retry-After` information.
* Tested distributed rate limiting using two Express servers sharing the same Redis instance.
* Tested request limits using Postman Collection Runner.

## Tech Stack

* **Runtime:** Node.js
* **Language:** TypeScript
* **Backend:** Express.js
* **Database / In-memory store:** Redis
* **Scripting:** Lua
* **Testing:** Postman

## Rate-Limiting Algorithms

### 1. Fixed Window Counter

Tracks the number of requests made by a client during a fixed time interval.

* Maintains a request counter for each client.
* Allows requests until the configured limit is reached.
* Resets the counter when the window expires.

**Limitation:** Requests near a window boundary can allow a burst of traffic across two consecutive windows.

### 2. Sliding Window Log

Uses a Redis Sorted Set to store request timestamps.

* Removes timestamps outside the configured time window.
* Counts requests that fall within the current window.
* Rejects new requests when the request limit is reached.

**Advantage:** Provides more precise rolling-window enforcement.

**Limitation:** Stores individual request timestamps, which can increase memory usage.

### 3. Token Bucket

Uses a Redis Hash to maintain the bucket's token count and last-refill timestamp.

* Tokens are replenished according to a configured refill rate.
* Each request consumes tokens.
* Requests are rejected when insufficient tokens are available.
* The bucket has a maximum capacity to control bursts.

A Lua script performs the token-bucket state update and request decision atomically in Redis, preventing concurrent requests from independently modifying the same bucket state.

## Distributed Rate Limiting

The project uses two Express server instances running on different ports and sharing the same Redis instance.

* Server 1: Port `5001`
* Server 2: Port `5002`
* Redis: Shared state store

Both servers use the same rate-limit key for the same client. Consequently, requests handled by either server consume tokens from the same bucket instead of maintaining separate per-server counters.

This demonstrates how Redis can coordinate rate limiting across multiple backend instances.

## API Endpoints

| Method | Endpoint | Description                                                    |
| ------ | -------- | -------------------------------------------------------------- |
| POST   | `/login` | Simulated login endpoint protected by rate-limiting middleware |
| GET    | `/check` | Checks Redis connectivity                                      |

The `/login` endpoint returns a successful response while requests are permitted. When the configured limit is exceeded, it returns HTTP `429 Too Many Requests`.

Example rate-limit headers:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
Retry-After: 1
```

The exact `Retry-After` value depends on the configured refill rate and the current bucket state.

## Getting Started

### Prerequisites

* Node.js and npm
* Redis server
* Git

### Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Install dependencies:

```bash
npm install
```

Configure the Redis connection URL and server port using the project's environment configuration.

Example:

```env
PORT=5001
REDIS_URL=redis://localhost:6379
```

Use the variable names expected by your actual code. Do not commit real credentials or secrets.

### Running the Servers

Start each server using the scripts configured in your `package.json`, or use the appropriate development command for each entry point.

Run both servers simultaneously to test shared rate-limit state.

## Testing

The rate limiter was tested using Postman Collection Runner and `curl`.

### Request-limit test

With a configured bucket capacity of five tokens and no meaningful refill between requests:

* First five requests: Allowed.
* Subsequent requests while the bucket remains empty: Rejected with HTTP `429`.

### Distributed test

Requests were alternated between ports `5001` and `5002`.

The first five requests were accepted, while the sixth request was rejected. The remaining-token header decreased across both servers, demonstrating that they were using shared Redis rate-limit state.

## Key Learnings

* How rate limiting protects backend APIs from excessive requests.
* Differences between Fixed Window, Sliding Window Log, and Token Bucket algorithms.
* Using Redis for shared, low-latency state.
* Executing atomic Redis operations with Lua scripts.
* Building Express middleware for request control.
* Understanding shared state across multiple server instances.
* Testing rate-limit behavior with Postman and `curl`.

## Future Improvements

* Add automated unit and integration tests.
* Test concurrent requests and additional edge cases.
* Improve handling of Redis connection failures.
* Add configurable limits for different endpoints and clients.
* Run multiple servers and Redis using Docker Compose.
* Improve monitoring and rate-limit metrics.

## Author

**Devansh Garg**
