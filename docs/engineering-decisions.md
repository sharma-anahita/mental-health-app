# Engineering Decision Records (EDR)

This document contains key technical choices made during the development of MindTrack, outlining alternatives, selected solutions, and trade-offs.

---

## 1. Decoupled Monorepo Architecture

### Context
The application requires web serving, user state calculations, text analysis (NLP), and mathematical trend modeling.

### Alternatives Considered
- **Single Monolith (Node.js):** Build all sentiment checks and trend models using Node libraries.
  - *Cons:* Node lacks mature data science ecosystems like NumPy. Blocks the main thread during heavy calculations.
- **Microservices in Separate Repos:** Move backend, frontend, and ML into three separate repositories.
  - *Cons:* Management overhead, multiple package structures, complex deployment configurations.

### Selected Solution
A **decoupled monorepo** with a Node.js Express backend, React frontend, and Python FastAPI microservice.

### Trade-offs
- *Pros:* Combines the speed of Node for APIs with the strength of Python for analytics. Keeps the repository organized in one place.
- *Cons:* Requires orchestrating multiple package configurations and managing local environments.

---

## 2. In-Memory Chat Session History

### Context
The Groq AI wellness chat requires conversation history to answer follow-up prompts intelligently.

### Alternatives Considered
- **Database Storage:** Write every user and AI chat message to a MongoDB collection.
  - *Cons:* High database write volume for short-term chat messages.
- **Client-side History:** Send the entire chat history from the React client to the server on every request.
  - *Cons:* Increases network payloads. Client-side state is easily modified.

### Selected Solution
**Server-side In-memory Map Cache:** The server stores chat logs in a temporary `Map` keyed by `userId` and limits history to the last 5 messages.

### Trade-offs
- *Pros:* Zero database writes. Fast lookups and clean API payloads.
- *Cons:* Chat history is lost when the server restarts. *Decision: Accepted for a prototyping scope, with plans to migrate to MongoDB-backed logs in production.*

---

## 3. REST-based Redis Cache Client (Upstash)

### Context
Deploying a cache on platforms with free/idle tiers (like Render web services).

### Alternatives Considered
- **Traditional Redis TCP Client:** Establish persistent TCP connections using libraries like `ioredis`.
  - *Cons:* Free hosting servers frequently pause or go idle. This drops TCP socket connections, causing subsequent client requests to hang or crash due to connection pool timeout errors.

### Selected Solution
**Upstash REST Redis client (`@upstash/redis`):** Connection is established via stateless HTTP REST requests instead of persistent TCP sockets.

### Trade-offs
- *Pros:* No connection pool timeouts or connection drop issues. High reliability across server restarts.
- *Cons:* Slightly higher latency than direct TCP (usually $\approx 1-3\text{ms}$ extra overhead), which is negligible for this application.
