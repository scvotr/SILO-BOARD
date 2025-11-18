"use strict";

const {
  adminRoutesHandle,
} = require("../routesHandlers/admin/adminRoutesHandle");
const { authRoutesHandle } = require("../routesHandlers/auth/authRoutesHandle");
const {
  devicesRoutesHandle,
} = require("../routesHandlers/devices/devicesRoutesHandle");
const {
  HiLoadUnitRoutesHandle,
} = require("../routesHandlers/HiLoadTests/HiLoadTestRoutesHandle");

// ✅ ОБРАБОТЧИК ДЛЯ CHROME Favicon
const handleFavicon = async (req, res) => {
  res.writeHead(204); // No Content - иконки нет, но это нормально
  res.end();
};
// ✅ ОБРАБОТЧИК ДЛЯ CHROME DEVTOOLS
const handleChromeDevTools = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "Chrome DevTools configuration",
      available: true,
      timestamp: new Date().toISOString(),
    })
  );
};

const routesHandlers = [
  {
    prefix: "/favicon.ico",
    handler: handleFavicon,
    cache: {
      enabled: true,
      ttl: 1000 * 60 * 60 * 24, // Cache favicon for 24 hours
    },
  },
  {
    prefix: "/.well-known",
    handler: handleChromeDevTools,
    cache: {
      enabled: true,
      ttl: 1000 * 60 * 60 * 24, // 24 часа
    },
  },
  {
    prefix: "/auth",
    handler: authRoutesHandle,
    cache: {
      enabled: true,
      ttl: 1000 * 60 * 10, // 10 minutes for auth routes
    },
  },
  {
    prefix: "/admin",
    handler: adminRoutesHandle,
    cache: {
      enabled: false, // Admin routes typically shouldn't be cached
    },
    protected: true,
  },
  {
    prefix: "/devices",
    handler: devicesRoutesHandle,
    cache: {
      enabled: true,
      ttl: 1000 * 60 * 5, // 5 minutes for device routes
    },
    protected: true,
  },
  {
    prefix: "/hiLoadTests",
    handler: HiLoadUnitRoutesHandle,
    cache: {
      enabled: true,
      ttl: 1000 * 60 * 5, // 5 minutes for device routes
    },
  },
];

module.exports = { routesHandlers };
