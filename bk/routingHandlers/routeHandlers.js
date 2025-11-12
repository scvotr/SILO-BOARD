"use strict";

// !-------------------------------------
const handleDevicesPLCRoutes = async (req, res) => {
  const { method } = req;

  if (method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: "Device PLC API is working! 🚀",
        data: {
          devices: ["PLC_001", "PLC_002"],
          timestamp: new Date().toISOString(),
        },
      })
    );
  } else {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Method not allowed",
        allowedMethods: ["GET"],
      })
    );
  }
};
// !-------------------------------------

const routeHandlers = [
  { prefix: "/devicePLC", handler: handleDevicesPLCRoutes },
];

module.exports = { routeHandlers };
