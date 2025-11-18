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
