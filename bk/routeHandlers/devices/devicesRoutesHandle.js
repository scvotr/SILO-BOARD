"use strict";

const DevicesController = require("../../controllers/devices/devicesController");
const { createRoutesHandler } = require("../utils/createRoutesHandler");

const routes = {
  "/devices/connection": DevicesController.testResponse,
  "/devices/api/devices": DevicesController.testResponse,
};

const devicesRoutesHandle = createRoutesHandler(routes, "devicesRoutesHandle");

module.exports = {
  devicesRoutesHandle,
};
