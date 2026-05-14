# MindTrack : Mental Health & Mood Tracking App

A full-stack monorepo for a mental wellness application with mood logging, AI chat, gamification, and ML-powered insights.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Frontend](#frontend)
- [Backend](#backend)
- [ML Service](#ml-service)
- [Features](#features)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

MindTrack is a mental health companion app that helps users:

- Log daily moods with optional notes
- Reflect on their day with journaling prompts
- Track streaks, XP, and levels through a gamification system
- Gain insights from ML-powered mood trend analysis and sentiment detection
- Chat with an AI wellness assistant
- Customize their experience with themes, fonts, and colors

---

## Tech Stack

| Layer       | Technology                                                      |
|-------------|-----------------------------------------------------------------|
| Frontend    | React 19, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion, Recharts |
| Backend     | Node.js, Express 5, TypeScript, MongoDB (Mongoose), JWT         |
| ML Service  | Python, FastAPI, TextBlob, NumPy                                |
| Auth        | JWT + Google OAuth 2.0                                          |
| Deployment  | Vercel (frontend), Render (backend + ML service)                |

---

## Project Structure

```
/
├── frontend/           # React + Vite SPA
│   ├── src/
│   │   ├── app/        # Layout and route guards
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page-level components
│   │   ├── services/   # API client and service modules
│   │   ├── store/      # Zustand state stores
│   │   ├── styles/     # Theme CSS variables
│   │   ├── types/      # Shared TypeScript types
│   │   └── utils/      # Helper utilities
│   └── ...
├── backend/            # Node.js / Express API
│   ├── src/
│   │   ├── config/     # Database and mailer setup
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/     # Mongoose models
│   │   ├── routes/
│   │   ├── scripts/    # Seed scripts
│   │   └── services/   # Business logic services
│   └── dist/           # Compiled JS output
├── ml-service/         # FastAPI ML microservice
│   ├── main.py
│   └── requirements.txt
├── ml_service_asgi.py  # ASGI wrapper for Render deployment
└── render.yaml         # Render Blueprint config
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **Python** >= 3.9
- **MongoDB** instance (local or Atlas)
- A **Google OAuth Client ID** (optional, for Google sign-in)
- A **Groq API key** (for the AI chat feature)

### Environment Variables

#### Backend (`backend/.env`)

Copy `backend/.env.example` and fill in the values:

```env
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
MONGO_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Optional — AI chat
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant          # default
GROQ_API_BASE_URL=https://api.groq.com/openai/v1  # default

# Optional — ML service
ML_SERVICE_URL=http://localhost:8000     # default
```

#### Frontend (`frontend/.env.local`)

```env
VITE_API_BASE=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Running Locally

#### 1. Backend

```bash
cd backend
npm install
npm run dev        # starts ts-node-dev on port 5000
```

To seed the store items database:

```bash
npm run seed:store
```

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # starts Vite on port 5173
```

#### 3. ML Service

```bash
cd ml-service
pip install -r requirements.txt

# Optional: download TextBlob corpora for better results
python -m textblob.download_corpora

uvicorn main:app --reload --port 8000
```

---

## Frontend

The React SPA is organized around these main pages:

| Route          | Page            | Description                              |
|----------------|-----------------|------------------------------------------|
| `/dashboard`   | Dashboard       | Mood summary, XP progress, streak, reflections |
| `/mood-log`    | Mood Log        | Log mood entries with optional notes     |
| `/insights`    | Insights        | ML-powered mood trends and sentiment     |
| `/goals`       | Goals           | Daily and weekly goal tracking           |
| `/stores`      | Store           | Buy themes and customizations with coins |
| `/profile`     | Profile         | Edit profile, appearance, and typography |

### State Management

Zustand is used for all client-side state:

- **`moodStore`** — mood logs, pagination, selected mood
- **`userStore`** — XP, level, streak, coins, streak restore
- **`themeStore`** — active theme, owned themes
- **`uiStore`** — toasts, sidebar state

### Theming

Four themes are available (calm is free; the rest are purchasable):

| Theme      | Description               |
|------------|---------------------------|
| `calm`     | Soft green & blue (default) |
| `focus`    | Clean white & blue         |
| `sunset`   | Warm orange & peach        |
| `midnight` | Deep navy & purple         |

Themes are applied via CSS custom properties on `<html>` and persisted to `localStorage` and the backend.

---

## Backend

### Authentication

- **POST** `/api/auth/register` — Email/password registration
- **POST** `/api/auth/login` — Email/password login
- **POST** `/api/auth/google` — Google OAuth login
- **POST** `/api/auth/forgot-password` — Request password reset email
- **POST** `/api/auth/reset-password/:token` — Reset password with token

All protected routes require a `Bearer` JWT token in the `Authorization` header. Tokens expire after 7 days.

### Mood Logs

- **POST** `/api/moods` — Create a mood log (one per UTC day)
- **GET** `/api/moods` — Fetch paginated mood logs (cursor-based)

### Reflections

- **POST** `/api/reflections` — Create or update today's reflection
- **GET** `/api/reflections/today` — Get today's reflection
- **GET** `/api/reflections` — Paginated reflection history

### Goals

- **GET** `/api/goals` — List all goals
- **POST** `/api/goals` — Create a goal (`daily` or `weekly`)
- **PATCH** `/api/goals/:id` — Update goal (text, completion)
- **DELETE** `/api/goals/:id` — Delete a goal

### Gamification

- **GET** `/api/gamification` — Level, XP, streak, coins, restore ticket count
- **POST** `/api/gamification/streak/restore` — Use a Time Travel Ticket to restore a broken streak

### Insights

- **GET** `/api/insights` — Mood trend data, distribution, and ML-powered insight cards

### Store

- **GET** `/api/store` — List purchasable items
- **POST** `/api/store/purchase` — Purchase an item by `itemKey`

### User & Preferences

- **GET** `/api/user/profile` — Get user profile
- **PATCH** `/api/user/profile` — Update profile fields
- **GET** `/api/user/preferences` — Get theme/font preferences
- **PATCH** `/api/user/preferences` — Update theme, font color, or font style

### Progression System

XP and coins are awarded automatically:

| Action                       | XP Gained         | Coins Gained       |
|------------------------------|-------------------|--------------------|
| Mood log (base)              | 10 + streak bonus | 5                  |
| Mood log with a note         | +5                | —                  |
| Streak bonus (per day, cap)  | up to +20         | +5 if streak ≥ 7   |
| 30-day streak milestone      | —                 | +10                |
| Weekly consistency (5+ logs) | —                 | +5 (Sundays)       |
| Reflection submitted         | 20                | —                  |
| Goal completed               | 5                 | —                  |
| Profile field filled         | 2 per field       | +5 (all complete)  |

---

## ML Service

A lightweight FastAPI microservice that exposes two endpoints:

### `POST /analyze-reflection`

Performs sentiment analysis on a journal entry using TextBlob.

**Request:**
```json
{ "text": "I felt calm and focused today." }
```

**Response:**
```json
{
  "sentiment_score": 0.35,
  "sentiment_label": "positive"
}
```

Labels: `positive` (score > 0.1), `negative` (score < -0.1), `neutral` (otherwise).

### `POST /analyze-trend`

Analyzes a series of mood scores using linear regression to detect trends and volatility.

**Request:**
```json
{ "moods": [5, 6, 7, 6, 8, 7, 9] }
```

**Response:**
```json
{
  "trend": "increasing",
  "volatility": "low",
  "risk_score": 0.12
}
```

- **trend**: `increasing`, `decreasing`, or `flat`
- **volatility**: `low`, `moderate`, or `high`
- **risk_score**: 0.0–1.0 (higher = greater concern)

---

## Deployment

### Frontend (Vercel)

The `frontend/vercel.json` rewrites all routes to `/index.html` for SPA support. Set the following environment variables in Vercel:

```
VITE_API_BASE=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Backend (Render)

Deploy as a **Node.js** web service:

- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/server.js`

Set all variables from `backend/.env.example` in Render's environment settings.

### ML Service (Render)

A `render.yaml` Blueprint is included at the repo root. It deploys the ML service automatically:

```yaml
services:
  - type: web
    name: mental-health-ml-service
    runtime: python
    buildCommand: pip install -r ml-service/requirements.txt
    startCommand: uvicorn ml_service_asgi:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /docs
```

After deploying, set `ML_SERVICE_URL` in the backend environment to point to the Render ML service URL.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Make your changes with clear, focused commits.
3. Ensure TypeScript compiles without errors (`tsc --noEmit` in both `frontend/` and `backend/`).
4. Open a pull request describing what you changed and why.

For significant changes, please open an issue first to discuss the approach.
