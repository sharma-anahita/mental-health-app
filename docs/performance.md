# Performance & Scalability Optimizations

MindTrack implements performance-first mechanisms to reduce database load, lower API response times, and provide a fluid user experience.

---

## 1. Caching Strategies (Redis)

To prevent repetitive, expensive MongoDB aggregations, the backend uses **Upstash Redis** as a key-value cache layer.

### Mood Insights Caching
- **Implementation:** The `getInsights` endpoint (`insightsController.ts`) fetches and transforms mood logs.
- **Cache Policy:** Insight results are cached for **24 hours** (`insights:${userId}`).
- **Proactive Invalidation:** The cache is automatically deleted (`redis.del`) when the user logs a new mood (`createMood`), ensuring insights refresh as soon as new data is available.

### Activity Heatmap Caching
- **Implementation:** The Github-style calendar heatmap requires aggregating daily XP records across 4+ months.
- **Cache Policy:** Results are cached for **24 hours** (`heatmap:${userId}:${months}`).
- **Proactive Invalidation:** Earning XP (mood logs, reflections, profile updates) triggers progression service hooks, which automatically find and delete all heatmap cache keys matching `heatmap:${userId}:*`.

---

## 2. Database Optimizations (Mongoose / MongoDB)

- **Compound Unique Indices:** The `DailyXP` model uses a compound unique index on `{ userId: 1, date: 1 }`. This ensures single-scan query operations and guarantees strict database constraints against duplicate daily progression records.
- **Sorted Indexing:** The `Recommendation` schema indexes `{ userId: 1, generatedAt: -1 }`. This speeds up the retrieval of the most recent recommendation run.
- **Lean Queries:** Database reads that do not require Mongoose modification features (such as listing store items or checking history) call `.lean()`. This skips Mongoose document instantiation, reducing CPU overhead and memory usage.

---

## 3. Asynchronous Microservice Offloading

- **Event Loop Protection:** Traditional Node.js servers are single-threaded. Running complex math algorithms (like linear regressions) or large text analysis (sentiment checking) blocks the event loop.
- **Decoupled Architecture:** MindTrack offloads sentiment checks (`TextBlob`) and trend regressions (`NumPy`) to a separate Python FastAPI microservice. The Express server communicates with this service asynchronously via HTTP, keeping the Node.js event loop free to handle concurrent requests.
- **Graceful Failures:** In validation scripts and controllers, failures in the ML microservice trigger warnings but do not crash the request. The application falls back to standard rules, maintaining high availability.

---

## 4. Frontend Optimizations

- **Selector Subscriptions (Zustand):** Zustand hooks in the React app subscribe to specific state slices:
  ```typescript
  const toasts = useUIStore((s) => s.toasts);
  ```
  This ensures that updating unrelated UI state properties does not trigger re-renders in toast elements.
- **CSS Variable-based Themes:** Theme updates modify CSS custom properties on `<html>` instead of rebuilding or reloading stylesheets, allowing for instant theme switches with no repaint lags.
