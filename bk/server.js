"use strict";

const http = require("http");
const { serverErrorHandler } = require("./serverErrorHandler");
const { logger } = require("./utils/logger");
const config = require("./config");
const { socketManager } = require("./socket/socketManager");
const { socketEngine } = require("./socket/socketEngine");
const { initDatabase } = require("./database/sqlite3/initDatabase");
const { setupGracefulShutdown } = require("./gracefulShutdown");
const {
  initializeAllTables,
} = require("./database/sqlite3/utils/tableInitializer");
const { routingEngine } = require("./routingHandlers/routingEngine");
const {
  handleRequestErrors,
} = require("./routingHandlers/handleRequestErrors");
const { corsMiddleware } = require("./middleware/corsMiddleware");
const { requestLogger } = require("./middleware/requestLogger");

const server = http.createServer(async (req, res) => {
  // 1. 🔒 CORS СРАЗУ и проверяем OPTIONS
  const isOptionsHandled = corsMiddleware(req, res);
  // 2. Если это OPTIONS - прерываем цепочку
  if (isOptionsHandled) {
    return; // OPTIONS уже обработан, выходим
  }
  
  await requestLogger(req, res, () => {});

  try {
    await routingEngine(req, res);
  } catch (error) {
    await handleRequestErrors(res, error);
  }
});

const { host, port } = config.server;

const startServer = async () => {
  const dbSuccess = await initDatabase();
  if (!dbSuccess) throw new Error("Database initialization failed");

  await initializeAllTables();
  if (!dbSuccess) {
    throw new Error("Database initialization failed");
  }

  return new Promise((resolve, reject) => {
    server
      .listen({ host, port })
      .on("listening", () => {
        const address = server.address();
        logger.info(
          `Сервер запущен на адресе ${address.address}:${address.port}`
        );
        try {
          const io = socketManager.initSocket(server);
          socketEngine(io);
          logger.info("Socket.IO engine initialized successfully");
          setupGracefulShutdown(server, io);
          resolve(); // ✅ Успех только после инициализации сокетов
        } catch (error) {
          logger.error("Socket initialization failed:", error);
          server.close();
          reject(new Error("Socket.IO initialization failed")); // ✅ Пробрасываем ошибку
        }
      })
      .on("error", (error) => {
        logger.error("Server startup error:", error);
        reject(error);
      });
  });
};

startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  serverErrorHandler(error, port, host);
});
