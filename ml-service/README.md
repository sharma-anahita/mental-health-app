# ML Analytics Service

This small FastAPI service provides two endpoints for simple ML analytics used by the app.

Endpoints

- `POST /analyze-reflection`
  - Input: `{ "text": "..." }`
  - Output: `{ "sentiment_score": float, "sentiment_label": string }`

- `POST /analyze-trend`
  - Input: `{ "moods": number[] }`
  - Output: `{ "trend": string, "volatility": string, "risk_score": number }

Quickstart

Install and run:

```bash
python -m pip install -r requirements.txt
# (optional) download corpora for better TextBlob results:
python -m textblob.download_corpora

uvicorn main:app --reload --port 8000
```

Then POST to `http://localhost:8000/analyze-reflection` or `/analyze-trend`.

## Deploy on Render

This repo now includes a root `render.yaml` that deploys the ML service.

### Option A: Blueprint deploy (recommended)

1. Push this repo to GitHub.
2. In Render, click **New +** → **Blueprint**.
3. Select this repository.
4. Render reads `render.yaml` and creates `mental-health-ml-service`.
5. Deploy.

### Option B: Manual web service setup

If you prefer creating the service manually in Render:

- **Runtime**: Python
- **Build Command**: `pip install -r ml-service/requirements.txt`
- **Start Command**: `uvicorn ml_service_asgi:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/docs`

### After deploy

1. Copy your Render ML URL (example: `https://mental-health-ml-service.onrender.com`).
2. In your backend environment variables, set:
   - `ML_SERVICE_URL=https://your-ml-service.onrender.com`
3. Redeploy backend.

### Quick verify

Use these checks after deployment:

- `GET https://your-ml-service.onrender.com/docs`
- `POST https://your-ml-service.onrender.com/analyze-reflection` with body:
  - `{ "text": "I feel much better today" }`
