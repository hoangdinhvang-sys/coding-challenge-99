# Scoreboard Architecture Specification

## 1. Introduction
------------------------------------------------------------------------------------------------------------------------------

This document specifies the **Live Scoreboard Module** of the backend API service.
The module is responsible for:

- Processing score updates when a user successfully completes an action.   
- Maintaining a Top 10 leaderboard of users with the highest scores.
- Providing live updates of the leaderboard to all connected clients.
- Preventing unauthorized score manipulation and enforcing security constraints.

The specification is intended for the backend engineering team to implement the module in an existing API service.

## 2. Requirements
------------------------------------------------------------------------------------------------------------------------------

### Functional requirements

**Score update trigger**
  - A user performs a task on our app.
  - On successful completion of the task, the client calls the backend API to increase that user’s score.

**Score persistence**
  - The backend validates the request, computes the new score, and stores it in the database.
  - The module maintains a **Top 10 leaderboard** based on total score.

**Live leaderboard**
  - Connected clients see near real-time updates when:
    - The user’s own score changes.
    - The Top 10 leaderboard changes (membership or ordering).

**Security**
  - Only authenticated and authorized users can increase their own scores.
  - The client cannot arbitrarily set scores; it can only request a **“score increment for a valid action”**.
  - The backend verifies that the action is legitimate (e.g. via signed tokens or server-side validation).

### Non-functional requirements

- **Performance**: latency for score update and leaderboard fetch < 100 ms (excluding network).
- **Scalability**: Must handle high-frequency score updates and large user base.
- **Consistency**: Leaderboard is **eventually consistent**; small delays in live updates are acceptable.
- **Availability**: System available 24/7; a brief leaderboard staleness is preferable to downtime.
- **Observability**: All score changes are logged and metrics are emitted for monitoring.
- **Security**: No user should be able to inflate scores without proper authorization and validation.


## 3. High-Level Architecture
------------------------------------------------------------------------------------------------------------------------------

### Data Model (example)

**Users**
  - `id` (UUID, PK)
  - `username` (string, unique)
  - `total_score` (integer, indexed)
  - `created_at`, 
  - `updated_at`

**Score_Event (use as source of trust)**
  - `id`
  - `user_id`
  - `action_type`
  - `score_delta`
  - `idempotency_key`
  - `created_at`

Only `total_score` is required for the core feature; storing score events is useful for auditing and fraud detection.

### Components

**API Gateway / HTTP Layer**
  - Accepts REST/gRPC/WebSocket requests from clients.
  - Terminates TLS and handles authentication (JWT, session token, etc.).

**Score Service (this module)**
  - Exposes APIs to:
    - Increment a user’s score for a valid action.
    - Fetch the current Top 10 leaderboard.
  - Contains business rules around scoring and validation.

**Authentication & Authorization Service**
  - Validates user identity (JWT, OAuth2, etc.).
  - Provides user ID and roles/permissions to the Score Service.

**Data Store**
  - **Primary store (DB)**: relational or document DB for durable user data and per-user `total_score`.
  - **Scoreboard store (Redis)**: Redis (e.g. sorted set) holds the **authoritative representation of the leaderboard/scoreboard**; all scoreboard reads and writes go through Redis.

**Live Score Stream Layer**
  - WebSocket or Server-Sent Events (SSE) channel between clients and backend.
  - Consumes score-update events and pushes leaderboard/user-score updates to connected clients via streaming.

**Message Broker (optional but recommended)**
  - Kafka / RabbitMQ / Redis Streams, etc.
  - Decouples synchronous score updates from asynchronous live score streaming and analytics.

## API Specification
------------------------------------------------------------------------------------------------------------------------------

### Increment user score

- **Endpoint**: `POST /api/v1/scores/increment`
- **Authentication**: Required (e.g. `Authorization: Bearer <JWT>`).
- **Request body (JSON)**:

```json
{
  "action_id": "string",        // client-side identifier of the completed action
  "action_type": "string",      // e.g. "QUIZ_COMPLETED"
  "idempotency_key": "string"   // to prevent duplicate increments
}
```

**Semantics**:
  - The backend:
    - Authenticates the user.
    - Validates that the `action_id` / `action_type` is legitimate and not reused if that matters.
    - Computes `score_delta` based on rules (e.g. quiz difficulty).
    - Atomically updates the user’s `total_score` in the DB.
    - Acquires a lock (e.g. Redis-based distributed lock) for the affected user/leaderboard segment.
    - Updates the scoreboard in Redis (sorted set) while holding the lock, then releases the lock.
    - Publishes a `ScoreUpdated` event to the message broker / Live Score Stream Service.

**Responses**:
  - `200 OK` with:

    ```json
    {
      "user_id": "string",
      "new_total_score": 1234,
      "leaderboard_position": 5   // null if not in Top 10
    }
    ```

  - `400 Bad Request` for invalid payload.
  - `401 Unauthorized` if token invalid/missing.
  - `403 Forbidden` if the action is not allowed for this user.
  - `409 Conflict` if idempotency check fails for a duplicate request.

### Get Top 10 leaderboard

- **Endpoint**: `GET /api/v1/leaderboard/top`
- **Authentication**: Optional (depending on product).
- **Query params**:
  - `limit` (optional, default 10, max 50).

