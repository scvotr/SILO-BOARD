module.exports = {
  server: {
    host: process.env.HOST || "localhost",
    port: process.env.PORT || 3000,
  },
  database: {
    url: process.env.DATABASE_URL, // ← Показывает что нужно для БД
    pool: process.env.DB_POOL || 10,
  },
  auth: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES || "24h",
  },
};
