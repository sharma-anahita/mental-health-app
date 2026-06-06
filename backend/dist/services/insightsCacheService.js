"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsightsCacheKey = exports.INSIGHTS_CACHE_TTL_SECONDS = void 0;
exports.getCachedInsights = getCachedInsights;
exports.getCachedInsightsWithRaw = getCachedInsightsWithRaw;
exports.setCachedInsights = setCachedInsights;
exports.invalidateInsightsCache = invalidateInsightsCache;
const redis_1 = __importDefault(require("../config/redis"));
exports.INSIGHTS_CACHE_TTL_SECONDS = 60 * 60 * 24;
const buildInsightsCacheKey = (userId) => `insights:${userId}`;
const getInsightsCacheKey = (userId) => buildInsightsCacheKey(userId);
exports.getInsightsCacheKey = getInsightsCacheKey;
async function getCachedInsights(userId) {
    try {
        const raw = await redis_1.default.get(buildInsightsCacheKey(userId));
        if (!raw)
            return null;
        if (typeof raw === 'string') {
            return JSON.parse(raw);
        }
        return raw;
    }
    catch (err) {
        console.warn('Insights cache read failed, serving uncached response:', err);
        return null;
    }
}
async function getCachedInsightsWithRaw(userId) {
    try {
        const raw = await redis_1.default.get(buildInsightsCacheKey(userId));
        return typeof raw === 'string' ? raw : raw ? JSON.stringify(raw) : null;
    }
    catch (err) {
        console.warn('Insights cache read failed, serving uncached response:', err);
        return null;
    }
}
async function setCachedInsights(userId, payload) {
    try {
        await redis_1.default.set(buildInsightsCacheKey(userId), JSON.stringify(payload), {
            ex: exports.INSIGHTS_CACHE_TTL_SECONDS,
        });
    }
    catch (err) {
        console.warn('Insights cache write failed, continuing without cache:', err);
    }
}
async function invalidateInsightsCache(userId) {
    try {
        await redis_1.default.del(buildInsightsCacheKey(userId));
    }
    catch (err) {
        console.warn('Insights cache invalidation failed, continuing request:', err);
    }
}
