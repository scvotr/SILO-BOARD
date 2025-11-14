"use strict";

const { handleNotFound } = require("../../routingHandlers/handleNotFound");
const { logger } = require("../../utils/logger");

/**
 * Фабрика для создания обработчиков маршрутов
 * @param {Object} routes - Объект с маршрутами и их обработчиками
 * @param {string} handlerName - Имя обработчика для логирования ошибок
 * @returns {Function} Middleware функция для обработки HTTP запросов
 *
 * @example
 * const routes = {
 *   "/admin/users": AdminController.getUsers,
 *   "/admin/settings": AdminController.getSettings
 * };
 * const adminHandler = createRoutesHandler(routes, "adminHandler");
 *
 * Использование в routing:
 * app.use("/admin", adminHandler);
 */

const createRoutesHandler = (routes, handlerName) => {
  /**
   * Middleware функция для обработки HTTP запросов
   * @param {Object} req - HTTP запрос
   * @param {Object} res - HTTP ответ
   */
  return async (req, res) => {
    const { url, method } = req;

    try {
      const routeHandler = routes[url];
      if (routeHandler) {
        if (method === "POST" || method === "GET") {
          await routeHandler(req, res); // ✅ Маршрут+POST
        } else {
          await handleNotFound(req, res); // ✅ Маршрут+неPOST
        }
      } else {
        await handleNotFound(req, res); // ✅ Нет маршрута
      }
    } catch (error) {
      logger.error(`${handlerName} - error`);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: `${handlerName} - ERROR` }));
    }
  };
};

module.exports = { createRoutesHandler };
