// 数据库查询辅助函数
// 封装 sql.js 的底层 API，提供类似 better-sqlite3 的接口

const { getDb, saveDatabase } = require('./init');

// 查询所有行（返回对象数组）
function all(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// 查询单行（返回对象或 undefined）
function get(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  
  let result;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

// 执行写操作（INSERT/UPDATE/DELETE），返回 { changes, lastInsertRowid }
function run(sql, params = []) {
  const db = getDb();
  db.run(sql, params);
  
  const changes = db.getRowsModified();
  const lastResult = db.exec('SELECT last_insert_rowid() as id');
  const lastInsertRowid = lastResult.length > 0 ? lastResult[0].values[0][0] : 0;
  
  // 写操作后自动保存
  saveDatabase();
  
  return { changes, lastInsertRowid };
}

module.exports = { all, get, run };
