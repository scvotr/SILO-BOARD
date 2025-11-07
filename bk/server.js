'use strict'

const http = require("http");
const { serverErrorHandler } = require("./serverErrorHandler");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World!");
});

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

const startServer = async () => {
  return new Promise((resolve, reject) => {
    server
      .listen({ host, port })
      .on("listening", () => {
        const address = server.address();
        console.log(
          `Сервер запущен на адресе ${address.address}:${address.port}`
        );
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

startServer().catch((error) => {
  serverErrorHandler(error, port, host);
});
