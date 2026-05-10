/**
 * AI routes relative to axios `baseURL` (e.g. `/api/v1`).
 * Mirrors `ArAutomation/src/modules/ai/ai.routes.js` (mounted at `/ai`).
 *
 * Customer-level cohort analysis: `arId` is an anchor Mongo ObjectId; the server loads all AR rows
 * in the same merchant/outlet + billing bucket (see ai.controller.analyzeAr).
 *
 * @type {Readonly<{ analyzeArByAnchorId: (arId: string) => string }>}
 */
export const aiRoutes = {
  analyzeArByAnchorId: (arId) => `/ai/analyze/ar/${encodeURIComponent(arId)}`,
}
