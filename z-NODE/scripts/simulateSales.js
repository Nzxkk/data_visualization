const mysql = require('mysql2');
const faker = require('faker');
const moment = require('moment');

// 创建数据库连接
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '12345678',
    database: 'retail_info'
});

connection.connect(err => {
    if (err) {
        console.error('连接数据库失败:', err.stack);
        return;
    }
    console.log('连接数据库成功, ID:', connection.threadId);
});

// 分类与对应的商品名称、公司名称和商品类型
const categoryData = {
    '电子产品': {
        products: ['智能手机', '笔记本电脑', '平板电脑', '智能手表', '蓝牙耳机'],
        companies: ['苹果公司', '三星电子', '华为技术有限公司', '小米科技有限责任公司', '索尼公司'],
        productTypes: ['电子设备', '数码产品', '计算机硬件']
    },
    '家居用品': {
        products: ['沙发', '床', '餐桌', '衣柜', '书架'],
        companies: ['宜家家居', '曲美家具', '全友家居', '美克家居', '顾家家居'],
        productTypes: ['家具', '家居装饰', '家庭必需品']
    },
    '服饰': {
        products: ['T恤', '牛仔裤', '运动鞋', '羽绒服', '帽子'],
        companies: ['耐克', '阿迪达斯', '优衣库', 'ZARA', 'H&M'],
        productTypes: ['服装', '鞋类', '配饰']
    },
    '食品': {
        products: ['牛奶', '巧克力', '零食大礼包', '饼干', '薯片'],
        companies: ['蒙牛', '伊利', '雀巢', '三只松鼠', '百草味'],
        productTypes: ['乳制品', '零食', '烘焙食品']
    },
    '母婴用品': {
        products: ['纸尿裤', '奶粉', '婴儿推车', '儿童座椅', '婴儿床'],
        companies: ['好奇', '花王', '飞鹤', '美素佳儿', '大王'],
        productTypes: ['婴儿护理', '儿童家具', '喂养用品']
    }
};

// 省份和经纬度
const provinces = {
    '北京': [116.46, 39.92],
    '天津': [117.2, 39.13],
    '河北': [114.52, 38.04],
    '山西': [112.53, 37.87],
    '内蒙古': [111.65, 40.82],
    '辽宁': [123.43, 41.8],
    '吉林': [125.32, 43.88],
    '黑龙江': [126.53, 45.77],
    '上海': [121.48, 31.22],
    '江苏': [118.76, 32.05],
    '浙江': [120.15, 30.26],
    '安徽': [117.27, 31.86],
    '福建': [119.3, 26.08],
    '江西': [115.89, 28.68],
    '山东': [117.12, 36.65],
    '河南': [113.65, 34.76],
    '湖北': [114.31, 30.52],
    '湖南': [112.93, 28.22],
    '广东': [113.26, 23.13],
    '广西': [108.33, 22.84],
    '海南': [110.35, 20.02],
    '重庆': [106.54, 29.59],
    '四川': [104.06, 30.67],
    '贵州': [106.71, 26.57],
    '云南': [102.73, 25.04],
    '西藏': [91.11, 29.67],
    '陕西': [108.95, 34.27],
    '甘肃': [103.73, 36.03],
    '青海': [101.78, 36.62],
    '宁夏': [106.27, 38.47],
    '新疆': [87.68, 43.77],
    '澳门': [113.54, 22.2],
    '香港': [114.1, 22.2],
    '台湾': [121.0, 23.7]
};

// 随机生成数据
const generateSalesData = () => {
    // 最近3天内的随机日期
    const randomDate = faker.date.recent(3); // 参数为最近几天
    const orderDate = moment(randomDate).format('YYYY-MM-DD HH:mm:ss');
    const category = faker.random.arrayElement(Object.keys(categoryData)); // 随机选择分类
    const productName = faker.random.arrayElement(categoryData[category].products); // 根据分类选择商品名称
    const brandName = faker.random.arrayElement(categoryData[category].companies); // 根据分类选择公司名称
    const productType = faker.random.arrayElement(categoryData[category].productTypes); // 根据分类选择商品类型
    const customerId = faker.datatype.number({ min: 1, max: 1000 });
    const province = faker.random.arrayElement(Object.keys(provinces));
    const shippingStart = faker.random.arrayElement(Object.keys(provinces));
    const shippingEnd = faker.random.arrayElement(Object.keys(provinces));
    const [startLongitude, startLatitude] = provinces[shippingStart];
    const [endLongitude, endLatitude] = provinces[shippingEnd];
    const orderAmount = parseFloat(faker.commerce.price(100, 10000, 2));
    const discount = parseFloat(faker.commerce.price(0, 200, 2));
    const shippingFee = parseFloat(faker.commerce.price(10, 50, 2));
    const totalAmount = (orderAmount + shippingFee - discount).toFixed(2);
    const profit = (orderAmount * 0.3).toFixed(2);
    const paymentMethod = faker.random.arrayElement(['支付宝', '微信支付', '信用卡', '银行卡', '现金']);
    const courierCompany = faker.random.arrayElement(['圆通', '中通', '顺丰', '韵达']);
    const trackingNumber = faker.random.alphaNumeric(10).toUpperCase();
    const orderSource = faker.random.arrayElement(['天猫APP', '天猫官网', '天猫国际', '其他']);
    const paymentTime = moment(faker.date.recent()).format('YYYY-MM-DD HH:mm:ss');
    const shippingTime = moment(faker.date.recent()).format('YYYY-MM-DD HH:mm:ss');
    const recipientName = faker.name.findName();
    const recipientPhone = faker.phone.phoneNumber('1##########');
    const recipientAddress = faker.address.streetAddress();
    const returnStatus = faker.random.arrayElement(['无退货', '已退货', '退货中']);
    const returnReason = returnStatus === '无退货' ? null : faker.lorem.sentence();
    const productQuantity = faker.datatype.number({ min: 1, max: 10 });
    const status = faker.random.arrayElement(['已揽收', '运输中', '派送中', '已签收', '转寄退回', '作废']); // 随机选择状态

    return [
        orderDate, productName, brandName, category, customerId, province,
        shippingStart, shippingEnd, startLongitude, startLatitude, endLongitude, endLatitude,
        status, 0.00, orderAmount, paymentMethod, courierCompany, trackingNumber, orderSource,
        discount, paymentTime, shippingTime, recipientName, recipientPhone, recipientAddress,
        shippingFee, returnStatus, returnReason, productQuantity, totalAmount, profit, productType
    ];
};

//  
const insertSalesData = () => {
    const salesData = generateSalesData();
    console.log('Data Length:', salesData.length);
    console.log('Data:', salesData);

    const sql = `
        INSERT INTO sales (
            order_date, product_name, brand_name, category, customer_id, province, shipping_start, shipping_end,
            start_longitude, start_latitude, end_longitude, end_latitude, status, value, order_amount, payment_method,
            courier_company, tracking_number, order_source, discount, payment_time, shipping_time, recipient_name,
            recipient_phone, recipient_address, shipping_fee, return_status, return_reason, product_quantity, total_amount,
            profit, product_type
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    connection.execute(sql, salesData, (err, result) => {
        if (err) {
            console.error('插入数据失败:', err);
            return;
        }
        console.log('成功插入订单数据:', result);
    });
};

// 模拟数据流
const simulateStream = () => {
    setInterval(() => {
        insertSalesData();
    }, 5000);
};

// 启动模拟
simulateStream();
