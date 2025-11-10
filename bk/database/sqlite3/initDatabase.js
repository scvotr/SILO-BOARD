"use strict";

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { logger } = require("../../utils/logger");

// ✅ СОЗДАЕМ СОЕДИНЕНИЕ ОДИН РАЗ
const dbPath = path.join(__dirname, "./../../database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error("Error connecting to database:", err);
  } else {
    logger.info("✅ Connected to SQLite database");
    // Включаем foreign keys
    db.run("PRAGMA foreign_keys = ON");
  }
});

const initDatabase = async () => {
  try {
    // await createTables();
    logger.info("✅ Database initialization completed");
    return true;
  } catch (error) {
    logger.error("❌ Database initialization failed:", error);
    return false;
  }
};

module.exports = {
  initDatabase,
  db,
};
