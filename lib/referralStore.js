/**
 * In-memory store for referral completions (referred user completed a reflection).
 * Keys: referrerSlug. Values: array of { completedAt }.
 * Used by POST /api/referral and GET /api/referral/[slug].
 */
function getStore() {
  if (typeof globalThis.__luma_referral_store !== "undefined") {
    return globalThis.__luma_referral_store;
  }
  globalThis.__luma_referral_store = new Map();
  return globalThis.__luma_referral_store;
}

module.exports = { getStore };
