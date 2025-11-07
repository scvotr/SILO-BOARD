"use strict";

const { Server } = require("socket.io");
const { logger } = require("../utils/logger");

/**
 * Socket.IO Singleton Manager
 * @namespace socketManager
 */
module.exports.socketManager = (() => {
  let socketIO = null;
  return {
    /**
     * Инициализирует Socket.IO сервер
     * @param {http.Server} httpServer - HTTP сервер
     * @returns {Server} Socket.IO instance
     */
    initSocket(httpServer) {
      if (!httpServer) throw new Error("HTTP server is required!");
      socketIO = new Server(httpServer, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
        transports: ["websocket", "polling"],
        pingTimeout: 60000,
        pingInterval: 25000,
      });
      logger.info("Socket.IO manager initialized with custom configuration");
      return socketIO;
    },
    /**
     * Возвращает экземпляр Socket.IO
     * @returns {Server} Socket.IO instance
     */
    getSocketIO() {
      if (!socketIO)
        throw new Error("Socket.IO not initialized! Call init() first.");
      return socketIO;
    },
    /**
     * Получает статистику подключений
     * @returns {Object} Connection statistics
     */
    getStats() {
      if (!socketIO) return { initialized: false };
      const sockets = socketIO.sockets.sockets;
      return {
        initialized: true,
        connectedClients: sockets.size,
        rooms: Array.from(socketIO.sockets.adapter.rooms.keys()),
      };
    },
  };
})();
