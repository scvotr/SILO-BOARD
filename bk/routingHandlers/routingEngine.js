"use strict";

const { handleNotFound } = require("./handleNotFound");
const { routesHandlers } = require("./routesHandlers");
const { logger } = require("../utils/logger");

const getClientIp = (req) => {
  try {
    const xff = req.headers["x-forwarded-for"];
    if (xff) {
      const firstIp =
        typeof xff === "string" ? xff.split(",")[0].trim() : xff[0];
      return firstIp || "unknown";
    }
    return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
  } catch (error) {
    logger.warn("Failed to get client IP", { error: error.message });
    return "unknown";
  }
};

const routingEngine = async (req, res) => {
  const { url, method } = req;

  const clientIP = getClientIp(req);

  let routeHandled = false;

  for (const { prefix, handler } of routesHandlers) {
    if (url.startsWith(prefix)) {
      logger.httpReq(`🎯 ROUTE_MATCH: ${method} ${url}`, {
        type: "route_match",
        ip: clientIP,
        method: method,
        url: url,
        prefix: prefix,
        handler: handler.name || "anonymous",
      });

      await handler(req, res);
      routeHandled = true;
      break;
    }
  }

  if (!routeHandled) {
    logger.httpReq(`❌ ROUTE_NOT_FOUND: ${method} ${url}`, {
      type: "route_not_found",
      ip: clientIP,
      method: method,
      url: url,
      availablePrefixes: routesHandlers.map((r) => r.prefix),
    });
    await handleNotFound(req, res);
  }
};

module.exports = { routingEngine };
