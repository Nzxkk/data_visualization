<template>
  <div class="sales-amount-container">
    <div class="sales-title">家居用品平均利润</div>
    <div ref="salesAmount" class="sales-amount"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { CountUp } from 'countup.js';

const salesAmount = ref(null); // 显示的 DOM 元素
const averageProfit = ref(0); // 存储从后端获取的平均利润数据
let intervalId = null; // 定时器 ID

// 获取家居用品平均利润数据
const fetchAverageProfit = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/FUR_HOME_AVG_PROFIT');
    const data = response.data[0];
    const newProfit = parseFloat(data.average_profit).toFixed(2) || 0.00;

    // 数据变化时才更新动画
    if (newProfit !== averageProfit.value) {
      averageProfit.value = newProfit;
      animateAverageProfit();
    }
  } catch (error) {
    console.error('获取平均利润数据失败:', error);
  }
};

// 使用 CountUp.js 动画显示平均利润
const animateAverageProfit = () => {
  if (!salesAmount.value) return;
  const countUp = new CountUp(salesAmount.value, averageProfit.value, {
    duration: 2, // 动画持续时间
    useEasing: true, // 使用缓动
    separator: ',', // 千分位分隔符
    decimal: '.', // 小数点样式
    decimalPlaces: 2, // 保留两位小数
  });

  if (!countUp.error) {
    countUp.start();
  } else {
    console.error('CountUp 初始化失败:', countUp.error);
  }
};

// 启动定时轮询
const startPolling = () => {
  fetchAverageProfit(); // 首次加载
  intervalId = setInterval(() => {
    fetchAverageProfit(); // 每隔 5 秒获取一次数据
  }, 5000);
};

// 停止轮询
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

// 在组件卸载时停止轮询
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
  color: '#ffffff';
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
