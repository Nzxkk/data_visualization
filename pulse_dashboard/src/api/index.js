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

// 商品相关数据
export const getCategorySales = () => apiClient.get('/category-sales');
export const getTimeSales = () => apiClient.get('/time-sales');
export const getWordCloudData = () => apiClient.get('/word-cloud');
export const getTimeOrders = () => apiClient.get('/time-orders-interval');
export const getProvinceSales = () => apiClient.get('/province-sales');
export const getTotalSales = () => apiClient.get('/total-sales');
export const getCLOSales = () => apiClient.get('/CLO');
export const getCLOBrandSales = () => apiClient.get('/CLOBrand');
export const getProfit = () => apiClient.get('/PRO');
export const getTimeComparison = () => apiClient.get('/TIME');
export const getRefundTrend = () => apiClient.get('/RE');
export const getSalesAmount = () => apiClient.get('/SA');
export const getHourlySalesVolume = () => apiClient.get('/SV');
export const getTop5Products = () => apiClient.get('/TOP5');
export const getTop5Brands = () => apiClient.get('/TOP5Brand');

// 电子产品相关数据
export const getBrandSales = () => apiClient.get('/brand-sales');
export const getTopProducts = () => apiClient.get('/top-products');
export const getTotalProfit = () => apiClient.get('/EPRO');
export const getSalesData = () => apiClient.get('/sales-data');
export const getRefundData = () => apiClient.get('/refund-data');
export const getElectronicTotalSales = () => apiClient.get('/total-esales');


// 食品相关数据
export const getFoodBrandSales = () => apiClient.get('/food-brand-sales');
export const getTop5FoodSales = () => apiClient.get('/top-food-products');
export const getTotalFoodProfit = () => apiClient.get('/food-profit');
export const getFoodSalesData = () => apiClient.get('/food-sales-data');
export const getFoodRefundData = () => apiClient.get('/food-refund-data');
export const getFoodTotalSales = () => apiClient.get('/total-food-sales');
export const getTotalFoodSalesVolume = () => apiClient.get('/FOOD_TOTAL_SALES_VOLUME');

export const getProductTypeDistribution = () => apiClient.get('/GET_PRODUCT_TYPE_DISTRIBUTION');
export const getTop5FoodProducts = () => apiClient.get('/GET_TOP5_FOOD_PRODUCTS');

//物流相关数据
export const reqLogisticsdataInfo = () => apiClient.get('/getlogisticsdatainfo');
export const reqTotalInfo = () => apiClient.get('/gettotalinfo');
export const reqFlight_pathsInfo = () => apiClient.get('/getflight_pathsinfo');
export const reqpointInfo = () => apiClient.get('/getpointinfo');
export const reqProvincesInfo = () => apiClient.get('/getprovincesinfo');
export const reqTopInfo = () => apiClient.get('/routing_efficiency_top10');
export const reqcompanyInfo = () => apiClient.get('/getcompanyinfo');
export const reqcategoryInfo = () => apiClient.get('/getcategoryinfo');

