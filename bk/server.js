"use strict";

const http = require("http");
const { serverErrorHandler } = require("./serverErrorHandler");
const { logger } = require("./utils/logger");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World!");
});

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

const startServer = async () => {
  return new Promise((resolve, reject) => {
    server
      .listen({ host, port })
      .on("listening", () => {
        const address = server.address();
        logger.info(`Сервер запущен на адресе ${address.address}:${address.port}`)
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
