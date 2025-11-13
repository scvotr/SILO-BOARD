"use strict";

class AdminController {
  async testResponse(req, res) {
    const { method } = req;

    if (method === "POST") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: "AdminController API is working! 🚀",
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
          allowedMethods: ["POST"],
        })
      );
    }
  }
  async syncTest(req, res) {
    console.log("🚀 ~ AdminController ~ syncTest ~ req:", req);
  }
}

module.exports = new AdminController();
