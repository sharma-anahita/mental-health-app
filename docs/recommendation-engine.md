# Recommendation Engine Deep Dive

MindTrack features a context-aware heuristic recommendation engine that scores and ranks wellness activities and reflection questions. It operates out of the backend (`backend/src/services/recommendationService.ts` and `backend/src/services/scoringEngine.ts`).

---

## Personalized Recommendation Flow

```
┌─────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────┐
│  1. Retrieve Logs   │ ───> │ 2. Compute User Context │ ───> │ 3. Query Active Bank│
│  (Mood, energy, FX) │      │  (Trend, volatility)    │      │ (Activities, Qs)    │
└─────────────────────┘      └─────────────────────────┘      └─────────────────────┘
                                                                         │
┌─────────────────────┐      ┌─────────────────────────┐      ┌──────────▼──────────┐
│  6. Cache Response  │ <─── │ 5. Select & Rank Top 5  │ <─── │ 4. Run Core Scoring │
│   (Redis, Mongoose) │      │ (Apply fallback safety) │      │    (0-100 scale)    │
└─────────────────────┘      └─────────────────────────┘      └─────────────────────┘
```

---

## 1. Context Inputs

The engine aggregates data from the user's history to build a context snapshot:

- **Dominant Mood:** Calculated from mood logs submitted within the last 7 days. If no recent logs exist, defaults to `'Neutral'`.
- **Energy Level:** Standardized based on average logged energy scores:
  - `low` (average $< 35$)
  - `high` (average $> 65$)
  - `medium` (average $35 \le x \le 65$)
- **Mood Trend:** Decided by calculating the linear slope of the last 7 mood scores.
  - Slope $< -0.2 \rightarrow$ `declining`
  - Slope $> 0.2 \rightarrow$ `improving`
  - Otherwise $\rightarrow$ `stable`
- **Consecutive Low Days:** Counts consecutive days where the daily average mood score was $< 4$ (Very Low or Low).
- **Time of Day:** Maps local hours to categories:
  - `morning` ($5 \text{am} - 11:59\text{am}$)
  - `afternoon` ($12\text{pm} - 5:59\text{pm}$)
  - `evening` ($6\text{pm} - 4:59\text{am}$)
- **Recent Feedback:** Map of user responses (`helpful` or `not_helpful`) recorded on recommendations within the last 14 days.

---

## 2. Core Scoring Algorithm (Activities & Questions)

Every active item is evaluated against the computed context. A cumulative score is computed up to a maximum of **100 points**:

### A. Mood Matching (Max 40 points)
- If the user's dominant mood is in the item's `contraindicated` list, the item receives a score of `0` and is skipped.
- **Direct Match (+40):** The dominant mood is explicitly in the item's `targetMoods`.
- **Adjacent Match (+20):** The dominant mood is mathematically adjacent to a target mood (e.g., if the target mood is `'Neutral'`, adjacent moods are `'Low'` and `'Good'`).

### B. Energy Matching (Max 25 points)
- **Direct Match (+25):** The user's computed energy level is listed in the item's `targetEnergyLevels`.
- **Adjacent Match (+10):** The energy level is adjacent (e.g. user is `medium`, target is `low` or `high`).

### C. Trend Bonus (Max 15 points)
- If the mood trend is `declining`:
  - `+15` points if the activity contains the `'grounding'` tag.
  - `+10` points if the activity contains the `'gentle'` tag.
- If the mood trend is `improving`:
  - `+10` points if the activity is marked as `goal-oriented`.

### D. Time of Day Bonus (Max 10 points)
- `+10` points if the current time is `morning` and the activity contains the `'energizing'` tag.
- `+10` points if the current time is `evening` and the activity contains the `'winding-down'` tag.

### E. Consistency & Low-Mood Streaks (Max 5 points)
- `+5` points if the user's streak is $\ge 7$ and the item is `goal-oriented`.
- `+5` points if consecutive low days $\ge 3$ and the item contains the `'grounding'` tag.

### F. User Feedback Modifier (-20 to +5 points)
- **`+5` points** if the user rated this item's key as `helpful` in the last 14 days.
- **`-20` points** if the user rated this item's key as `not_helpful` in the last 14 days (acts as a heavy penalty to down-rank undesirable recommendations).

*The final computed score is clamped between 0 and 100 points.*

---

## 3. Fallbacks and Diversity Controls

- **Onboarding Fallback:** If the user is logging into the system for the first time and has no mood entries, the engine returns a set of pre-configured onboarding activities (`5-min-breathing`, `10-min-walk`, `doodle-5-min`) and reflection questions (`self-care-question`, `mood-lift-question`).
- **Diversity Fallback:** If all active items score `0` (e.g., due to extreme user moods and strict tag constraints), the engine bypasses standard filters to select one physical activity, one cognitive activity, and one mindfulness activity, giving them mock scores to prevent blank recommendations on the frontend.
