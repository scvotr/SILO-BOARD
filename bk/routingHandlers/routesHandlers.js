"use strict";

const {
  adminRoutesHandle,
} = require("../routesHandlers/admin/adminRoutesHandle");
const { authRoutesHandle } = require("../routesHandlers/auth/authRoutesHandle");
const {
  devicesRoutesHandle,
} = require("../routesHandlers/devices/devicesRoutesHandle");

const handleFavicon = async (req, res) => {
  res.writeHead(204); // No Content - иконки нет, но это нормально
  res.end();
};

const routesHandlers = [
  { prefix: "/auth", handler: authRoutesHandle },
  { prefix: "/admin", handler: adminRoutesHandle },
  { prefix: "/devices", handler: devicesRoutesHandle },
  { prefix: "/favicon.ico", handler: handleFavicon },
];

module.exports = { routesHandlers };
