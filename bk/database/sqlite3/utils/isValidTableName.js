"use strict";

const { logger } = require("../../../utils/logger");

const validateTableName = (tableName) => {
  // Проверка регулярным выражением
  const isValidFormat = /^[a-z_][a-z0-9_]{0,62}$/i.test(tableName);
  const isNotReserved = !/^(sqlite_|pragma_)/i.test(tableName);
  const isNotTooLong = tableName.length <= 64;

  if (!isValidFormat || !isNotReserved || !isNotTooLong) {
    logger.warn(`Invalid table name: ${tableName}`);
    throw new Error(`Invalid table name: ${tableName}`);
  }

  return true; // ✅ Валидация пройдена
};

module.exports = {
  validateTableName,
};
