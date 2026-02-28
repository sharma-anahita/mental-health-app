from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from textblob import TextBlob
import numpy as np
from typing import List

app = FastAPI(title="ML Analytics Service")


class ReflectionIn(BaseModel):
    text: str


class ReflectionOut(BaseModel):
    sentiment_score: float
    sentiment_label: str


class TrendIn(BaseModel):
    moods: List[float]


class TrendOut(BaseModel):
    trend: str
    volatility: str
    risk_score: float


@app.post("/analyze-reflection", response_model=ReflectionOut)
def analyze_reflection(payload: ReflectionIn):
    text = payload.text or ""
    if not text.strip():
        raise HTTPException(status_code=400, detail="`text` must be a non-empty string")

    blob = TextBlob(text)
    score = float(blob.sentiment.polarity)

    if score > 0.1:
        label = "positive"
    elif score < -0.1:
        label = "negative"
    else:
        label = "neutral"

    return ReflectionOut(sentiment_score=score, sentiment_label=label)


@app.post("/analyze-trend", response_model=TrendOut)
def analyze_trend(payload: TrendIn):
    moods = payload.moods or []
    if not isinstance(moods, list) or len(moods) < 2:
        raise HTTPException(status_code=400, detail="`moods` must be an array of at least two numbers")

    try:
        arr = np.array(moods, dtype=float)
    except Exception:
        raise HTTPException(status_code=400, detail="`moods` must contain numeric values")

    x = np.arange(arr.size)
    # simple linear regression (slope)
    slope, intercept = np.polyfit(x, arr, 1)

    # interpret trend
    slope_threshold = 0.01
    if abs(slope) < slope_threshold:
        trend = "flat"
    elif slope > 0:
        trend = "increasing"
    else:
        trend = "decreasing"

    # volatility: std of differences
    diffs = np.diff(arr)
    vol = float(np.std(diffs))
    if vol < 0.5:
        volatility = "low"
    elif vol < 1.5:
        volatility = "moderate"
    else:
        volatility = "high"

    # risk_score heuristic: higher when volatility is high and trend is decreasing
    vol_norm = float(np.tanh(vol / 2.0))
    slope_risk = 1.0 if slope < 0 else 0.5
    risk_score = vol_norm * slope_risk
    risk_score = max(0.0, min(1.0, risk_score))

    return TrendOut(trend=trend, volatility=volatility, risk_score=round(risk_score, 3))


# if __name__ == "__main__":
#     import uvicorn

#     uvicorn.run("ml-service.main:app", host="0.0.0.0", port=8000, reload=True)
