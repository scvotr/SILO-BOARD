"use strict";

const { logger } = require("../utils/logger");
const { authenticateUserSocket } = require("./JWT/authenticateUserSocket");
const { setupSocketRooms } = require("./JWT/setupSocketRooms");
const UserSocketPool = require("./JWT/UserSocketPool");
const { socketHandleCustomEvents } = require("./socketHandleCustomEvents");
const { socketHandleSystemEvents } = require("./socketHandleSystemEvents");

module.exports.socketEngine = (socketIO) => {
  // ✅ ИСПОЛЬЗУЕМ АУТЕНТИФИКАЦИЮ
  // socketIO.use(authenticateUserSocket);

  socketIO.on("connection", async (socket) => {
    logger.info("✅ Client connected:", socket.id);

    try {
      // !----------------------------------
      // await UserSocketPool.addUser(socket.decoded.id, socket.id);
      // await setupSocketRooms(socket);
      
      // Отправляем приветственное сообщение
      socket.emit("message", "Welcome from server!");

      // Обрабатываем сообщения от клиента
      socket.on("client-message", (data) => {
        logger.info("📨 Message from client:", data);
        socket.emit("message", `Server received: ${data}`);
      });

      socketHandleSystemEvents(socket);
      socketHandleCustomEvents(socket);

      socket.on("disconnect", async () => {
        logger.info("❌ Client disconnected:", socket.id);
        // await UserSocketPool.removeUser(socket.id);
      });
      socket.on("error", (error) => {
        logger.error(
          `Произошла ошибка сокета ${error}`,
          socket.decoded.id,
          error
        );
      });
      // !----------------------------------
    } catch (error) {
      logger.error(`Socket connection setup failed ${error.message}`, {
        socketId: socket.id,
        error: error.message,
      });
      socket.disconnect(true);
    }
  });
};
