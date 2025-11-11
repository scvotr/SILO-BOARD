"use strict";

const { closeDatabase } = require("./database/sqlite3/utils/closeDatabase");
const { logger } = require("./utils/logger");

const setupGracefulShutdown = (httpServer, socketIO) => {
  let isShuttingDown = false;

  const gracefulShutdown = async (signal) => {
    if (isShuttingDown) {
      logger.info("Shutdown already in progress...");
      return;
    }
    isShuttingDown = true;

    logger.info(`🛑 Received ${signal}, starting graceful shutdown...`);

    try {
      // 1. WebSockets (останавливаем первыми)
      if (socketIO) {
        logger.info("Closing Socket.IO connections...");
        // !--------------------
        socketIO.emit("server_shutdown", {
          message: "Server is restarting",
        });
        // !--------------------
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await socketIO.close();
        logger.info("✅ Socket.IO server closed");
      } else {
        logger.info("Socket.IO not available, skipping...");
      }

      // 2. HTTP сервер (останавливаем вторыми)
      logger.info("Closing HTTP server...");
      await new Promise((resolve) => {
        httpServer.close(() => {
          logger.info("✅ HTTP server closed");
          resolve();
        });

        // Таймаут на закрытие сервера
        setTimeout(() => {
          logger.warn("HTTP server close timeout, forcing exit");
          resolve();
        }, 10000);
      });

      // 3. База данных (останавливаем последней)
      logger.info("Closing database connection...");
      await closeDatabase();
      logger.info("✅ Database connection closed");

      logger.info("🎉 Graceful shutdown completed successfully");
      process.exit(0);
    } catch (error) {
      logger.error("❌ Error during graceful shutdown:", error);
      process.exit(1);
    }
  };

  // Обработчики сигналов
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Обработка непредвиденных ошибок
  process.on("uncaughtException", (error) => {
    logger.error("💥 Uncaught Exception:", error);
    gracefulShutdown("UNCAUGHT_EXCEPTION");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("UNHANDLED_REJECTION");
  });
};

module.exports = { setupGracefulShutdown };
