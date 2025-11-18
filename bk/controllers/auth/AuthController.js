"use strict";

const { cache } = require("../../utils/cache");
const { logger } = require("../../utils/logger");
const { cachedDb } = require("../../database/sqlite3/utils/cachedDb");

class AuthController {
  constructor() {
    this.tokenCacheTTL = 1000 * 60 * 15; // 15 minutes for token validation
    this.userCacheTTL = 1000 * 60 * 30; // 30 minutes for user data
    this.failedAttemptsTTL = 1000 * 60 * 15; // 15 minutes for failed login attempts
  }

  async testResponse(req, res) {
    const { method } = req;

    if (method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: "AuthController API is working! 🚀",
          data: {
            devices: ["PLC_001", "PLC_002"],
            timestamp: new Date().toISOString(),
            cacheEnabled: true,
          },
        })
      );
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Method not allowed",
          allowedMethods: ["GET"],
        })
      );
    }
  }

  /**
   * Validate JWT token with caching
   * @param {string} token - JWT token to validate
   * @returns {Promise<Object>} User data if valid, null if invalid
   */
  async validateTokenWithCache(token) {
    if (!token) return null;

    const cacheKey = `auth:token:${token}`;
    let cachedResult = cache.get(cacheKey);

    if (cachedResult !== undefined) {
      logger.infoAuth(`Token validation cached: ${token.substring(0, 10)}...`);
      return cachedResult;
    }

    // Simulate token validation (in a real system, you would decode and validate the JWT)
    try {
      // In a real implementation, this would be the actual token validation
      const userData = await this._validateToken(token);

      if (userData) {
        // Cache the user data for this token
        cache.set(cacheKey, userData, this.tokenCacheTTL);
        logger.infoAuth(
          `Token validated and cached: ${token.substring(0, 10)}...`
        );
        return userData;
      }
    } catch (error) {
      logger.errorAuth(`Token validation failed: ${error.message}`);
    }

    // Cache negative result briefly to prevent repeated validation attempts
    cache.set(cacheKey, null, 1000 * 60); // Cache invalid tokens for 1 minute
    return null;
  }

  /**
   * Validate JWT token (placeholder implementation)
   * @private
   */
  async _validateToken(token) {
    // In a real implementation, this would decode and validate the JWT token
    // For now, return a mock user if token is not empty
    if (token && token.length > 10) {
      // Simulate fetching user from database or other service
      const userId = `user_${Date.now() % 1000}`;
      return {
        id: userId,
        username: `user_${Date.now() % 1000}`,
        role: "user",
        exp: Date.now() + this.tokenCacheTTL,
      };
    }
    return null;
  }

  /**
   * Get user data with caching
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserWithCache(userId) {
    if (!userId) return null;

    const cacheKey = `auth:user:${userId}`;
    let cachedResult = cache.get(cacheKey);

    if (cachedResult !== undefined) {
      logger.infoAuth(`User data cached: ${userId}`);
      return cachedResult;
    }

    try {
      // Simulate fetching user from database (would use cachedDb in real scenario)
      const userData = await this._fetchUser(userId);

      if (userData) {
        cache.set(cacheKey, userData, this.userCacheTTL);
        logger.infoAuth(`User data fetched and cached: ${userId}`);
        return userData;
      }
    } catch (error) {
      logger.errorAuth(`Error fetching user data: ${error.message}`);
    }

    return null;
  }

  /**
   * Fetch user from database (placeholder implementation)
   * @private
   */
  async _fetchUser(userId) {
    // In a real implementation, this would query the database
    return {
      id: userId,
      username: `user_${userId}`,
      email: `user${userId}@example.com`,
      role: "user",
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Track failed login attempts to prevent brute force
   * @param {string} identifier - User identifier (email, username, IP)
   */
  async trackFailedAttempt(identifier) {
    const cacheKey = `auth:failed:${identifier}`;
    const currentAttempts = cache.get(cacheKey) || 0;
    const newAttempts = currentAttempts + 1;

    // Cache the new attempt count with TTL
    cache.set(cacheKey, newAttempts, this.failedAttemptsTTL);

    logger.warnAuth(
      `Failed login attempt for ${identifier} (${newAttempts} attempts)`
    );

    // Return true if threshold exceeded
    return newAttempts > 5; // Block after 5 failed attempts
  }

  /**
   * Check if user is locked out due to failed attempts
   * @param {string} identifier - User identifier
   * @returns {boolean} True if locked out
   */
  async isLockedOut(identifier) {
    const cacheKey = `auth:failed:${identifier}`;
    const attempts = cache.get(cacheKey) || 0;
    return attempts > 5;
  }

  /**
   * Clear failed attempt counter
   * @param {string} identifier - User identifier
   */
  clearFailedAttempts(identifier) {
    const cacheKey = `auth:failed:${identifier}`;
    cache.delete(cacheKey);
  }
}

module.exports = new AuthController();
