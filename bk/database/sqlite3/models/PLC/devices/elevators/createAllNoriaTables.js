"use strict";

const { logger } = require("../../../../../../utils/logger");

const { createNoriaDeviceEventsTable, createNoriaPiwHistoryTable } = require("./elevatorsTablesConfig");

const createAllNoriaTables = async (allowDrop = false, forceDrop = false) => {
  try {
    const startTime = Date.now();
    logger.info(
      `Noria tables: allowDrop = ${allowDrop}, forceDrop = ${forceDrop}`
    );

    await createNoriaDeviceEventsTable(allowDrop, forceDrop);
    await createNoriaPiwHistoryTable(allowDrop, forceDrop);

    const duration = Date.now() - startTime;
    logger.info(`Table creation completed in ${duration}ms successfully`);
  } catch (error) {
    logger.error("Error creating Noria tables: ", error);
    throw new Error("Failed to createAllNoriaTables!");
  }
};

module.exports = {
  createAllNoriaTables,
};
