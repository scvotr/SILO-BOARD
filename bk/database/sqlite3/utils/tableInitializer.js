"use strict";

const { logger } = require("../../../utils/logger");
const {
  createAllNoriaTables,
} = require("../models/PLC/devices/elevators/createAllNoriaTables");

const initializeAllTables = async () => {
  try {
    logger.info("🗃️ Starting database tables creation...");

    await createAllNoriaTables();

    logger.info("✅ All tables created successfully");
    return true;
  } catch (error) {
    logger.error("❌ Error creating tables:", error);
    throw error;
  }
};

module.exports = { initializeAllTables };