**Response** (`200 OK`):

```json
{
  "entries": [
    { "rank": 1, "username": "alice", "score": 5000 },
    { "rank": 2, "username": "bob",   "score": 4800 },
    ...
  ],
  "generated_at": "2026-03-02T12:00:00Z"
}
```

### Subscribe to live leaderboard updates

- **Channel**: WebSocket or SSE endpoint, e.g. `GET /api/v1/leaderboard/stream`
- **Authentication**: Required if leaderboard is not public.
- **Events sent to client** (examples):

```json
{
  "type": "LEADERBOARD_UPDATED",
  "payload": {
    "entries": [ 
        { "rank": 1, "username": "alice", "score": 5000 },
        { "rank": 2, "username": "bob",   "score": 4800 },
        ...
     ]
  }
}
```

```json
{
  "type": "USER_SCORE_UPDATED",
  "payload": {
    "user_id": "u1",
    "new_total_score": 1234,
    "leaderboard_position": 5
  }
}
```

## Execution Flow & Diagram
------------------------------------------------------------------------------------------------------------------------------

### End-to-end score update flow

- **User completes an action** in the frontend (e.g. finishes a game or quiz).
- The frontend sends `POST /api/v1/scores/increment` with `action_id`, `action_type`, `idempotency_key`.
- The API gateway authenticates the request and forwards it to the Score Service.
- The Score Service:
   -- Validates the action.
   -- Computes the `score_delta`.
   -- Atomically updates the user’s `total_score` in the DB.
   -- Acquires a Redis lock for the scoreboard (or specific user entry).
   -- Updates the leaderboard in Redis (sorted set by score) under that lock, then releases the lock.
   -- Emits a `ScoreUpdated` event to the message broker.
- The Live Score Stream Service consumes the event and:
   -- Recomputes / fetches the Top 10 from Redis.
   -- Pushes `USER_SCORE_UPDATED` and/or `LEADERBOARD_UPDATED` events to connected clients over WebSocket/SSE.
- The frontend receives the event and updates the UI in real time.

### Sequence diagram

sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Score as Score Service
    participant DB as Database
    participant Cache as Leaderboard Cache (Redis)
    participant RT as Live Score Stream Service

    Client->>API: POST /scores/increment (JWT, action_id, action_type)
    API->>Score: Authenticated request
    Score->>Score: Validate action & compute score_delta
    Score->>DB: UPDATE users SET total_score = total_score + delta
    DB-->>Score: OK (new_total_score)
    Score->>Cache: ZADD leaderboard new_total_score user_id
    Score->>RT: Publish ScoreUpdated(user_id, new_total_score)
    Score-->>API: 200 OK (new_total_score, leaderboard_position)
    API-->>Client: 200 OK
    RT->>Cache: ZREVRANGE leaderboard 0 9
    RT-->>Client: LEADERBOARD_UPDATED & USER_SCORE_UPDATED (WebSocket/SSE)


## Security Considerations
------------------------------------------------------------------------------------------------------------------------------

**Authentication**
  - All score-changing operations require a valid access token.
  - The backend derives the `user_id` from the token; the client must not be able to specify arbitrary `user_id`s for updates.

**Authorization**
  - Ensure that only the authenticated user can increment their own score (or an admin API exists with explicit controls).

**Action validation**
  - Use one or more of:
    - **Server-side verification** (e.g. the action completes on server, not just client).
    - **Signed action tokens**: the server issues a signed token when an action can be performed; the client returns it after completion.
    - **Idempotency keys** to prevent duplicate increments for the same action.

**Anti-abuse and rate limiting**
  - Apply rate limits per user/IP on `POST /scores/increment`.
  - Add anomaly detection and alerts for unusual scoring patterns.

**Data integrity**
  - Use atomic DB updates (e.g. `UPDATE ... SET total_score = total_score + :delta`) and/or DB transactions.
  - Redis leaderboard should be rebuildable from DB if needed.

## Observability & Operations
------------------------------------------------------------------------------------------------------------------------------

**Logging**
  - Log each score change with:
    - `user_id`, `score_delta`, `new_total_score`, `action_type`, `idempotency_key`, `request_id`.
  - Mask any PII beyond what is necessary (e.g. don’t log full tokens).

**Metrics**
  - Requests per second on score update and leaderboard APIs.
  - Latency percentiles (50, 95, 99).
  - Error rates by status code.
  - Number of active WebSocket/SSE connections.

**Tracing**
  - Use distributed tracing to tie together:
  - Client request → Score Service → DB/Redis → Live Score Stream Service.

## Potential Improvements & Extensions
------------------------------------------------------------------------------------------------------------------------------

**Sharded or distributed leaderboard**
  - For very large user bases, shard leaderboards by region or segment and maintain global aggregates asynchronously.

**Personalized leaderboards**
  - Support friend-only or region-specific Top 10 in addition to global.

**Replay protection and fraud analytics**
  - Store detailed score events and run offline or streaming analysis to detect bots/cheating.

**Offline clients**
  - Support reconciling score changes when users go offline and later reconnect, ensuring idempotent updates.

**Graceful degradation**
  - If Live Score Stream Service or cache is down, fall back to:
    - Serving slightly stale leaderboard data from DB.
    - Disabling live push but still allowing score updates.

