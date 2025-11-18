"use strict";

const jwt = require("jsonwebtoken");
require("dotenv").config();

class JWTService {
  constructor() {
    this.secret = process.env.KEY_TOKEN;
    this.accessTokenExpiry = "15m";
    this.refreshTokenExpiry = "7d";
  }

  generateAccessToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: "access",
      },
      this.secret,
      { expiresIn: this.accessTokenExpiry }
    );
  }
  generateRefreshToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: "refresh",
      },
      this.secret,
      { expiresIn: this.refreshTokenExpiry }
    );
  }
  async verifyToken(token) {
    try {
      const decodedToken = jwt.verify(token, this.secret);

      // Временное решение - убрать проверку базы
      // const user = await findTokenQ(token);
      // if (!user || user[0].token !== token) {
      //   throw new Error("Token not found in database");
      // }

      return decodedToken;
    } catch (error) {
      console.warn("JWT verification failed", error.message);
      throw new Error("Invalid or expired token");
    }
  }
  async extractDataFromToken(token) {
    try {
      const decoded = await this.verifyToken(token);
      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch (error) {
      throw new Error("Authentication failed: " + error.message);
    }
  }
}

module.exports = new JWTService();
