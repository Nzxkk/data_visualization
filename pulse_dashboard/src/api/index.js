import axios from 'axios';

// 创建通用 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:3006/api', // 后端 API 基础路径
  timeout: 10000, // 超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 方法封装

// 获取商品类别销售数据
export const getCategorySales = () => apiClient.get('/category-sales');

// 获取分时销售数据
export const getTimeSales = () => apiClient.get('/time-sales');

// 获取词云数据
export const getWordCloudData = () => apiClient.get('/word-cloud');

// 获取分时成交单数量变化数据
export const getTimeOrders = () => apiClient.get('/time-orders-interval');

// 获取各省销售总额数据
export const getProvinceSales = () => apiClient.get('/province-sales');

// 获取总销售额
export const getTotalSales = () => apiClient.get('/total-sales');

// 获取服饰类别销售量数据
export const getCLOSales = () => apiClient.get('/CLO');

// 获取按服装品牌分组销售量数据
export const getCLOBrandSales = () => apiClient.get('/CLOBrand');

// 获取总利润数据
export const getProfit = () => apiClient.get('/PRO');

// 获取实时销售金额及同比数据
export const getTimeComparison = () => apiClient.get('/TIME');

// 获取客户退款趋势数据
export const getRefundTrend = () => apiClient.get('/RE');

// 获取销售金额数据
export const getSalesAmount = () => apiClient.get('/SA');

// 获取分时销售量数据
export const getHourlySalesVolume = () => apiClient.get('/SV');

// 获取服饰类型 TOP5 销售量数据
export const getTop5Products = () => apiClient.get('/TOP5');

// 获取服饰品牌 TOP5 销售量数据
export const getTop5Brands = () => apiClient.get('/TOP5Brand');
