module.exports = {
  server: {
    host: process.env.HOST || "localhost",
    port: process.env.PORT || 3000,
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};
