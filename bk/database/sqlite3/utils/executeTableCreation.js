"use strict";

const { logger } = require("../../../utils/logger");
const { execSql } = require("./execSql");
const { validateTableName } = require("./isValidTableName");

const executeTableCreation = async (
  tableName,
  createTableQuery,
  allowDrop,
  forceDrop
) => {
  // ✅ ВАЛИДАЦИЯ ИМЕНИ ТАБЛИЦЫ
  validateTableName(tableName); // 🛡️ ЗАЩИТА

  try {
    if (forceDrop) {
      logger.warn(`Table ${tableName} forceDrop.`);
      await execSql("PRAGMA foreign_keys = OFF", []);
      await execSql(`DROP TABLE IF EXISTS ${tableName}`, []);
      await execSql("PRAGMA foreign_keys = ON", []);
      return;
    }
    if (allowDrop) {
      logger.warn(`Dropping table ${tableName}.`);
      await execSql(`DROP TABLE IF EXISTS ${tableName}`, []);
    }
    await execSql(createTableQuery, []);
  } catch (error) {
    logger.warn(`DB ERROR (${tableName}): `, error);
    throw new Error(`Failed to create ${tableName} table`);
  }
};

module.exports = {
  executeTableCreation,
};

// USAGE

// const createAllMotorTables = async (allowDrop = false) => {
//     await createMotorsNameTable(allowDrop); // Передаем параметр разрешения удаления
//     await createMotorsTable(allowDrop);
//     await createMotorsConfigTable(allowDrop);
//   };
