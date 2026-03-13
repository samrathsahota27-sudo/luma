/**
 * In-memory store for email reminder registration.
 * Keys: email (lowercase). Values: { lastReflectionAt, firstReminderSentAt?, secondReminderSentAt? }.
 * For production, replace with a database.
 */
function getStore() {
  if (typeof globalThis.__luma_reminder_store !== "undefined") {
    return globalThis.__luma_reminder_store;
  }
  globalThis.__luma_reminder_store = new Map();
  return globalThis.__luma_reminder_store;
}

module.exports = { getStore };
