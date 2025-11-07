"use strict";

const http = require("http");
const { serverErrorHandler } = require("./serverErrorHandler");
const { logger } = require("./utils/logger");
const config = require("./config");
const { socketManager } = require("./socket/socketManager");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World!");
});

const { host, port } = config.server;
const io = socketManager.initSocket(server)

const startServer = async () => {
  return new Promise((resolve, reject) => {
    server
      .listen({ host, port })
      .on("listening", () => {
        const address = server.address();
        logger.info(
          `Сервер запущен на адресе ${address.address}:${address.port}`
        );
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
