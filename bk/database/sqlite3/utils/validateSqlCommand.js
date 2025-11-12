"use strict";

const { logger } = require("../../../utils/logger");

// ✅ ФУНКЦИЯ ВАЛИДАЦИИ SQL КОМАНД
const validateSqlCommand = (command, params) => {
  // Проверяем что команда не содержит опасных конструкций
  const dangerousPatterns = [
    /;/g, // multiple statements
    /--/g, // SQL comments
    /\/\*.*\*\//g, // block comments
    // !---------------
    // /DROP\s+TABLE/i,
    // /DELETE\s+FROM/i,
    // /UPDATE\s+.+\s+SET/i,
    // /INSERT\s+INTO/i,
    // /ALTER\s+TABLE/i,
    // !---------------
  ];

  const upperCommand = command.toUpperCase();

  // Если это SELECT запрос, запрещаем модифицирующие операции
  if (
    upperCommand.includes("SELECT") &&
    (upperCommand.includes("DROP") ||
      upperCommand.includes("DELETE") ||
      upperCommand.includes("INSERT") ||
      upperCommand.includes("UPDATE"))
  ) {
    throw new Error(
      "Potential SQL injection detected: mixed SELECT with DML operations"
    );
  }

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      logger.warn(`Potential SQL injection detected: ${pattern}`);
      throw new Error(`Potential SQL injection detected: ${pattern}`);
    }
  }
};

module.exports = { validateSqlCommand };
