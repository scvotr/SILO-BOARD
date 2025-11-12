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
  requestLogger(req, res, () => {});
  corsMiddleware(req, res);
  
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

// if (req.url === "/stats" && req.method === "GET") {
//   res.writeHead(200, { "Content-Type": "application/json" });
//   res.end(
//     JSON.stringify({
//       server: "running",
//       sockets: socketManager.getStats(),
//     })
//   );
// } else {
//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.end("Hello World!");
// }

// res.setHeader("Access-Control-Allow-Origin", "*");
// res.setHeader(
//   "Access-Control-Allow-Methods",
//   "GET, POST, PUT, DELETE, OPTIONS"
// );
// res.setHeader(
//   "Access-Control-Allow-Headers",
//   "Content-Type, Authorization, X-Requested-With"
// );
// res.setHeader("Access-Control-Max-Age", "86400");
