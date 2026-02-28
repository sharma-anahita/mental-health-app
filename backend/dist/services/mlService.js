"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeReflection = analyzeReflection;
exports.analyzeTrend = analyzeTrend;
const axios_1 = __importDefault(require("axios"));
const ML_BASE = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';
const client = axios_1.default.create({
    baseURL: ML_BASE,
    timeout: 8000,
});
async function analyzeReflection(text) {
    if (!text || typeof text !== 'string') {
        throw new TypeError('analyzeReflection: `text` must be a non-empty string');
    }
    try {
        const resp = await client.post('/analyze-reflection', { text });
        const { sentiment_score, sentiment_label } = resp.data ?? {};
        return {
            sentimentScore: Number(sentiment_score ?? 0),
            sentimentLabel: String(sentiment_label ?? 'neutral'),
        };
    }
    catch (err) {
        const detail = err?.response?.data?.detail ?? err?.message ?? 'ML service error';
        throw new Error(`analyzeReflection failed: ${detail}`);
    }
}
async function analyzeTrend(moods) {
    if (!Array.isArray(moods) || moods.length < 2) {
        throw new TypeError('analyzeTrend: `moods` must be an array of at least two numbers');
    }
    try {
        const resp = await client.post('/analyze-trend', { moods });
        const { trend, volatility, risk_score } = resp.data ?? {};
        return {
            trend: String(trend ?? 'flat'),
            volatility: String(volatility ?? 'low'),
            riskScore: Number(risk_score ?? 0),
        };
    }
    catch (err) {
        const detail = err?.response?.data?.detail ?? err?.message ?? 'ML service error';
        throw new Error(`analyzeTrend failed: ${detail}`);
    }
}
exports.default = { analyzeReflection, analyzeTrend };
