/**
 * In-memory store for Connect Inner Worlds invites.
 * Used by POST /api/invites and GET /api/invites/[inviteId].
 * Note: In serverless environments, instances may not share memory; invites can be lost on cold start.
 */
function getInviteStore() {
  if (typeof globalThis.__luma_invite_store !== "undefined") {
    return globalThis.__luma_invite_store;
  }
  globalThis.__luma_invite_store = new Map();
  return globalThis.__luma_invite_store;
}

module.exports = { getInviteStore };
