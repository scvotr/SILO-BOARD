"use strict";

const { logger } = require("../utils/logger");

/**
 * Middleware для централизованной обработки ошибок
 */
const handleRequestErrors = async (res, error) => {
  // 1. Проверяем, не отправлен ли уже ответ
  if (res.headersSent) {
    logger.error("Headers already sent, cannot handle error:", error.message);
    return;
  }

  // 2. Получаем IP для логирования
  const clientIP =
    res.req?.headers["x-forwarded-for"] ||
    res.req?.headers["x-real-ip"] ||
    res.req?.socket?.remoteAddress;

  // 3. Логируем ошибку
  logger.error(`Server error: ${error.message}`, {
    stack: error.stack,
    url: res.req?.url,
    method: res.req?.method,
    ip: clientIP,
    timestamp: new Date().toISOString(),
  });

  // 4. Определяем статус код
  let statusCode = 500;
  let clientMessage = "Internal Server Error";

  if (error.status && error.status >= 400 && error.status < 600) {
    statusCode = error.status;
  }

  // 5. Отправляем ошибку клиенту
  try {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json");

    const errorResponse = {
      error: {
        message: clientMessage,
        // В development добавляем детали
        ...(process.env.NODE_ENV === "development" && {
          details: error.message,
          type: error.name,
        }),
      },
    };

    res.end(JSON.stringify(errorResponse));
  } catch (sendError) {
    // Если даже отправка ошибки не удалась
    logger.error("Failed to send error response:", sendError);
  }
};

module.exports = { handleRequestErrors };
