<template>
  <div class="profit-container">
    <div class="profit-title">总利润</div>
    <div ref="profitTarget" class="profit-amount"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { CountUp } from 'countup.js'; // 导入 CountUp.js 动画库

const profitTarget = ref(null); // 利润显示的 DOM 目标
const totalProfit = ref(0); // 存储从后端获取的总利润数据

// 获取总利润数据
const fetchTotalProfit = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/PRO');
    const data = response.data[0]; // 获取数组中的第一项
    totalProfit.value = parseFloat(data.total_profit).toFixed(2) || 0.00; // 转换为数字并保留两位小数
    animateTotalProfit();
  } catch (error) {
    console.error('获取总利润数据失败:', error);
  }
};

// 使用 CountUp.js 动画显示总利润
const animateTotalProfit = () => {
  if (!profitTarget.value) return;
  const countUp = new CountUp(profitTarget.value, totalProfit.value, {
    duration: 2, // 动画时长（秒）
    useEasing: true, // 启用缓动效果
    separator: ',', // 数字分隔符
    decimal: '.', // 小数点符号
    decimalPlaces: 2, // 保留两位小数
  });

  if (!countUp.error) {
    countUp.start();
  } else {
    console.error('CountUp 初始化失败:', countUp.error);
  }
};

// 在组件挂载后获取数据并动画显示
onMounted(() => {
  fetchTotalProfit();
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
