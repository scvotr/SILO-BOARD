"use strict";

const { executeTableCreation } = require("./executeTableCreation");
const { ensureIndexes } = require("./ensureIndexes");
const { logger } = require("../../../utils/logger");

const createTableFactory = (tableName, tableQuery, indexQueries) => {
  return async (allowDrop = false, forceDrop = false) => {
    await executeTableCreation(tableName, tableQuery, allowDrop, forceDrop);
    
    if (forceDrop) {
      // Таблица удалена навсегда - индексы не нужны
      logger.info(`Table ${tableName} was force dropped - skipping indexes`);
      return;
    }

    if (allowDrop) {
      // Таблица пересоздана - НУЖНО создать индексы!
      logger.info(`Table ${tableName} was recreated - creating indexes`);
      await ensureIndexes(tableName, indexQueries);
      return;
    }
  };
};

module.exports = {
  createTableFactory,
};
