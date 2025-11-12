// routing/routingEngine.js
"use strict";

const { handleNotFound } = require("./handleNotFound");
const { handleOptionsRequest } = require("./handleOptionsRequest");
const { routeHandlers } = require("./routeHandlers");
const { logger } = require("../utils/logger"); // ← Импортируем логер

const routingEngine = async (req, res) => {
  const { url, method } = req;

  // Получаем IP для логирования
  const clientIP =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress;

  if (method === "OPTIONS") {
    // Логируем OPTIONS запрос
    logger.httpReq(`⚡ OPTIONS: ${url}`, {
      type: "options_request",
      ip: clientIP,
      url: url,
    });

    await handleOptionsRequest(req, res);
    return;
  }

  let routeHandled = false;
  for (const { prefix, handler } of routeHandlers) {
    if (url.startsWith(prefix)) {
      // Логируем НАЙДЕННЫЙ маршрут
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
    // Логируем НЕНАЙДЕННЫЙ маршрут
    logger.httpReq(`❌ ROUTE_NOT_FOUND: ${method} ${url}`, {
      type: "route_not_found",
      ip: clientIP,
      method: method,
      url: url,
      availablePrefixes: routeHandlers.map((r) => r.prefix),
    });

    await handleNotFound(req, res);
  }
};

module.exports = { routingEngine };
