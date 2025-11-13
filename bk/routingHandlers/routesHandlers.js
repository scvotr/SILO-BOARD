"use strict";

const { adminRoutesHandle } = require("../routesHandlers/admin/adminRoutesHandle");
const { authRoutesHandle } = require("../routesHandlers/auth/authRoutesHandle");
const { devicesRoutesHandle } = require("../routesHandlers/devices/devicesRoutesHandle");

const routesHandlers = [
  { prefix: "/auth", handler: authRoutesHandle },
  { prefix: "/admin", handler: adminRoutesHandle },
  { prefix: "/devices", handler: devicesRoutesHandle },
];

module.exports = { routesHandlers };
