"use strict";

const errorHandlers = {
  EADDRINUSE: (error, port, host) => ({
    message: `❌ Port ${port} is already in use!`,
    solution: `Use different port or: npx kill-port ${port}`,
    exitCode: 1,
  }),

  EACCES: (error, port, host) => ({
    message: `❌ Permission denied for port ${port}`,
    solution: "Use port above 1024 or run as admin",
    exitCode: 1,
  }),

  EADDRNOTAVAIL: (error, port, host) => ({
    message: `❌ Address ${host} is not available`,
    solution: "Check host configuration",
    exitCode: 1,
  }),

  ENOTFOUND: (error, port, host) => ({
    message: `❌ Host ${host} not found`,
    solution: "Check network/DNS configuration",
    exitCode: 1,
  }),
  ECONNREFUSED: (error, port, host) => ({
    message: `❌ Connection refused to ${host}:${port}`,
    solution: "Check if service is running on target host",
    exitCode: 1,
  }),

  ETIMEDOUT: (error, port, host) => ({
    message: `❌ Connection timeout to ${host}:${port}`,
    solution: "Check network connectivity and firewall rules",
    exitCode: 1,
  }),
};

const serverErrorHandler = (error, port, host) => {
  const handler = errorHandlers[error.code];

  if (handler) {
    const result = handler(error, port, host);
    console.error(result.message);
    console.error("💡 Solution:", result.solution);
    process.exit(result.exitCode);
  } else {
    // Default case
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

module.exports = { serverErrorHandler };
