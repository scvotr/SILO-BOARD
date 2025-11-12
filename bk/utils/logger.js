// utils/logger.js
"use strict";

const winston = require("winston");

/**
 * Кастомные уровни логирования
 */
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    httpReq: 3, // ← Уровень для HTTP запросов
    infoAuth: 4,
    warnAuth: 5,
    errorAuth: 6,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    httpReq: "cyan", // ← Цвет для HTTP запросов
    infoAuth: "blue",
    warnAuth: "orange",
    errorAuth: "magenta",
  },
};

winston.addColors(customLevels.colors);

/**
 * Основной логгер приложения
 */
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Консоль - видим от httpReq и ВЫШЕ (httpReq, info, warn, error)
    new winston.transports.Console({
      level: "httpReq",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),

    // ⬇️ HTTP запросы - ТОЛЬКО уровень httpReq
    new winston.transports.File({
      filename: "logs/httpReq.log",
      level: "httpReq", // ✅ ТОЛЬКО httpReq
    }),

    // ⬇️ Ошибки - ТОЛЬКО error и выше
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error", // ✅ ТОЛЬКО error
    }),

    // ⬇️ Auth ошибки
    new winston.transports.File({
      filename: "logs/errorAuth.log",
      level: "errorAuth", // ✅ ТОЛЬКО errorAuth
    }),

    // ⬇️ Auth предупреждения
    new winston.transports.File({
      filename: "logs/warnAuth.log",
      level: "warnAuth", // ✅ ТОЛЬКО warnAuth
    }),

    // ⬇️ Combined - ВСЕ КРОМЕ httpReq
    new winston.transports.File({
      filename: "logs/combined.log",
      level: "info", // ✅ info, warn, error (но НЕ httpReq)
    }),
  ],
});

// Кастомные методы
logger.infoAuth = function (message, meta) {
  this.log("infoAuth", message, meta);
};

logger.warnAuth = function (message, meta) {
  this.log("warnAuth", message, meta);
};

logger.errorAuth = function (message, meta) {
  this.log("errorAuth", message, meta);
};

// ⬇️ ИСПРАВЛЕННЫЙ метод для HTTP запросов
logger.httpReq = function (message, meta) {
  // ← Теперь httpReq
  this.log("httpReq", message, meta); 
};

module.exports = { logger };
