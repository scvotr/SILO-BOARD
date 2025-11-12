"use strict";

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { logger } = require("../../utils/logger");

const dbPath = path.join(__dirname, "./../../database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error("Error connecting to database:", err);
  } else {
    logger.info("✅ Connected to SQLite database");
    db.run("PRAGMA foreign_keys = ON");
    //! db.run("PRAGMA journal_mode = WAL"); // ❌ ОТКЛЮЧЕНО (для разработки)
    db.run("PRAGMA busy_timeout = 5000");
    db.run("PRAGMA synchronous = NORMAL"); // Баланс производительности/надежности
    db.run("PRAGMA cache_size = -64000"); // Кэш 64MB
  }
});

const initDatabase = async () => {
  try {
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
