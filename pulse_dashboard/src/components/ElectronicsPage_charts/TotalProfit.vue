<template>
  <div class="profit-container">
    <div class="profit-title">电子产品总销量</div>
    <div ref="profitTarget" class="profit-amount"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getTotalProfit } from '@/api/index'; // 确保正确导入封装的 API 方法
import { CountUp } from 'countup.js'; // 导入 CountUp.js 动画库

const profitTarget = ref(null); // 利润显示的 DOM 目标
const totalProfit = ref(0); // 存储当前显示的总销量
let countUpInstance = null; // CountUp.js 实例
let intervalId = null; // 定时器 ID，用于清除轮询

// 获取总销量数据
const fetchTotalProfit = async () => {
  try {
    const response = await getTotalProfit(); // 从 API 获取数据
    const newProfit = parseFloat(response.data[0].total_profit).toFixed(2);
    if (newProfit !== totalProfit.value) {
      totalProfit.value = newProfit; // 仅在数据变化时更新
      updateCountUp(newProfit);
    }
  } catch (error) {
    console.error('获取电子产品的总销量数据失败:', error);
  }
};

// 初始化 CountUp.js 实例
const initCountUp = () => {
  if (profitTarget.value) {
    countUpInstance = new CountUp(profitTarget.value, totalProfit.value, {
      duration: 1.5, // 动画时长（秒）
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

// 更新 CountUp.js 的显示值（不重新初始化动画）
const updateCountUp = (newValue) => {
  if (countUpInstance) {
    countUpInstance.update(newValue); // 仅更新值
  }
};

// 启动定时轮询
const startPolling = () => {
  fetchTotalProfit(); // 首次加载数据
  intervalId = setInterval(() => {
    fetchTotalProfit(); // 每隔 5 秒刷新一次数据
  }, 5000);
};

// 停止定时轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 生命周期管理
onMounted(() => {
  initCountUp(); // 初始化 CountUp.js
  startPolling(); // 启动轮询
});

onBeforeUnmount(() => {
  stopPolling(); // 停止轮询
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

.profit-amount {
  font-size: 40px;
  font-weight: bold;
  font-family: 'Electronic', sans-serif; /* 数字样式字体 */
  color: #5dc5ef; /* 数字颜色 */
  text-align: center;
}
</style>
