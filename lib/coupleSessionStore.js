/**
 * In-memory store for remote Couple Mode sessions (two devices).
 * Same limitations as inviteStore: serverless instances may not share memory.
 */
function getCoupleSessionStore() {
  if (typeof globalThis.__luma_couple_session_store !== "undefined") {
    return globalThis.__luma_couple_session_store;
  }
  globalThis.__luma_couple_session_store = new Map();
  return globalThis.__luma_couple_session_store;
}

module.exports = { getCoupleSessionStore };
