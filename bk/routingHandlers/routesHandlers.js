"use strict";

const { adminRoutesHandle } = require("../routeHandlers/admin/adminRoutesHandle");
const { authRoutesHandle } = require("../routeHandlers/auth/authRoutesHandle");
const { devicesRoutesHandle } = require("../routeHandlers/devices/devicesRoutesHandle");

const routesHandlers = [
  { prefix: "/auth", handler: authRoutesHandle },
  { prefix: "/admin", handler: adminRoutesHandle },
  { prefix: "/devices", handler: devicesRoutesHandle },
];

module.exports = { routesHandlers };
