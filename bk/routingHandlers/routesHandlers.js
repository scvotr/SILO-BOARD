"use strict";

const {
  adminRoutesHandle,
} = require("../routesHandlers/admin/adminRoutesHandle");
const { authRoutesHandle } = require("../routesHandlers/auth/authRoutesHandle");
const {
  devicesRoutesHandle,
} = require("../routesHandlers/devices/devicesRoutesHandle");
const { routeCache } = require("../middleware/routeCache");

const handleFavicon = async (req, res) => {
  res.writeHead(204); // No Content - иконки нет, но это нормально
  res.end();
};

const routesHandlers = [
  { 
    prefix: "/auth", 
    handler: authRoutesHandle,
    cache: {
      enabled: true,
      ttl: 1000 * 60 * 10 // 10 minutes for auth routes
    }
  },
  { 
    prefix: "/admin", 
    handler: adminRoutesHandle,
    cache: {
      enabled: false // Admin routes typically shouldn't be cached
    }
  },
  { 
    prefix: "/devices", 
    handler: devicesRoutesHandle,
    cache: {
      enabled: true,
      ttl: 1000 * 60 * 5 // 5 minutes for device routes
    }
  },
  { 
    prefix: "/favicon.ico", 
    handler: handleFavicon,
    cache: {
      enabled: true,
      ttl: 1000 * 60 * 60 * 24 // Cache favicon for 24 hours
    }
  },
];

module.exports = { routesHandlers };