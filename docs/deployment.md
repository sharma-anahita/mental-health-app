# Production Deployment Guide

MindTrack is set up for automated deployments across Vercel and Render.

---

## 1. Frontend Deployment (Vercel)

The React frontend compiles as a Single Page Application (SPA).

- **Framework Preset:** Vite
- **Build Command:** `tsc -b && vite build`
- **Output Directory:** `dist`
- **Redirects/Rewrites:** Configured in `frontend/vercel.json` to route all page requests back to `/index.html` to support client-side React Router navigation:
  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "rewrites": [
      { "source": "/(.*)", "destination": "/" }
    ]
  }
  ```

### Required Vercel Variables
- `VITE_API_BASE`: E.g., `https://mental-health-app-backend.onrender.com/api`
- `VITE_GOOGLE_CLIENT_ID`: E.g., `169919889426-...`

---

## 2. Backend Deployment (Render)

The Express backend compiles from TypeScript to Javascript and runs under Node.js.

- **Service Type:** Web Service
- **Runtime:** Node
- **Build Command:** `npm install && npm run build` (runs `tsc` compiler)
- **Start Command:** `node dist/server.js`

### Required Render Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: App JWT signing key
- `GROQ_API_KEY`: Groq API authorization key
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: Redis cache settings
- `EMAIL_USER` & `EMAIL_PASSWORD` & `EMAIL_FROM`: Gmail SMTP settings
- `FRONTEND_URL`: URL of the deployed Vercel application (used for CORS routing)
- `ML_SERVICE_URL`: URL of the deployed FastAPI service

---

## 3. Machine Learning Microservice Deployment (Render)

The Python microservice is deployed on Render using the included `render.yaml` Blueprint file located at the repository root.

- **Service Type:** Web Service
- **Runtime:** Python
- **Build Command:** `pip install -r ml-service/requirements.txt`
- **Start Command:** `uvicorn ml_service_asgi:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/docs` (accesses FastAPI OpenAPI swagger page)

### ASGI Import Wrapper
Because Python standard import rules restrict imports containing hyphens (`ml-service`), the start command calls `ml_service_asgi.py` at the project root. This wrapper dynamically loads `ml-service/main.py` and exposes the `app` instance:
```python
spec = importlib.util.spec_from_file_location('ml_service_main', str(MAIN_PATH))
ml = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ml)
app = getattr(ml, 'app')
```
This is a robust solution to deploy python files housed in subdirectories with non-standard names.
