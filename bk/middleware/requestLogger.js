"use strict";

const { logger } = require("../utils/logger");

/**
 * Middleware для логирования HTTP запросов
 */
const requestLogger = async (req, res, next) => {
  const startTime = Date.now();
  const { method, url, socket, headers } = req;

  // Получаем IP клиента
  const clientIP =
    headers["x-forwarded-for"] || headers["x-real-ip"] || socket.remoteAddress;

  // Логируем входящий запрос
  logger.httpReq(`→ INCOMING: ${method} ${url}`, {
    ip: clientIP,
    userAgent: headers["user-agent"],
    timestamp: new Date().toISOString(),
  });

  // Перехватываем отправку ответа для логирования результата
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;

    // Логируем исходящий ответ
    logger.httpReq(`← RESPONSE: ${method} ${url} ${res.statusCode}`, {
      ip: clientIP,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.getHeader("content-length") || "unknown",
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = { requestLogger };
