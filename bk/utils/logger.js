"use strict";

const winston = require("winston");

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
    // Для консоли - красивый цветной вывод
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
    // Для файлов - структурированный JSON
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "logs/errorAuth.log",
      level: "errorAuth",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "logs/warnAuth.log",
      level: "warnAuth",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
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
