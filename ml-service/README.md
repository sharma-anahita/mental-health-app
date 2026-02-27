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

uvicorn ml-service.main:app --reload --port 8000
```

Then POST to `http://localhost:8000/analyze-reflection` or `/analyze-trend`.
