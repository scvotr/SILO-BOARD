"use strict";

const JWTService = require("./JWTService");

const protectRouteJWT = (handler) => {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.writeHead(401, { "Content-Type": "application/json" }).end(
          JSON.stringify({
            error: "Authentication required",
            message: "Bearer token missing",
          })
        );
      }

      const decodedToken = await JWTService.verifyToken(token);
      req.user = decodedToken;
      return await handler(req, res);
    } catch (error) {
      return res.writeHead(401, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          error: "Authentication failed",
          message: error.message,
        })
      );
    }
  };
};

module.exports = { protectRouteJWT };
