<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';

const chart = ref(null);
let myChart = null;
let intervalId = null; // 定时轮询的ID

// 渲染图表
const renderChart = (data) => {
  if (!chart.value) return;

  if (!myChart) {
    myChart = echarts.init(chart.value); // 初始化 ECharts 实例
  }

  const option = {
    title: {
      text: 'Top 5 热销产品',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: Math.ceil(Math.max(...data.map(item => item.total_quantity)) * 1.1),
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: {
        color: '#ffffff',
        formatter: (value) => value.toLocaleString(),
        fontSize: 12,
        rotate: 45,
        margin: 10,
      },
      splitLine: { lineStyle: { color: '#444' } },
      splitNumber: 5,
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.product_name),
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: { color: '#ffffff' },
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: data.map(item => ({
          value: item.total_quantity,
          itemStyle: {
            color: '#3398DB',
            borderRadius: [5, 5, 5, 5],
          },
        })),
        barWidth: 20,
        label: {
          show: true,
          position: 'right',
          color: '#ffffff',
          fontSize: 12,
          formatter: '{c}',
        },
      },
    ],
  };

  myChart.setOption(option);
};

// 获取数据并更新图表
const fetchTop5FoodProducts = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/GET_TOP5_FOOD_PRODUCTS');
    const data = response.data;
    renderChart(data);
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 启动定时轮询
const startPolling = () => {
  fetchTop5FoodProducts(); // 第一次获取数据
  intervalId = setInterval(() => {
    fetchTop5FoodProducts(); // 每 5 秒获取一次数据
  }, 5000);
};

// 停止定时轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 生命周期钩子
onMounted(() => {
  startPolling(); // 启动定时轮询
});

onBeforeUnmount(() => {
  stopPolling(); // 停止定时轮询
  if (myChart) {
    myChart.dispose(); // 销毁 ECharts 实例
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
  margin-top: 20px;
  border-radius: 10px;
  background: transparent;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
