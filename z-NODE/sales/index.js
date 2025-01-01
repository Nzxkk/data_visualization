
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

// 获取服服饰用品按省份统计的销售量数据
router.get('/CLOTHING_PROVINCE_SALES', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          province, 
          SUM(order_amount) AS sales_volume
      FROM sales
      WHERE category = '服饰'
      GROUP BY province
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取分时销售量数据（原有的接口，如果不再使用可删除，此处保留供参考）
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

// 获取每小时订单数据 API
router.get('/time-orders-interval', async (req, res) => {
  try {
    // 执行查询，获取每个小时的订单数
    const [rows] = await db.execute(`
      SELECT 
        HOUR(order_date) AS hour,         -- 获取小时
        COUNT(*) AS order_count          -- 统计该小时的订单数
      FROM sales
      GROUP BY hour
      ORDER BY hour;                     -- 按小时升序排列
    `);

    // 返回每小时的订单数据
    res.json(rows);
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

//ElectronicsPage___router

// 获取家居用品类型 TOP5 综合评分数据（按产品统计，综合考虑销售金额和利润）
router.get('/FUR_HOME_TOP5', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          product_name, 
          (0.6 * SUM(order_amount) + 0.4 * SUM(profit)) AS rating -- 综合销售金额和利润计算类似评分的数据，可调整权重
      FROM sales 
      WHERE category = '家居用品'
      GROUP BY product_name 
      ORDER BY rating DESC 
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取家居用品品牌 TOP5 综合评分数据（按品牌统计，综合考虑销售金额和利润）
router.get('/FUR_HOME_TOP5_BRAND', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          brand_name, 
          (0.6 * SUM(order_amount) + 0.4 * SUM(profit)) AS rating 
      FROM sales 
      WHERE category = '家居用品'
      GROUP BY brand_name 
      ORDER BY rating DESC 
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});


// 获取家具类型销售数据（按更具体的产品类型，比如家电等统计销售量）
router.get('/FUR_TYPE_DETAILED', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT product_type, SUM(order_amount) AS total_sales FROM sales WHERE category = \'家居用品\' GROUP BY product_type');
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取具体家具产品销售数据（按产品名称统计销售量等信息）
router.get('/FUR_PRODUCT', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT product_name, SUM(order_amount) AS total_sales FROM sales WHERE category = \'家居用品\' GROUP BY product_name');
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取家具品牌销售数据（仅筛选家居用品类别下的品牌数据）
router.get('/FUR_BRAND_HOME', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT brand_name, SUM(order_amount) AS total_sales FROM sales WHERE category = \'家居用品\' GROUP BY brand_name');
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});
// 获取家居用品总销售额
router.get('/FUR_HOME_TOTAL_SALES', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT SUM(order_amount) AS total_sales FROM sales WHERE category = \'家居用品\'');
    res.json(rows[0]);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});


