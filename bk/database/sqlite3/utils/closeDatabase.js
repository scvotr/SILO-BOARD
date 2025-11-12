const { logger } = require("../../../utils/logger");
const { db } = require("../initDatabase");

const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    db.close((err) => {
      if (err) {
        logger.error("Error closing database:", err);
        reject(err);
      } else {
        // logger.info("Database connection closed");
        resolve();
      }
    });
  });
};

module.exports = { closeDatabase };
