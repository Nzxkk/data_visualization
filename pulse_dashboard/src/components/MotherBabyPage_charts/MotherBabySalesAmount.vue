<template>
  <div class="sales-amount-container">
    <div class="sales-title">母婴用品总销售额</div>
    <div ref="amountTarget" class="sales-amount"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { CountUp } from 'countup.js';

const amountTarget = ref(null);
const totalSales = ref(0);
let intervalId = null; // 定时器 ID

// 获取母婴用品总销售额数据
const fetchTotalSales = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/MB_TOTAL_SALES');
    const rawTotalSales = parseFloat(response.data.total_sales);
    const newSales = isNaN(rawTotalSales) ? 0 : rawTotalSales.toFixed(2);

    // 仅当销售额有变化时才更新动画
    if (newSales !== totalSales.value) {
      totalSales.value = newSales;
      animateTotalSales(); // 动画更新总销售额
    }
  } catch (error) {
    console.error('获取总销售额失败:', error);
  }
};

// 使用 CountUp.js 动画显示总销售额
const animateTotalSales = () => {
  if (!amountTarget.value) return;
  const countUp = new CountUp(amountTarget.value, totalSales.value, {
    duration: 2,
    useEasing: true,
    separator: ',',
    decimal: '.',
    decimalPlaces: 2,
  });

  if (!countUp.error) {
    countUp.start();
  } else {
    console.error('CountUp 初始化失败:', countUp.error);
  }
};

// 启动定时轮询
const startPolling = () => {
  fetchTotalSales(); // 首次加载数据
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
  width: 100%;
  height: 150px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.sales-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  color: #ffffff;
}

.sales-amount {
  font-size: 40px;
  font-weight: bold;
  font-family: 'Electronic', sans-serif;
  color: #5dc5ef;
  text-align: center;
}
</style>
