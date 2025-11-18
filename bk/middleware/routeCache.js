"use strict";

const { cache } = require("../utils/cache");
const { logger } = require("../utils/logger");

/**
 * Middleware to cache entire route responses
 * @param {number} ttl - Time to live in milliseconds
 * @param {function} keyGenerator - Function to generate cache key from request
 */
const routeCache = (ttl = 1000 * 60 * 5, keyGenerator = null) => {
  return async (req, res, next) => {
    const startTime = Date.now();

    // Generate cache key based on URL and method by default
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `route:${req.method}:${req.url}:${JSON.stringify(req.body || {})}`;

    // Try to get response from cache
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      const duration = Date.now() - startTime;

      // Гарантированный вывод всей информации
      const logData = {
        type: "cache_hit",
        duration: `${duration}ms`,
        statusCode: cachedResponse.statusCode,
        cacheKey: cacheKey,
        ttl: ttl,
        ip:
          req.headers["x-forwarded-for"] ||
          req.socket?.remoteAddress ||
          "unknown",
      };

      logger.httpReq(
        `⚡ CACHED ${req.method} ${req.url} - ${duration}ms`,
        logData
      );
      // console.log(`⚡ CACHED ${req.method} ${req.url}`, logData); // Дублируем в console.log для гарантии

      // Set cached headers and send cached body
      Object.keys(cachedResponse.headers).forEach((header) => {
        res.setHeader(header, cachedResponse.headers[header]);
      });

      res.writeHead(cachedResponse.statusCode);
      res.end(cachedResponse.body);
      return;
    }

    // If not in cache, log DIRECT immediately and proceed
    const durationBeforeHandler = Date.now() - startTime;

    const directLogData = {
      type: "cache_miss",
      duration: `${durationBeforeHandler}ms`,
      statusCode: "processing",
      cacheKey: cacheKey,
      ttl: ttl,
      ip:
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "unknown",
    };

    logger.httpReq(
      `🔄 DIRECT ${req.method} ${req.url} - ${durationBeforeHandler}ms`,
      directLogData
    );
    // console.log(`🔄 DIRECT ${req.method} ${req.url}`, directLogData); // Дублируем в console.log

    // If not in cache, capture the response to store it
    const originalWriteHead = res.writeHead;
    const originalEnd = res.end;
    let statusCode = 200;
    let responseHeaders = {};
    let responseBody = "";

    res.writeHead = function (status, headers) {
      statusCode = status;
      responseHeaders = { ...headers };
      return originalWriteHead.call(this, status, headers);
    };

    res.end = function (chunk, encoding) {
      if (chunk) {
        responseBody = chunk instanceof Buffer ? chunk.toString() : chunk;
      }

      const totalDuration = Date.now() - startTime;

      // Only cache successful responses (2xx status codes)
      if (statusCode >= 200 && statusCode < 300) {
        // Store response in cache
        const cacheResponse = {
          statusCode,
          headers: responseHeaders,
          body: responseBody,
          timestamp: Date.now(),
        };

        cache.set(cacheKey, cacheResponse, ttl);

        const setLogData = {
          type: "cache_set",
          duration: `${totalDuration}ms`,
          statusCode: statusCode,
          cacheKey: cacheKey,
          ttl: ttl,
          ip:
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress ||
            "unknown",
        };

        logger.httpReq(
          `✅ CACHE_SET ${req.method} ${req.url} - ${totalDuration}ms`,
          setLogData
        );
        // console.log(`✅ CACHE_SET ${req.method} ${req.url}`, setLogData); // Дублируем в console.log
      } else {
        const errorLogData = {
          type: "no_cache_error",
          duration: `${totalDuration}ms`,
          statusCode: statusCode,
          reason: "Non-2xx status code",
          ip:
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress ||
            "unknown",
        };

        logger.httpReq(
          `🚫 NO_CACHE ${req.method} ${req.url} - ${totalDuration}ms`,
          errorLogData
        );
        // console.log(`🚫 NO_CACHE ${req.method} ${req.url}`, errorLogData); // Дублируем в console.log
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

module.exports = { routeCache };
