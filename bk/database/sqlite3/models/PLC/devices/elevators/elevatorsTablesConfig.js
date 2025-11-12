"use strict";

const { createTableFactory } = require("../../../../utils/createTableFactory");

// 🔥 КОНФИГУРАЦИЯ ТАБЛИЦ
const tableConfigs = {
  noriaPiwHistory: {
    tableName: "noria_piw_history",
    tableQuery: `
      CREATE TABLE IF NOT EXISTS noria_piw_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        device_name TEXT NOT NULL,
        value REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indexQueries: [
      "CREATE INDEX IF NOT EXISTS idx_piw_device_id ON noria_piw_history(device_id)",
      "CREATE INDEX IF NOT EXISTS idx_piw_timestamp ON noria_piw_history(timestamp)",
      "CREATE INDEX IF NOT EXISTS idx_piw_device_timestamp ON noria_piw_history(device_id, timestamp)",
    ],
  },

  noriaDeviceEvents: {
    tableName: "noria_device_events",
    tableQuery: `
      CREATE TABLE IF NOT EXISTS noria_device_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        device_name TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    indexQueries: [
      "CREATE INDEX IF NOT EXISTS idx_events_device_id ON noria_device_events(device_id)",
      "CREATE INDEX IF NOT EXISTS idx_events_timestamp ON noria_device_events(timestamp)",
      "CREATE INDEX IF NOT EXISTS idx_events_device_timestamp ON noria_device_events(device_id, timestamp)",
    ],
  },
};

// 🔥 СОЗДАЕМ ФУНКЦИИ ЧЕРЕЗ ФАБРИКУ
const createNoriaPiwHistoryTable = createTableFactory(
  tableConfigs.noriaPiwHistory.tableName,
  tableConfigs.noriaPiwHistory.tableQuery,
  tableConfigs.noriaPiwHistory.indexQueries
);

const createNoriaDeviceEventsTable = createTableFactory(
  tableConfigs.noriaDeviceEvents.tableName,
  tableConfigs.noriaDeviceEvents.tableQuery,
  tableConfigs.noriaDeviceEvents.indexQueries
);

module.exports = { createNoriaPiwHistoryTable, createNoriaDeviceEventsTable };
