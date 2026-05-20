/**
 * Simple TTL-based in-memory cache.
 * Uses a Map to store key → { data, expiresAt } entries.
 * Suitable for caching dashboard stats on a single-instance server.
 */
const cache = new Map();

/**
 * Get a cached value by key.
 * Returns the data if present and not expired, otherwise null.
 */
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Store a value in the cache with a TTL (in seconds).
 * @param {string} key
 * @param {any} data
 * @param {number} ttlSeconds - Time-to-live in seconds (default: 300 = 5 min)
 */
function setCache(key, data, ttlSeconds = 300) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Remove a specific key from the cache.
 */
function clearCache(key) {
  cache.delete(key);
}

module.exports = { getCache, setCache, clearCache };
