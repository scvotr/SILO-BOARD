"use strict";

const { logger } = require("./logger");

/**
 * In-memory cache with TTL (Time To Live) functionality
 * Provides caching for resource-intensive operations
 */
class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
    };
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined if not found/expired
   */
  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return undefined;
    }

    const item = this.cache.get(key);

    // Check if item has expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return item.value;
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = null) {
    let expiresAt = null;
    if (ttl) {
      expiresAt = Date.now() + ttl;
    }

    this.cache.set(key, {
      value,
      expiresAt,
    });

    this.stats.sets++;
  }

  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key existed and was deleted
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Get cache size
   * @returns {number} Number of cached entries
   */
  size() {
    return this.cache.size;
  }

  /**
   * Clean expired entries (garbage collection)
   */
  cleanExpired() {
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.cache.delete(key);
        this.stats.evictions++;
      }
    }
  }

  /**
   * Get cache hit ratio
   * @returns {number} Hit ratio as percentage
   */
  getHitRatio() {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// Create a singleton instance
const cache = new InMemoryCache();

// Clean expired entries periodically (every 10 minutes)
setInterval(() => {
  cache.cleanExpired();
  logger.info("Cache cleanup completed", {
    remainingEntries: cache.size(),
    evictedEntries: cache.stats.evictions,
  });
}, 600000); // 10 minutes

// Log cache statistics periodically (every 5 minutes)
setInterval(() => {
  const stats = cache.getStats();
  const hitRatio = cache.getHitRatio();

  // logger.info("Cache statistics", {
  //   hits: stats.hits,
  //   misses: stats.misses,
  //   sets: stats.sets,
  //   evictions: stats.evictions,
  //   currentSize: cache.size(),
  //   hitRatio: hitRatio.toFixed(2) + "%",
  // });
  // !--------------------
  // На этот:
  const statsMessage = `📊 Cache statistics - Hits: ${stats.hits}, Misses: ${
    stats.misses
  }, Sets: ${stats.sets}, Evictions: ${
    stats.evictions
  }, Size: ${cache.size()}, Hit Ratio: ${hitRatio.toFixed(2)}%`;

  logger.info(statsMessage);
  // !--------------------
  // console.log("📊 Cache statistics", {
  //   hits: stats.hits,
  //   misses: stats.misses,
  //   sets: stats.sets,
  //   evictions: stats.evictions,
  //   currentSize: cache.size(),
  //   hitRatio: hitRatio.toFixed(2) + "%",
  // });
  // !--------------------
}, 60000); // 5 minutes

// В cache.js мониторинг памяти
setInterval(() => {
  const used = process.memoryUsage();
  logger.info(
    `Memory usage - RSS: ${Math.round(
      used.rss / 1024 / 1024
    )}MB, Heap: ${Math.round(used.heapUsed / 1024 / 1024)}MB`
  );
}, 60000);

module.exports = { cache };
