"use strict";

const { logger } = require("../../utils/logger");

class UserSocketPool {
  constructor() {
    this.userPool = new Map(); // userId -> socketIds[]
    this.socketToUser = new Map(); // socketId -> userId
  }
  async addUser(userId, socketId) {
    try {
      if (!this.userPool.has(userId)) {
        this.userPool.set(userId, new Set());
      }

      this.userPool.get(userId).add(socketId);
      this.socketToUser.set(socketId, userId);

      await logger.info(`✅ User ${userId} added to cache`, {
        userId,
        socketId,
        totalUsers: this.userPool.size,
        userSockets: this.userPool.get(userId).size,
      });

      await this.logStats();

      return { success: true, userId, socketId };
    } catch (error) {
      await logger.error("Failed to add user to cache", {
        error: error.message,
        userId,
        socketId,
      });
      throw error;
    }
  }
  async removeUser(socketId) {
    try {
      const userId = this.socketToUser.get(socketId);

      if (!userId) {
        await logger.warn(`❌ Socket ${socketId} not found in cache`);
        return { success: false, reason: "Socket not found" };
      }

      // Удаляем socketId из пользователя
      const userSockets = this.userPool.get(userId);
      if (userSockets) {
        userSockets.delete(socketId);

        // Если у пользователя не осталось сокетов - удаляем его
        if (userSockets.size === 0) {
          this.userPool.delete(userId);
        }
      }

      this.socketToUser.delete(socketId);

      await logger.info(`🗑️ User ${userId} socket removed`, {
        userId,
        socketId,
        remainingSockets: userSockets ? userSockets.size : 0,
        totalUsers: this.userPool.size,
      });

      await this.logStats();

      return { success: true, userId, socketId };
    } catch (error) {
      await logger.error("Failed to remove user from cache", {
        error: error.message,
        socketId,
      });
      throw error;
    }
  }
  async getUserSockets(userId) {
    // Может стать асинхронным при интеграции с Redis
    return this.userPool.get(userId) || new Set();
  }
  async isUserOnline(userId) {
    // Может проверять в базе данных
    return this.userPool.has(userId) && this.userPool.get(userId).size > 0;
  }
  async getUserId(socketId) {
    return this.socketToUser.get(socketId);
  }
  async getOnlineUsers() {
    return Array.from(this.userPool.keys());
  }
  async getOnlineCount() {
    return this.userPool.size;
  }
  async getStats() {
    return {
      totalUsers: this.userPool.size,
      totalSockets: this.socketToUser.size,
      onlineUsers: await this.getOnlineUsers(),
      detailedStats: Array.from(this.userPool.entries()).map(
        ([userId, sockets]) => ({
          userId,
          socketCount: sockets.size,
          socketIds: Array.from(sockets),
        })
      ),
    };
  }
  async logStats() {
    try {
      const stats = await this.getStats();
      await logger.info("📊 User Socket Pool Stats", stats);
    } catch (error) {
      await logger.error("Failed to log pool stats", { error: error.message });
    }
  }
  async clear() {
    try {
      this.userPool.clear();
      this.socketToUser.clear();
      await logger.info("🧹 User Socket Pool cleared");
    } catch (error) {
      await logger.error("Failed to clear pool", { error: error.message });
      throw error;
    }
  }
}

module.exports = new UserSocketPool();

// !------------------------------------
// let userSocketPool = [];

// const addUserInCache = (userId) => {
//   console.log("Добавление пользователя в кэш: ", userId);
//   if (!userSocketPool.includes(userId)) {
//     userSocketPool.push(userId);
//     console.log("Активных пользователей: ", userSocketPool);
//   }
// };

// const removeUserFromCache = (userId) => {
//   console.log("Удаление пользователя из кэша: ", userId);
//   userSocketPool = userSocketPool.filter((id) => id !== userId);
//   console.log("Активных пользователей: ", userSocketPool);
// };

// module.exports = {
//   userSocketPool,
//   addUserInCache,
//   removeUserFromCache,
// };
// !------------------------------------
