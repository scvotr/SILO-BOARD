"use strict";

const corsMiddleware = (req, res) => {
  // Устанавливаем CORS заголовки для ВСЕХ ответов
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, X-API-Key"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  // 🔥 КРИТИЧЕСКИ ВАЖНО: обрабатываем OPTIONS preflight запрос
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true; // Сигнализируем что запрос обработан
  }

  return false; // Запрос не OPTIONS, продолжаем обработку
};

module.exports = {
  corsMiddleware,
};

// const corsMiddleware = (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, X-Requested-With"
//   );
//   res.setHeader("Access-Control-Max-Age", "86400");
// };
