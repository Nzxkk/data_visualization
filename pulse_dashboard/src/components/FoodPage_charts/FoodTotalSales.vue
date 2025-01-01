<template>
  <div class="profit-container">
    <div class="profit-title">食品总销售量</div>
    <div ref="salesTarget" class="sales-amount"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getTotalFoodSalesVolume } from '@/api/index'; // 确保正确导入封装的 API 方法
import { CountUp } from 'countup.js'; // 导入 CountUp.js 动画库

const salesTarget = ref(null); // 销售量显示的 DOM 目标
const totalSales = ref(0); // 存储从后端获取的总销售量
let countUpInstance = null; // CountUp.js 实例
let intervalId = null; // 定时器 ID，用于清除轮询

// 获取总销售量数据
const fetchTotalSales = async () => {
  try {
    const response = await getTotalFoodSalesVolume(); // 从 API 获取数据
    console.log('API 响应状态:', response.status);
    console.log('API 响应数据:', response.data);
    if (Array.isArray(response.data) && response.data.length > 0 && 'total_sales_volume' in response.data[0]) {
      return response.data[0].total_sales_volume;
    } else {
      console.error('后端返回的数据格式不正确');
      return 0;
    }
  } catch (error) {
    console.error('获取食品的总销售量数据失败:', error);
    return 0;
  }
};

// 使用 CountUp.js 动画显示总销售量
const animateTotalSales = async () => {
  const totalSalesValue = await fetchTotalSales();
  if (!salesTarget.value) return;

  // 如果已经有 CountUp 实例，直接更新值
  if (countUpInstance) {
    countUpInstance.update(totalSalesValue);
  } else {
    countUpInstance = new CountUp(salesTarget.value, totalSalesValue, {
      duration: 2, // 动画时长（秒）
      useEasing: true, // 启用缓动效果
      separator: ',', // 数字分隔符
      decimal: '.', // 小数点符号
      decimalPlaces: 2, // 显示两位小数
    });

    if (!countUpInstance.error) {
      countUpInstance.start();
    } else {
      console.error('CountUp 初始化失败:', countUpInstance.error);
    }
  }
};

// 启动定时轮询
const startPolling = () => {
  animateTotalSales(); // 初次加载数据并显示
  intervalId = setInterval(() => {
    animateTotalSales(); // 每隔 5 秒刷新数据
  }, 5000);
};

// 停止定时轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 在组件挂载后启动定时轮询
onMounted(() => {
  startPolling();
});

// 在组件卸载前清除定时器
onBeforeUnmount(() => {
  stopPolling();
  if (countUpInstance) {
    countUpInstance = null; // 清除 CountUp 实例
  }
});
</script>

<style scoped>
.profit-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 10px; /* 圆角 */
  color: #ffffff; /* 白色字体 */
  width: 100%;
  height: 150px; /* 高度固定 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影 */
}

.profit-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.sales-amount {
  font-size: 40px;
  font-weight: bold;
  font-family: 'Electronic', sans-serif; /* 数字样式字体 */
  color: #5dc5ef; /* 数字颜色 */
  text-align: center;
}
</style>
