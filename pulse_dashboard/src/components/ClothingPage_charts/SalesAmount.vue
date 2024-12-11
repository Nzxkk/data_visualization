<template>
  <div class="sales-amount-container">
    <div class="sales-title">服饰类总销售额</div>
    <div ref="amountTarget" class="sales-amount"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { CountUp } from 'countup.js'; // 导入 CountUp.js 动画库

const amountTarget = ref(null); // 销售额显示的 DOM 目标
const totalSales = ref(0); // 存储从后端获取的总销售额

// 获取总销售额数据
const fetchTotalSales = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/total-sales');
    const rawTotalSales = parseFloat(response.data.total_sales); // 转换为数字
    totalSales.value = isNaN(rawTotalSales) ? 0 : rawTotalSales.toFixed(2); // 保留两位小数
    animateTotalSales();
  } catch (error) {
    console.error('获取总销售额失败:', error);
  }
};

// 使用 CountUp.js 动画显示总销售额
const animateTotalSales = () => {
  if (!amountTarget.value) return;
  const countUp = new CountUp(amountTarget.value, totalSales.value, {
    duration: 2, // 动画时长（秒）
    useEasing: true, // 启用缓动效果
    separator: ',', // 数字分隔符
    decimal: '.', // 小数点符号
    decimalPlaces: 2, // 显示两位小数
  });

  if (!countUp.error) {
    countUp.start();
  } else {
    console.error('CountUp 初始化失败:', countUp.error);
  }
};

// 在组件挂载后获取数据并动画显示
onMounted(() => {
  fetchTotalSales();
});
</script>

<style scoped>
.sales-amount-container {
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

.sales-title {
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
