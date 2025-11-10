"use strict";

const { db } = require("../initDatabase");
const { logger } = require("../../utils/logger");

// ✅ ИСПОЛЬЗУЕМ СУЩЕСТВУЮЩЕЕ СОЕДИНЕНИЕ, не создаем новое
const execSql = async (command, params = [], method = "all") => {
  return new Promise((resolve, reject) => {
    // ✅ Используем существующее соединение db
    db[method](command, params, (err, result) => {
      if (err) {
        logger.error(`Error executing query: ${command}`, err);
        reject(err);
      } else {
        resolve(result);
      }
      // ❌ НЕ закрываем соединение здесь!
    });
  });
};

/**
 * Универсальная обёртка для sqlite3: .all, .get, .run
 * @param {string} sql
 * @param {Array|undefined} params
 * @param {'all'|'get'|'run'} method
 * @returns {Promise<any>} rows | row | { lastID, changes }
 */
const execSql_NEW = (sql, params = undefined, method = "all") => {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error("Database not initialized"));

    const callback = function (err, result) {
      if (err) {
        logger.error(`DB error executing SQL`, {
          sql,
          params,
          err: err.message,
        });
        return reject(err);
      }
      if (method === "run") {
        // this доступен в callback run -> содержит lastID и changes
        return resolve({ lastID: this.lastID, changes: this.changes });
      }
      // для get -> single row, для all -> array of rows
      return resolve(result);
    };

    try {
      // В sqlite3 методы: db.all(sql, params?, cb), db.get(sql, params?, cb), db.run(sql, params?, cb)
      if (params === undefined) {
        db[method](sql, callback);
      } else {
        db[method](sql, params, callback);
      }
    } catch (err) {
      logger.error("Unexpected DB call error", {
        sql,
        params,
        err: err.message,
      });
      return reject(err);
    }
  });
};

module.exports = { execSql, execSql_NEW };

// USAGE
// получить все строки
// const rows = await execSql('SELECT * FROM users WHERE active = ?', [1], 'all');

// получить одну строку
// const user = await execSql('SELECT * FROM users WHERE id = ?', [userId], 'get');

// выполнить вставку/обновление
// const res = await execSql('INSERT INTO users(username, created_at) VALUES (?, ?)', [name, Date.now()], 'run');
// res => { lastID: <number>, changes: <number> }
