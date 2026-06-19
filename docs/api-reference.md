# API Reference Documentation

All endpoints are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header: `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication (`/api/auth`)

### Register Account
- **Endpoint:** `POST /api/auth/register`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60d5ec...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "xp": 0,
      "streak": 0
    }
  }
  ```

### Log In
- **Endpoint:** `POST /api/auth/login`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):** Same as Register.

### Google Sign-In
- **Endpoint:** `POST /api/auth/google`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "idToken": "google-id-token-string"
  }
  ```
- **Response (200 OK):** Same as Register.
<!-- 
### Forgot Password
- **Endpoint:** `POST /api/auth/forgot-password`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "jane@example.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "If an account exists with this email, a password reset link has been sent"
  }
  ```
  *(Generic response prevents email verification scanning)*

### Reset Password
- **Endpoint:** `POST /api/auth/reset-password/:token`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "newPassword": "newsecurepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Password has been reset successfully"
  }
  ``` -->

---

## 2. Mood Logs (`/api/moods`)

### Create Mood Log
- **Endpoint:** `POST /api/moods`
- **Authentication:** Bearer Token
- **Constraints:** Max 1 entry per UTC day.
- **Request Body:**
  ```json
  {
    "mood": "Good",
    "note": "Had a productive day finishing my project milestones.",
    "energy": 80,
    "stress": 30
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "mood": {
      "_id": "60d5f0...",
      "userId": "60d5ec...",
      "mood": "Good",
      "note": "Had a productive day finishing my project milestones.",
      "energy": 80,
      "stress": 30,
      "createdAt": "2026-06-19T09:00:00.000Z"
    },
    "stats": {
      "xp": 15,
      "streak": 5,
      "coins": 10,
      "level": 0
    }
  }
  ```

### Get Paginated Mood Logs
- **Endpoint:** `GET /api/moods`
- **Authentication:** Bearer Token
- **Query Parameters:**
  - `limit`: Number (default: 10, max: 50)
  - `cursor`: Base64 string (optional)
  - `direction`: `'next' | 'prev'` (default: `'next'`)
- **Response (200 OK):**
  ```json
  {
    "moods": [...],
    "pageInfo": {
      "limit": 10,
      "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTA2LTE5VDA5OjAwOjAwLjAwMFoiLCJpZCI6IjYwZDVmMC..." ,
      "prevCursor": null,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
  ```

---

## 3. Reflections (`/api/reflections`)

### Create or Update Today's Reflection
- **Endpoint:** `POST /api/reflections`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "text": "Reflecting on today, I felt quite grateful for the team assistance."
  }
  ```
- **Response (201 Created / 200 OK):**
  ```json
  {
    "reflection": {
      "_id": "60d5f2...",
      "userId": "60d5ec...",
      "text": "Reflecting on today, I felt quite grateful for the team assistance.",
      "date": "2026-06-19T09:00:00.000Z",
      "sentiment": {
        "score": 0.45,
        "label": "positive"
      }
    },
    "stats": {
      "xp": 120,
      "coins": 35,
      "level": 1,
      "streak": 5
    }
  }
  ```

---

## 4. Recommendations (`/api/recommendations`)

### Fetch Recommendations
- **Endpoint:** `GET /api/recommendations`
- **Authentication:** Bearer Token
- **Query Parameters:**
  - `refresh`: `'true' | 'false'` (pass true to force scoring recalculation and bypass cache)
- **Response (200 OK):**
  ```json
  {
    "recommendationId": "60d5f4...",
    "generatedAt": "2026-06-19T09:00:00.000Z",
    "expiresAt": "2026-06-19T13:00:00.000Z",
    "context": {
      "dominantMood": "Good",
      "energyLevel": "high",
      "trend": "stable",
      "streakDays": 5,
      "source": "rule-based"
    },
    "activities": [
      {
        "id": "60d5a0...",
        "key": "morning-stretch",
        "title": "Energizing morning stretch",
        "description": "A 5-minute full body stretch.",
        "category": "physical",
        "durationMinutes": 5,
        "score": 85,
        "rank": 1,
        "feedbackGiven": null
      }
    ],
    "questions": [
      {
        "id": "60d5b0...",
        "key": "gratitude-question",
        "text": "What made you smile today?",
        "score": 75,
        "rank": 1,
        "feedbackGiven": null
      }
    ]
  }
  ```

### Record Recommendation Feedback
- **Endpoint:** `POST /api/recommendations/feedback`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "recommendationId": "60d5f4...",
    "targetType": "activity",
    "targetId": "60d5a0...",
    "rating": "helpful"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Feedback recorded",
    "rating": "helpful"
  }
  ```

---

## 5. Virtual Store (`/api/store`)

### Get Store Items
- **Endpoint:** `GET /api/store`
- **Authentication:** Bearer Token
- **Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": "60d5c0...",
        "name": "Midnight Theme",
        "type": "theme",
        "price": 100,
        "itemKey": "midnight",
        "description": "A premium dark theme",
        "owned": false
      }
    ],
    "ownedItemKeys": ["calm", "focus"],
    "user": {
      "coins": 85
    }
  }
  ```

### Purchase Store Item
- **Endpoint:** `POST /api/store/purchase`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "itemKey": "midnight"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Purchase successful",
    "purchasedItem": {
      "itemKey": "midnight",
      "price": 100
    },
    "user": { ... }
  }
  ```
