"use strict";

const HiLoadController = require("../../controllers/HiLoadTests/HiLoadController");
const { createRoutesHandler } = require("../utils/createRoutesHandler");

const routes = {
  "/hiLoadTests/load/testResponse": HiLoadController.testResponse,
  
  // Простые тесты
  "/hiLoadTests/simple/cpu": HiLoadController.simpleCpuTest,
  "/hiLoadTests/simple/memory": HiLoadController.simpleMemoryTest,
  "/hiLoadTests/simple/database": HiLoadController.simpleDatabaseTest,

  // Реальные нагрузочные тесты
  "/hiLoadTests/real/cpu": HiLoadController.realCpuLoadTest,
  "/hiLoadTests/real/memory": HiLoadController.realMemoryLoadTest,
  "/hiLoadTests/real/combined": HiLoadController.realCombinedLoadTest,
};

const HiLoadUnitRoutesHandle = createRoutesHandler(
  routes,
  "HiLoadUnitRoutesHandle"
);

module.exports = { HiLoadUnitRoutesHandle };
