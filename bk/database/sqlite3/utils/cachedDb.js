'use strict';

const { db } = require('../initDatabase');
const { validateSqlCommand } = require('./validateSqlCommand');
const { cache } = require('../../../utils/cache');
const { logger } = require('../../../utils/logger');

/**
 * Cached database operations
 */
class CachedDatabase {
  constructor() {
    this.defaultTTL = 1000 * 60 * 5; // 5 minutes default TTL
    // Track database-specific cache statistics
    this.dbCacheStats = {
      hits: 0,
      misses: 0,
      queryCount: 0
    };
  }

  /**
   * Generate a cache key for a query
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @returns {string} Cache key
   */
  _generateCacheKey(sql, params) {
    return `db:${sql}:${JSON.stringify(params || [])}`;
  }

  /**
   * Execute a database query with caching
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @param {string} method - Database method ('all', 'get', 'run')
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<any>} Query result
   */
  async execSqlCached(sql, params = [], method = 'all', ttl = this.defaultTTL) {
    // Skip caching for write operations (run) - only cache read operations
    if (method === 'run') {
      return this._execSqlDirect(sql, params, method);
    }

    this.dbCacheStats.queryCount++;
    const cacheKey = this._generateCacheKey(sql, params);

    // Try to get from cache first
    let result = cache.get(cacheKey);

    if (result !== undefined) {
      this.dbCacheStats.hits++;
      logger.httpReq(`Cache HIT for query: ${sql}`, {
        cacheKey,
        method,
        params
      });
      return result;
    }

    this.dbCacheStats.misses++;
    // If not in cache, execute the query
    result = await this._execSqlDirect(sql, params, method);

    // Store in cache only if TTL > 0
    if (ttl > 0) {
      cache.set(cacheKey, result, ttl);
      logger.httpReq(`Cache SET for query: ${sql}`, {
        cacheKey,
        method,
        params
      });
    }

    return result;
  }

  /**
   * Direct database execution without caching
   * @private
   */
  _execSqlDirect(sql, params = [], method = 'all') {
    return new Promise((resolve, reject) => {
      try {
        if (!db) {
          return reject(new Error('Database connection not available'));
        }

        if (!['all', 'get', 'run'].includes(method)) {
          return reject(
            new Error(`Invalid method: ${method}. Use 'all', 'get', or 'run'`)
          );
        }

        // Validate SQL command for read operations
        if (method !== 'run') { // Only validate non-write operations
          validateSqlCommand(sql, params);
        }

        db[method](sql, params, (err, result) => {
          if (err) {
            logger.error(`Error executing query: ${sql}`, err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      } catch (validationError) {
        logger.error(`SQL validation failed for: ${sql}`, validationError);
        reject(validationError);
      }
    });
  }

  /**
   * Invalidate cache for a specific query
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   */
  invalidateQuery(sql, params = []) {
    const cacheKey = this._generateCacheKey(sql, params);
    cache.delete(cacheKey);
    logger.httpReq(`Cache invalidated for query: ${sql}`, {
      cacheKey,
      params
    });
  }

  /**
   * Bulk invalidate cache entries by pattern
   * @param {string} pattern - Pattern to match cache keys
   */
  invalidatePattern(pattern) {
    // For now, we'll clear all cache entries (in a real system, we'd have a more sophisticated approach)
    if (pattern.startsWith('db:')) {
      logger.info(`Clearing all database cache entries`);
      // This is a simplified approach - a real system might use a map of related keys
      const allKeys = [];
      for (const key of cache.cache.keys()) {
        if (key.startsWith('db:')) {
          allKeys.push(key);
          cache.delete(key);
        }
      }
      logger.info(`Cleared ${allKeys.length} database cache entries`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return cache.getStats();
  }

  /**
   * Get cache hit ratio
   * @returns {number} Hit ratio as percentage
   */
  getHitRatio() {
    return cache.getHitRatio();
  }

  /**
   * Get database-specific cache statistics
   * @returns {Object} Database cache statistics
   */
  getDbCacheStats() {
    return {
      ...this.dbCacheStats,
      hitRatio: this.dbCacheStats.queryCount > 0
        ? (this.dbCacheStats.hits / this.dbCacheStats.queryCount) * 100
        : 0
    };
  }
}

// Create and export a singleton instance
const cachedDb = new CachedDatabase();
module.exports = { cachedDb, CachedDatabase };