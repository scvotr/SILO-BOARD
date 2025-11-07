module.exports = {
  server: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  database: {
    url: process.env.DATABASE_URL,  // ← Показывает что нужно для БД
    pool: process.env.DB_POOL || 10
  }
};