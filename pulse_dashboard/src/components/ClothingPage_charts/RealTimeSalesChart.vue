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
let intervalId = null;

// 格式化日期为短日期
const formatDate = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取实时销售数据
const fetchRealTimeSales = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/TIME');
    const data = response.data.map(item => ({
      date: formatDate(item.date),
      totalSales: item.total_sales_amount,
      growthRate: (item.year_on_year_growth_rate * 100).toFixed(2), // 转换为百分比
    }));
    updateChart(data);
  } catch (error) {
    console.error('获取实时销售数据失败:', error);
  }
};

// 更新图表
const updateChart = (data) => {
  if (!chart.value) return;

  if (!myChart) {
    myChart = echarts.init(chart.value); // 初始化图表实例
  }

  const option = {
    title: {
      text: '实时销售额及同比增长率',
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
        type: 'cross',
      },
      formatter: (params) => {
        let tooltip = `<b>${params[0].axisValueLabel}</b><br>`;
        params.forEach(param => {
          tooltip += `${param.marker} ${param.seriesName}: ${
            param.seriesName === '同比增长率' ? param.data + '%' : param.data
          }<br>`;
        });
        return tooltip;
      },
    },
    legend: {
      data: ['销售额', '同比增长率'],
      top: '5%',
      textStyle: {
        color: '#ffffff',
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '20%',
      bottom: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLabel: {
        color: '#ffffff',
        rotate: 0, // 将角度调整为水平显示
        fontSize: 10,
        margin: 10,
        interval: 0, // 保证每个标签都显示
      },
      axisLine: { lineStyle: { color: '#ffffff' } },
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: { color: '#ffffff' },
        splitLine: { lineStyle: { color: '#444' } },
      },
      {
        type: 'value',
        name: '同比增长率 (%)',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: { color: '#ffffff' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: data.map(item => item.totalSales),
        barWidth: '30%', // 缩小柱状图宽度，避免遮挡
        itemStyle: {
          color: '#1e3a8a',
        },
        label: {
          show: true,
          position: 'insideTop', // 将标签放置柱子内部顶部
          color: '#ffffff',
          fontSize: 10,
        },
      },
      {
        name: '同比增长率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.growthRate),
        smooth: true,
        lineStyle: {
          color: '#ff7c7c',
          width: 2,
        },
        itemStyle: {
          color: '#ff7c7c',
        },
        label: {
          show: true,
          position: 'top', // 折线图标签放在顶部
          distance: 15, // 增加标签与数据点之间的距离
          formatter: '{c}%',
          color: '#ffffff',
          fontSize: 10,
        },
      },
    ],
  };

  myChart.setOption(option);

  // 自动调整窗口大小
  window.addEventListener('resize', () => myChart.resize());
};

// 定时轮询
const startPolling = () => {
  fetchRealTimeSales(); // 首次加载数据
  intervalId = setInterval(fetchRealTimeSales, 5000); // 每5秒刷新一次数据
};

// 停止轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId); // 清除定时器
    intervalId = null; // 重置定时器 ID
  }
};

// 生命周期管理
onMounted(() => {
  startPolling(); // 启动定时轮询
});

onBeforeUnmount(() => {
  stopPolling(); // 停止轮询
  if (myChart) {
    myChart.dispose(); // 销毁图表实例
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px; /* 图表高度 */
  margin-top: 20px;
  border-radius: 10px; /* 圆角样式 */
  background: transparent; /* 背景透明 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影 */
}
</style>
