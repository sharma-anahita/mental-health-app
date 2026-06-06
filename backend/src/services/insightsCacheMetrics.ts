export interface InsightsCacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  redisLookupMsTotal: number;
  mlGenerationMsTotal: number;
  responseMsTotal: number;
}

const stats: InsightsCacheStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  redisLookupMsTotal: 0,
  mlGenerationMsTotal: 0,
  responseMsTotal: 0,
};

export function recordInsightsRequest(): void {
  stats.totalRequests += 1;
}

export function recordInsightsCacheHit(): void {
  stats.cacheHits += 1;
}

export function recordInsightsCacheMiss(): void {
  stats.cacheMisses += 1;
}

export function recordRedisLookup(ms: number): void {
  stats.redisLookupMsTotal += ms;
}

export function recordMlGeneration(ms: number): void {
  stats.mlGenerationMsTotal += ms;
}

export function recordInsightsResponse(ms: number): void {
  stats.responseMsTotal += ms;
}

export function getInsightsCacheStats() {
  const totalRequests = stats.totalRequests;
  const cacheHits = stats.cacheHits;
  const cacheMisses = stats.cacheMisses;
  const hitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;

  return {
    totalRequests,
    cacheHits,
    cacheMisses,
    hitRate,
    averageRedisLookupMs: totalRequests > 0 ? stats.redisLookupMsTotal / totalRequests : 0,
    averageMlGenerationMs: totalRequests > 0 ? stats.mlGenerationMsTotal / totalRequests : 0,
    averageResponseMs: totalRequests > 0 ? stats.responseMsTotal / totalRequests : 0,
    totals: {
      redisLookupMs: stats.redisLookupMsTotal,
      mlGenerationMs: stats.mlGenerationMsTotal,
      responseMs: stats.responseMsTotal,
    },
  };
}