// 获取家居用品平均利润数据
router.get('/FUR_HOME_AVG_PROFIT', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT AVG(profit) AS average_profit FROM sales WHERE category = \'家居用品\'');
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取家居用品实时销售金额及同比数据
router.get('/FUR_HOME_TIME', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          DATE(order_date) AS date, 
          SUM(order_amount) AS total_sales_amount,
          (SUM(order_amount) - LAG(SUM(order_amount), 1, 0) OVER (ORDER BY DATE(order_date))) / LAG(SUM(order_amount), 1, 0) OVER (ORDER BY DATE(order_date)) AS year_on_year_growth_rate
      FROM sales
      WHERE category = '家居用品'
      GROUP BY DATE(order_date)
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取家居用品产品类型销售金额占比
router.get('/FUR_HOME_TYPE_RATIO', async (req, res) => {
  try {
    const totalAmountQuery = 'SELECT SUM(order_amount) AS total FROM sales WHERE category = \'家居用品\'';
    const typeAmountQuery = `
      SELECT 
          product_type, 
          SUM(order_amount) AS type_amount
      FROM sales 
      WHERE category = '家居用品'
      GROUP BY product_type
    `;
    const [totalAmountResult] = await db.execute(totalAmountQuery);
    const totalAmount = totalAmountResult[0].total;
    const [typeAmountResults] = await db.execute(typeAmountQuery);
    const typeRatios = typeAmountResults.map(result => ({
      product_type: result.product_type,
      ratio: (result.type_amount / totalAmount).toFixed(4)
    }));
    res.json(typeRatios);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});
// 获取家居用品按省份统计的销售量数据
router.get('/FUR_HOME_PROVINCE_SALES', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          province, 
          SUM(order_amount) AS sales_volume
      FROM sales
      WHERE category = '家居用品'
      GROUP BY province
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取母婴用品平均利润数据
router.get('/MB_AVG_PROFIT', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT AVG(profit) AS average_profit FROM sales WHERE category = \'母婴用品\'');
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});


// 获取母婴用品总销售额
router.get('/MB_TOTAL_SALES', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT SUM(order_amount) AS total_sales FROM sales WHERE category = \'母婴用品\'');
    res.json(rows[0]);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取母婴用品按省份统计的销售量数据
router.get('/MB_PROVINCE_SALES', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          province, 
          SUM(order_amount) AS sales_volume
      FROM sales
      WHERE category = '母婴用品'
      GROUP BY province
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取母婴用品产品类型销售金额占比
router.get('/MB_TYPE_RATIO', async (req, res) => {
  try {
    const totalAmountQuery = 'SELECT SUM(order_amount) AS total FROM sales WHERE category = \'母婴用品\'';
    const typeAmountQuery = `
      SELECT 
          product_type, 
          SUM(order_amount) AS type_amount
      FROM sales 
      WHERE category = '母婴用品'
      GROUP BY product_type
    `;
    const [totalAmountResult] = await db.execute(totalAmountQuery);
    const totalAmount = totalAmountResult[0].total;
    const [typeAmountResults] = await db.execute(typeAmountQuery);
    const typeRatios = typeAmountResults.map(result => ({
      product_type: result.product_type,
      ratio: (result.type_amount / totalAmount).toFixed(4)
    }));
    res.json(typeRatios);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取母婴用品产品类型销售占比数据
router.get('/MB_PRODUCT_TYPE_SALES_RATIO', async (req, res) => {
  try {
    const totalAmountQuery = 'SELECT SUM(order_amount) AS total FROM sales WHERE category = \'母婴用品\'';
    const typeAmountQuery = `
      SELECT 
          product_type, 
          SUM(order_amount) AS type_amount
      FROM sales 
      WHERE category = '母婴用品'
      GROUP BY product_type
    `;
    const [totalAmountResult] = await db.execute(totalAmountQuery);
    const totalAmount = totalAmountResult[0].total;
    const [typeAmountResults] = await db.execute(typeAmountQuery);
    const typeRatios = typeAmountResults.map(result => ({
      product_type: result.product_type,
      sales_ratio: (result.type_amount / totalAmount).toFixed(4)
    }));
    res.json(typeRatios);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});
// 获取母婴用品不同品牌的总销售额数据
router.get('/MB_BRAND_TOTAL_SALES', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          brand_name,
          SUM(order_amount) AS total_sales_amount
      FROM sales
      WHERE category = '母婴用品'
      GROUP BY brand_name
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取母婴用品实时销售金额及同比数据
router.get('/MB_TIME', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          DATE(order_date) AS date, 
          SUM(order_amount) AS total_sales_amount,
          (SUM(order_amount) - LAG(SUM(order_amount), 1, 0) OVER (ORDER BY DATE(order_date))) / LAG(SUM(order_amount), 1, 0) OVER (ORDER BY DATE(order_date)) AS year_on_year_growth_rate
      FROM sales
      WHERE category = '母婴用品'
      GROUP BY DATE(order_date)
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});
// 获取客户退款趋势数据（仅查询类别）
router.get('/motherbaby-refunds', async (req, res) => {
  try {
      // 查询出日期、退款金额总和以及退款率，按照日期分组
      const [rows] = await db.execute(`
          SELECT 
              DATE(order_date) AS date, 
              SUM(CASE WHEN return_status = '已退货' THEN total_amount ELSE 0 END) AS refund_amount, 
              AVG(CASE WHEN return_status = '已退货' THEN 1 - (profit / total_amount) ELSE 0 END) AS refund_rate 
          FROM sales 
          WHERE category = \'母婴用品\'
          GROUP BY DATE(order_date)
      `);
      res.json(rows);
  } catch (error) {
      res.status(500).send('数据库查询失败');
  }
});


//ElectronicsPage___router
// 获取品牌和子品牌数据
router.get('/brand-sales', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        brand_name, 
        product_name, 
        SUM(product_quantity) AS total_quantity 
      FROM sales 
      WHERE category = '电子产品' 
      GROUP BY brand_name, product_name
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取电子产品中销量最高的产品
router.get('/top-products', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        product_name, 
        SUM(product_quantity) AS total_quantity 
      FROM sales 
      WHERE category = '电子产品' 
      GROUP BY product_name 
      ORDER BY total_quantity DESC 
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取电子产品的总利润
router.get('/EPRO', async (req, res) => {
  try {
    // 使用 SUM 函数计算总利润，这里假设利润字段为 profit，根据实际情况调整
    const [rows] = await db.execute('SELECT SUM(profit) as total_profit FROM sales WHERE category = \'电子产品\'');
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取电子产品的销售数据
router.get('/sales-data', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        order_date, 
        SUM(order_amount) AS total_sales 
      FROM sales 
      WHERE category = '电子产品' 
      GROUP BY order_date 
      ORDER BY order_date
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取电子产品的退款数据
router.get('/refund-data', async (req, res) => {
  try {
    // 查询出日期、退款金额总和以及退款率，按照日期分组
    const [rows] = await db.execute(`
      SELECT 
        DATE(order_date) AS date, 
        SUM(CASE WHEN return_status = '已退货' THEN total_amount ELSE 0 END) AS refund_amount, 
        AVG(CASE WHEN return_status = '已退货' THEN 1 - (profit / total_amount) ELSE 0 END) AS refund_rate 
      FROM sales 
      WHERE category = '电子产品'
      GROUP BY DATE(order_date)
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 计算电子产品实时销售额
router.get('/total-esales', async (req, res) => {
  try {
    // 查询出日期和销售金额总和，按照日期分组
    const [rows] = await db.execute(`
      SELECT 
        DATE(order_date) AS date, 
        SUM(total_amount) AS total_sales  -- 销售总额
      FROM sales 
      WHERE category = '电子产品'  -- 仅查询电子产品
      GROUP BY DATE(order_date)
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

router.get('/ELECTRONICS_PROVINCE_SALES', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          province, 
          SUM(order_amount) AS sales_volume
      FROM sales
      WHERE category = '电子产品'
      GROUP BY province
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

//FoodPage___router
// 获取食品的总销售量
router.get('/FOOD_TOTAL_SALES_VOLUME', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        SUM(order_amount) AS total_sales_volume
      FROM sales
      WHERE category = '食品'
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});


//FoodPage___router
// 获取产品类型分布数据
router.get('/GET_PRODUCT_TYPE_DISTRIBUTION', async (req, res) => {
  try {
    const sql = `
      SELECT 
          product_type, 
          SUM(product_quantity) AS total_quantity
      FROM sales 
      WHERE category = '食品'
      GROUP BY product_type 
      ORDER BY total_quantity DESC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});
// 获取食品 TOP5 热销产品数据
router.get('/GET_TOP5_FOOD_PRODUCTS', async (req, res) => {
  try {
    const sql = `
      SELECT 
          product_name, 
          SUM(product_quantity) AS total_quantity
      FROM sales 
      WHERE category = '食品'
      GROUP BY product_name 
      ORDER BY total_quantity DESC 
      LIMIT 5
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});
// 获取品牌和子品牌数据
router.get('/food-brand-sales', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        brand_name, 
        product_name, 
        SUM(product_quantity) AS total_quantity 
      FROM sales 
      WHERE category = '食品' 
      GROUP BY brand_name, product_name
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取食品中销量最高的产品
router.get('/top-food-products', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        product_name, 
        SUM(product_quantity) AS total_quantity 
      FROM sales 
      WHERE category = '食品' 
      GROUP BY product_name 
      ORDER BY total_quantity DESC 
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取食品的总利润
router.get('/food-profit', async (req, res) => {
  try {
    // 使用 SUM 函数计算总利润，这里假设利润字段为 profit，根据实际情况调整
    const [rows] = await db.execute('SELECT SUM(profit) as total_profit FROM sales WHERE category = \'食品\'');
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取食品的销售数据
router.get('/food-sales-data', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        order_date, 
        SUM(order_amount) AS total_sales 
      FROM sales 
      WHERE category = '食品' 
      GROUP BY order_date 
      ORDER BY order_date
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 获取食品的退款数据
router.get('/food-refund-data', async (req, res) => {
  try {
    // 查询出日期、退款金额总和以及退款率，按照日期分组
    const [rows] = await db.execute(`
      SELECT 
        DATE(order_date) AS date, 
        SUM(CASE WHEN return_status = '已退货' THEN total_amount ELSE 0 END) AS refund_amount, 
        AVG(CASE WHEN return_status = '已退货' THEN 1 - (profit / total_amount) ELSE 0 END) AS refund_rate 
      FROM sales 
      WHERE category = '食品'
      GROUP BY DATE(order_date)
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

// 计算食品实时销售额
router.get('/total-food-sales', async (req, res) => {
  try {
    // 查询出日期和销售金额总和，按照日期分组
    const [rows] = await db.execute(`
      SELECT 
        DATE(order_date) AS date, 
        SUM(total_amount) AS total_sales  -- 销售总额
      FROM sales 
      WHERE category = '食品'  -- 仅查询食品
      GROUP BY DATE(order_date)
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

router.get('/FOOD_PROVINCE_SALES', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          province, 
          SUM(order_amount) AS sales_volume
      FROM sales
      WHERE category = '食品'
      GROUP BY province
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});


router.get('/getcategoryinfo', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT category, COUNT(*) as count
      FROM sales
      GROUP BY category
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send({ status: 1, message: "数据库查询错误", code: 500, error: error.message });
  }
});

router.get('/getcompanyinfo', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT courier_company, COUNT(*) as count
      FROM sales
      GROUP BY courier_company
    `);
    res.json({ status: 0, data: rows, message: "获取物流公司列表成功", code: 200 });
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).json({ status: 1, message: "数据库查询错误", code: 500, error: error.message });
  }
});

router.get('/getflight_pathsinfo', async (req, res) => {
  // SQL查询语句，提取不重复的记录
  const sql = `
    SELECT DISTINCT
        start_longitude,
        start_latitude,
        end_longitude,
        end_latitude,
        shipping_start,
        shipping_end
    FROM sales;
  `;
  try {
    const [rows] = await db.execute(sql);
    res.json({ status: 0, data: rows, message: "获取物流信息成功", code: 200 });
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).json({ status: 1, message: "数据库查询错误", code: 500, error: error.message });
  }
});

router.get('/getpointinfo', async (req, res) => {
  const sql = `
    SELECT 
        w.shipping_start AS province,
        w.start_longitude AS longitude,
        w.start_latitude AS latitude,
        w.value AS value
    FROM 
        sales w
    UNION
    SELECT 
        w.shipping_end AS province,
        w.end_longitude AS longitude,
        w.end_latitude AS latitude,
        w.value AS value
    FROM 
        sales w;
  `;
  try {
    const [rows] = await db.execute(sql);
    if (rows.length < 1) {
      return res.status(404).json({ status: 1, message: "没有数据", code: 404 });
    }
    res.json({ status: 0, data: rows, message: "获取省份数量统计数据成功", code: 200 });
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).json({ status: 1, message: "查询失败", code: 500, error: error.message });
  }
});

router.get('/routing_efficiency_top10', async (req, res) => {
  // 计算所有product_quantity的总和
  const totalQuantitySql = 'SELECT SUM(product_quantity) as total FROM sales';
  
  try {
    // 首先执行子查询获取总的product_quantity
    const [totalResult] = await db.execute(totalQuantitySql);
    if (totalResult.length < 1) {
      return res.status(404).json({ status: 1, message: "没有找到任何记录", code: 404 });
    }
    const totalProductQuantity = totalResult[0].total;
    
    // 计算每个shipping_start和shipping_end组合的total_quantity，并获取前十的记录
    // 同时将shipping_start和shipping_end格式化为shipping_start-shipping_end
    const top10Sql = `
      SELECT CONCAT(shipping_start, '-', shipping_end) as route, SUM(product_quantity) as total_quantity
      FROM sales
      GROUP BY shipping_start, shipping_end
      ORDER BY total_quantity DESC
      LIMIT 10;
    `;
    
    // 执行top 10查询
    const [top10Result] = await db.execute(top10Sql);
    res.json({ status: 0, data: top10Result, message: "获取top 10用户列表成功", code: 200 });
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).json({ status: 1, message: "查询失败：" + error.message, code: 500 });
  }
});

router.get('/gettotalinfo', async (req, res) => {
  const sql = `
    SELECT '总快递量' as status, SUM(product_quantity) as total_quantity FROM sales
    UNION ALL
    SELECT status, SUM(product_quantity) as total_quantity
    FROM sales
    GROUP BY status
  `;
  try {
    const [result] = await db.execute(sql);
    if (result.length < 1) {
      return res.status(400).json({ status: 1, message: "获取统计信息失败！", code: 400 });
    }
    res.json({ status: 0, data: result, message: "获取统计信息成功", code: 200 });
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).json({ status: 1, message: "数据库查询错误", code: 500, error: error.message });
  }
});

router.get('/getlogisticsdatainfo', async (req, res) => {
  const sql = `
    SELECT province, COUNT(*) as count
    FROM sales
    GROUP BY province
    ORDER BY count DESC
    LIMIT 5;
  `;
  try {
    const [result] = await db.execute(sql);
    if (result.length < 1) {
      return res.status(404).json({ status: 1, message: "没有数据", code: 404 });
    }
    res.json({ status: 0, data: result, message: "获取排名前十的省份数据成功", code: 200 });
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).json({ status: 1, message: "查询失败", code: 500, error: error.message });
  }
});

// 包含所有省份的数组
const provincesList = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '澳门',
  '香港', '台湾'
];

// 创建一个对象，包含所有省份及其初始数量0
const provincesCount = provincesList.reduce((acc, province) => {
  acc[province] = 0;
  return acc;
}, {});

router.get('/getprovincesinfo', async (req, res) => {
  // 构建查询SQL
  const sql = `
      SELECT province, COUNT(*) as province_count
      FROM sales
      GROUP BY province
  `;
  
  try {
      // 执行查询
      const [result] = await db.execute(sql);
      
      // 更新省份数量
      result.forEach(item => {
          provincesCount[item.province] = item.province_count;
      });
      
      // 将对象转换为数组并发送响应
      const data = Object.entries(provincesCount).map(([key, value]) => {
          return { province: key, province_count: value };
      });
      
      res.json({ status: 0, data, message: "获取省份信息成功", code: 200 });
  } catch (error) {
      console.error('数据库查询失败:', error);
      res.status(500).json({ status: 1, message: "查询失败：" + error.message, code: 500 });
  }
});

// 获取母婴的退款数据
router.get('/mb-refund-data', async (req, res) => {
  try {
    // 查询出日期、退款金额总和以及退款率，按照日期分组
    const [rows] = await db.execute(`
      SELECT 
        DATE(order_date) AS date, 
        SUM(CASE WHEN return_status = '已退货' THEN total_amount ELSE 0 END) AS refund_amount, 
        AVG(CASE WHEN return_status = '已退货' THEN 1 - (profit / total_amount) ELSE 0 END) AS refund_rate 
      FROM sales 
      WHERE category = '母婴用品'
      GROUP BY DATE(order_date)
    `);
    res.json(rows);
  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).send('数据库查询失败');
  }
});

module.exports = router;
