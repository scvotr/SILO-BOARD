"use strict";

const AuthController = require("../../controllers/auth/AuthController");
const { createRoutesHandler } = require("../utils/createRoutesHandler");

const routes = {
  "/auth/connection": AuthController.testResponse,
  "/auth/api/auth": AuthController.testResponse,
};

const authRoutesHandle = createRoutesHandler(routes, "authRoutesHandle");

module.exports = {
  authRoutesHandle,
};
//   const { url, method } = req;

//   try {
//     const routeHandler = routes[url];
//     if (routeHandler) {
//       if (method === "POST") {
//         await routeHandler(req, res); // ✅ Маршрут+POST
//       } else {
//         await handleNotFound(req, res); // ✅ Маршрут+неPOST
//       }
//     } else {
//       await handleNotFound(req, res); // ✅ Нет маршрута
//     }
//   } catch (error) {
//     res.statusCode = 500;
//     res.setHeader("Content-Type", "application/json");
//     res.end(JSON.stringify({ error: "authRoutesHandle - ERROR" }));
//   }
// };
