
//API 路由：通过 routes/sales.js 文件定义所有的 API 路由，并将其挂载到 /api 路径下。
// routes/sales.js
const express = require('express');
const db = require('../db');  // 引入数据库连接模块
const router = express.Router();


// 获取商品类别销售数据
router.get('/category-sales', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT category, SUM(order_amount) AS total_sales FROM sales GROUP BY category');
    res.json(rows); // 返回数据给前端
  } catch (error) {
    console.error('数据库查询失败:', error);  // 打印出详细的错误信息
    res.status(500).send('数据库查询失败');
  }
});

// 获取分时销售量数据
router.get('/time-sales', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT HOUR(order_date) AS hour, SUM(order_amount) AS sales FROM sales GROUP BY HOUR(order_date)');
    res.json(rows);
  } catch (error) {
    res.status(500).send('数据库查询失败');
  }
});

// 获取商品词云图数据（按品牌名字统计销售额）
router.get('/word-cloud', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT brand_name, SUM(order_amount) AS total_sales FROM sales GROUP BY brand_name ORDER BY total_sales DESC LIMIT 50');
    res.json(rows);  // 返回品牌名称和销售额
  } catch (error) {
    res.status(500).send('数据库查询失败');
  }
});

// 分时段订单数据 API
router.get('/time-orders-interval', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        CASE
          WHEN HOUR(order_date) BETWEEN 0 AND 5 THEN '凌晨'
          WHEN HOUR(order_date) BETWEEN 6 AND 11 THEN '早晨'
          WHEN HOUR(order_date) BETWEEN 12 AND 17 THEN '下午'
          WHEN HOUR(order_date) BETWEEN 18 AND 23 THEN '晚上'
        END AS time_interval,
        COUNT(*) AS order_count
      FROM sales
      GROUP BY time_interval
      ORDER BY FIELD(time_interval, '凌晨', '早晨', '下午', '晚上')
    `);

    res.json(rows); // 返回数据给前端
  } catch (error) {
    console.error('数据库查询失败:', error); // 打印出详细的错误信息
    res.status(500).send('数据库查询失败');
  }
});

// 获取各省销售总额数据
router.get('/province-sales', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT province, SUM(order_amount) AS total_sales FROM sales GROUP BY province');
    res.json(rows);
  } catch (error) {
    res.status(500).send('数据库查询失败');
  }
  
});
// 获取总销售额
router.get('/total-sales', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT SUM(order_amount) AS total_sales FROM sales');
    res.json(rows[0]); // 返回总销售额
  } catch (error) {
    res.status(500).send('数据库查询失败');
  }
});

// 获取CLO数据（按服装类型分组统计销售量，仅查询服饰类别）
router.get('/CLO', async (req, res) => {
  try {
      // 修改 SQL 查询语句，按照 product_type 分组统计销售量（这里假设销售量字段为 product_quantity，根据实际情况调整）
      const [rows] = await db.execute('SELECT product_type, SUM(product_quantity) as total_quantity FROM sales WHERE category = \'服饰\' GROUP BY product_type');
      res.json(rows); // 返回数据给前端
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});

// 获取按服装品牌分组统计销售量的数据，用于前端切换展示品牌维度的销售量分布占比（仅查询服饰类别）
router.get('/CLOBrand', async (req, res) => {
  try {
      const [rows] = await db.execute('SELECT brand_name, SUM(product_quantity) as total_quantity FROM sales WHERE category = \'服饰\' GROUP BY brand_name');
      res.json(rows);
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});

// 获取总利润数据（仅查询服饰类别）
router.get('/PRO', async (req, res) => {
  try {
      // 使用 SUM 函数计算总利润，这里假设利润字段为 profit，根据实际情况调整
      const [rows] = await db.execute('SELECT SUM(profit) as total_profit FROM sales WHERE category = \'服饰\'');
      res.json(rows);
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});

// 获取实时销售金额及同比数据（仅查询服饰类别）
router.get('/TIME', async (req, res) => {
  try {
      // 查询出日期、销售金额总和以及销售金额同比数据，按照日期分组
      const [rows] = await db.execute(`
          SELECT 
              DATE(order_date) AS date, 
              SUM(order_amount) AS total_sales_amount,
              (SUM(order_amount) - LAG(SUM(order_amount), 1, 0) OVER (ORDER BY DATE(order_date))) / LAG(SUM(order_amount), 1, 0) OVER (ORDER BY DATE(order_date)) AS year_on_year_growth_rate
          FROM sales 
          WHERE category = \'服饰\'
          GROUP BY DATE(order_date)
      `);
      res.json(rows);
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});

// 获取客户退款趋势数据（仅查询服饰类别）
router.get('/RE', async (req, res) => {
  try {
      // 查询出日期、退款金额总和以及退款率，按照日期分组
      const [rows] = await db.execute(`
          SELECT 
              DATE(order_date) AS date, 
              SUM(CASE WHEN return_status = '已退货' THEN total_amount ELSE 0 END) AS refund_amount, 
              AVG(CASE WHEN return_status = '已退货' THEN 1 - (profit / total_amount) ELSE 0 END) AS refund_rate 
          FROM sales 
          WHERE category = \'服饰\'
          GROUP BY DATE(order_date)
      `);
      res.json(rows);
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});

// 获取销售金额及对应时间数据，用于计算环比、同比 （仅查询服饰类别） //与total-sales相同
router.get('/SA', async (req, res) => {
  try {
      // 查询出日期、销售金额，按照日期分组
      const [rows] = await db.execute(`
          SELECT 
              DATE(order_date) AS date, 
              SUM(order_amount) AS sales_amount 
          FROM sales 
          WHERE category = \'服饰\'
          GROUP BY DATE(order_date)
      `);
      res.json(rows);
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});

// 获取销售量数据（仅查询服饰类别）  //与time-sales一样
router.get('/SV', async (req, res) => {
  try {
      const [rows] = await db.execute('SELECT HOUR(order_date) AS hour, SUM(order_amount) AS sales FROM sales WHERE category = \'服饰\' GROUP BY HOUR(order_date)');
      res.json(rows);
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});


// 获取不同服装类型下具体服装的销售量数据，用于 TOP5 展示（仅查询服饰类别）
router.get('/TOP5', async (req, res) => {
  try {
      // 查询出服装类型、服装名称以及对应的销售量总和，按照服装类型和服装名称分组
      const [rows] = await db.execute(`
          SELECT 
              product_type, 
              product_name, 
              SUM(product_quantity) AS sales_volume 
          FROM sales 
          WHERE category = \'服饰\'
          GROUP BY product_type, product_name
      `);
      res.json(rows);
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});

// 获取不同服装类型下服装品牌的销售量数据，用于品牌 TOP5 展示（仅查询服饰类别）
router.get('/TOP5Brand', async (req, res) => {
  try {
      // 查询出服装类型、服装品牌以及对应的销售量总和，按照服装类型和服装品牌分组
      const [rows] = await db.execute(`
          SELECT 
              product_type, 
              brand_name, 
              SUM(product_quantity) AS sales_volume 
          FROM sales 
          WHERE category = \'服饰\'
          GROUP BY product_type, brand_name
      `);
      res.json(rows);
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});
module.exports = router;
