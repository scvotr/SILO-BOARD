"use strict";

const AdminController = require("../../controllers/admin/AdminController");
const { createRoutesHandler } = require("../utils/createRoutesHandler");

const routes = {
  "/admin/connection": AdminController.testResponse,
  "/admin/api/admin": AdminController.testResponse,
  "/admin/api/getAllUsers": AdminController.syncTest,
};

const adminRoutesHandle = createRoutesHandler(routes, "adminRoutesHandle");

module.exports = {
  adminRoutesHandle,
};
