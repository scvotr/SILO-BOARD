"use strict";

class DevicesController {
  async testResponse(req, res) {
    const { method } = req;

    if (method === "POST" || method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: "DevicesController API is working! 🚀",
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
          allowedMethods: ["GET, POST"],
        })
      );
    }
  }
}

module.exports = new DevicesController();
