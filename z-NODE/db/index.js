//数据库连接：使用 db/index.js 文件封装数据库连接。
// db/index.js
const mysql = require('mysql2');

// 创建数据库连接池
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',    // 替换为你的数据库用户名
  password: '12345678',    // 替换为你的数据库密码
  database: 'retail_info',  // 替换为你的数据库名
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('数据库连接成功');
    connection.release();  // 释放连接池中的连接
  }
});

module.exports = db.promise();  // 使用promise API，使得查询支持 async/await
