"use strict";

const jwt = require("jsonwebtoken");
const { logger } = require("../../utils/logger");
require("dotenv").config();

const authenticateUserSocket = (socket, next) => {
  let tokenInHeaders = socket.handshake.headers.authorization; // 'Authorization': `Bearer ${user.jwtToken}`

  if (tokenInHeaders) {
    tokenInHeaders = tokenInHeaders.slice(7, tokenInHeaders.length);
    jwt.verify(tokenInHeaders, process.env.KEY_TOKEN, (err, decoded) => {
      if (err) {
        logger.errorAuth({
          message: "Authentication failed: invalid token",
          token: tokenInHeaders,
        });
        return next(new Error("Authentication error"));
      }
      socket.decoded = decoded;
      logger.infoAuth({
        message: "Authentication successful",
        decode: socket.decoded.name,
      });
      return next();
    });
  } else {
    logger.warn({
      message: "Authentication failed: token is missing",
    });
    return next(new Error("Authentication error"));
  }
};

module.exports = { authenticateUserSocket };
