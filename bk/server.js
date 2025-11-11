"use strict";

const http = require("http");
const { serverErrorHandler } = require("./serverErrorHandler");
const { logger } = require("./utils/logger");
const config = require("./config");
const { socketManager } = require("./socket/socketManager");
const { socketEngine } = require("./socket/socketEngine");
const { initDatabase } = require("./database/sqlite3/initDatabase");

const server = http.createServer((req, res) => {
  if (req.url === "/stats" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        server: "running",
        sockets: socketManager.getStats(),
      })
    );
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World!");
  }
});

const { host, port } = config.server;

const startServer = async () => {
  // ИНИЦИАЛИЗИРУЕМ БАЗУ ДАННЫХ
  const dbSuccess = await initDatabase();
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
        } catch (error) {
          logger.error("Socket initialization failed:", error);
        }
        resolve();
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
