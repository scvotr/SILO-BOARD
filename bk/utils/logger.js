"use strict";

const winston = require("winston");

/**
 * Кастомные уровни логирования
 * @namespace
 * @property {Object} levels - Уровни логирования (0 - высший приоритет)
 * @property {number} levels.error - Критические ошибки (0)
 * @property {number} levels.warn - Предупреждения (1)
 * @property {number} levels.info - Информационные сообщения (2)
 * @property {number} levels.infoAuth - Успешная аутентификация (3)
 * @property {number} levels.warnAuth - Подозрительная активность (4)
 * @property {number} levels.errorAuth - Ошибки аутентификации (5)
 * @property {Object} colors - Цвета для консоли
 * @property {string} colors.error - 🔴 Красный для ошибок
 * @property {string} colors.warn - 🟡 Желтый для предупреждений
 * @property {string} colors.info - 🟢 Зеленый для информации
 * @property {string} colors.infoAuth - 🔵 Синий для аутентификации
 * @property {string} colors.warnAuth - 🟠 Оранжевый для предупреждений аутентификации
 * @property {string} colors.errorAuth - 🟣 Пурпурный для ошибок аутентификации
 */

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    infoAuth: 3,
    warnAuth: 4,
    errorAuth: 5,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    infoAuth: "blue",
    warnAuth: "orange",
    errorAuth: "magenta",
  },
};

winston.addColors(customLevels.colors);
/**
 * Основной логгер приложения
 * @class
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
  levels: customLevels.levels,
  // Убираем конфликтующие форматы
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json() // Либо JSON, либо простой текст - выбираем один
  ),
  transports: [
    /**
     * Транспорт для консоли - цветной вывод
     * @type {winston.transports.Console}
     */
    new winston.transports.Console({
      level: "info",
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
    /**
     * Транспорт для файла ошибок
     * @type {winston.transports.File}
     */
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    /**
     * Транспорт для ошибок аутентификации
     * @type {winston.transports.File}
     */
    new winston.transports.File({
      filename: "logs/errorAuth.log",
      level: "errorAuth",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    /**
     * Транспорт для предупреждений аутентификации
     * @type {winston.transports.File}
     */
    new winston.transports.File({
      filename: "logs/warnAuth.log",
      level: "warnAuth",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    /**
     * Транспорт для всех логов
     * @type {winston.transports.File}
     */
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
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

module.exports = { logger };
