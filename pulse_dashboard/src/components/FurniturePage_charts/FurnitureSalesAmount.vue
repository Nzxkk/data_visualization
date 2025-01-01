<template>
  <div class="sales-amount-container">
    <div class="sales-title">家居用品总销售额</div>
    <div ref="amountTarget" class="sales-amount"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { CountUp } from 'countup.js';

const amountTarget = ref(null); // 显示总销售额的 DOM 元素
const currentSales = ref(0); // 当前销售额
let intervalId = null; // 定时器 ID

// 获取家居用品总销售额数据
const fetchTotalSales = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/FUR_HOME_TOTAL_SALES');
    const rawTotalSales = parseFloat(response.data.total_sales);
    const newSales = isNaN(rawTotalSales) ? 0 : rawTotalSales.toFixed(2);

    // 如果新数据与当前显示数据不同，才进行更新动画
    if (newSales !== currentSales.value) {
      currentSales.value = newSales;
      animateTotalSales(newSales); // 动画更新总销售额
    }
  } catch (error) {
    console.error('获取总销售额失败:', error);
  }
};

// 使用 CountUp.js 动画更新总销售额
const animateTotalSales = (newSales) => {
  if (!amountTarget.value) return;

  const countUp = new CountUp(amountTarget.value, newSales, {
    duration: 1.5, // 动画持续时间（更短的时间适合平滑过渡）
    useEasing: true, // 启用缓动效果
    separator: ',', // 千分位分隔符
    decimal: '.', // 小数点符号
    decimalPlaces: 2, // 保留小数位数
  });

  if (!countUp.error) {
    countUp.start(); // 开始动画
  } else {
    console.error('CountUp 初始化失败:', countUp.error);
  }
};

// 启动定时轮询
const startPolling = () => {
  fetchTotalSales(); // 首次获取数据
  intervalId = setInterval(() => {
    fetchTotalSales(); // 每隔 5 秒获取一次数据
  }, 5000);
};

// 停止定时轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 在组件挂载后启动轮询
onMounted(() => {
  startPolling();
});

// 在组件销毁前停止轮询
onBeforeUnmount(() => {
  stopPolling();
});
</script>

<style scoped>
.sales-amount-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 10px;
  color: #ffffff;
  width: 100%;
  height: 150px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.sales-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.sales-amount {
  font-size: 40px;
  font-weight: bold;
  font-family: 'Electronic', sans-serif;
  color: #5dc5ef;
  text-align: center;
}
</style>
