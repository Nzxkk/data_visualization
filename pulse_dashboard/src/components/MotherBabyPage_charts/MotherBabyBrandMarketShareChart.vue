<template>
  <div class="chart-container">
    <div class="controls">
      <button
        v-for="option in options"
        :key="option.value"
        :class="['control-btn', { active: selectedSort === option.value }]"
        @click="changeSort(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <div ref="chart" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

const chart = ref(null);
const selectedSort = ref('desc'); // 默认按销售额降序
const options = [
  { label: '降序', value: 'desc' },
  { label: '升序', value: 'asc' },
];
let myChart = null; // 图表实例
let intervalId = null; // 定时轮询的 ID

// 切换排序方式并重新获取数据
const changeSort = (sort) => {
  selectedSort.value = sort;
  fetchData(sort);
};

// 获取数据函数（从后端获取数据并按排序方式处理）
const fetchData = async (sort) => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/MB_BRAND_TOTAL_SALES');
    const data = response.data
      .map(item => ({
        brand: item.brand_name,
        totalSales: item.total_sales_amount,
      }))
      .sort((a, b) => (sort === 'asc' ? a.totalSales - b.totalSales : b.totalSales - a.totalSales))
      .slice(0, 5); // 限制前五项数据
    renderChart(data);
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 渲染图表函数
const renderChart = (data) => {
  if (!chart.value) return;

  if (!myChart) {
    myChart = echarts.init(chart.value); // 初始化图表实例
  }

  const option = {
    backgroundColor: 'transparent', // 背景透明
    title: {
      text: '母婴用品前五品牌总销售额',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: 'rgba(50, 50, 50, 0.8)', // 工具提示背景透明
      textStyle: {
        color: '#ffffff',
      },
    },
    grid: {
      left: '15%',
      right: '10%',
      top: '15%', // 减小顶部留白
      bottom: '15%', // 减小底部留白
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '￥{value}', // 显示为货币格式
        color: '#ffffff',
        interval: 1, // 设置为固定间隔
        rotate: 30, // 标签旋转 30 度，防止重叠
      },
      axisLine: { lineStyle: { color: '#ffffff' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } }, // 分割线透明
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.brand),
      axisLabel: { color: '#ffffff' },
      axisLine: { lineStyle: { color: '#ffffff' } },
    },
    series: [
      {
        type: 'bar',
        data: data.map(item => item.totalSales),
        barWidth: '40%',
        itemStyle: {
          color: '#5dc5ef', // 统一柱状颜色
          borderRadius: [5, 5, 0, 0], // 圆角处理
        },
        label: {
          show: true,
          position: 'right',
          formatter: '￥{c}',
          color: '#ffffff', // 标签颜色
        },
      },
    ],
  };

  myChart.setOption(option);
};

// 定时轮询
const startPolling = () => {
  fetchData(selectedSort.value); // 初次加载数据
  intervalId = setInterval(() => {
    fetchData(selectedSort.value); // 每隔 5 秒获取一次数据
  }, 5000);
};

// 停止轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 调整图表大小
const resizeChart = () => {
  if (myChart) {
    myChart.resize();
  }
};

// 生命周期管理
onMounted(() => {
  fetchData(selectedSort.value);
  startPolling();
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  stopPolling();
  window.removeEventListener('resize', resizeChart);
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 800px;
  height: 400px;
  margin: 10px auto; /* 减小外边距，上移图表 */
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
  background: transparent;
  padding: 10px;
}

.map-container {
  width: 100%;
  height: 100%;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 5px; /* 减小按钮和图表之间的间距 */
}

.control-btn {
  padding: 8px 18px; /* 调整按钮大小 */
  border: 1px solid #5dc5ef;
  color: #ffffff;
  background-color: transparent;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 5px;
  font-size: 12px; /* 减小字体大小 */
}

.control-btn.active {
  background-color: #5dc5ef;
  color: #ffffff;
}

.control-btn:hover {
  background-color: rgba(93, 197, 239, 0.8);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
}
</style>
