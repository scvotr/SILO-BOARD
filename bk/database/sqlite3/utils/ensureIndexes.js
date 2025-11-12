"use strict";

const { logger } = require("../../../utils/logger");
const { execSql } = require("./execSql");
const { validateTableName } = require("./isValidTableName");

/**
 * Обеспечивает существование индексов для таблицы
 * @param {string} tableName - Название таблицы
 * @param {string[]} indexQueries - Массив SQL запросов для создания индексов
 */
const ensureIndexes = async (tableName, indexQueries) => {
  // ✅ ВАЛИДАЦИЯ ИМЕНИ ТАБЛИЦЫ
  validateTableName(tableName); // 🛡️ ЗАЩИТА

  logger.info(`Ensuring indexes for ${tableName} table...`);

  for (const indexQuery of indexQueries) {
    try {
      await execSql(indexQuery);
    } catch (error) {
      logger.error(`Failed to ensure index for ${tableName}: ${error.message}`);
    }
  }
  logger.info(`✅ Indexes for ${tableName} are ensured`);
};

module.exports = { ensureIndexes };
