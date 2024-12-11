<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

const chart = ref(null); // 图表容器

// 获取分时销售量数据
const fetchTimeSales = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/time-sales');
    const data = response.data.map(item => ({
      hour: `${item.hour}:00`,
      sales: parseFloat(item.sales), // 将销售量转换为数字类型
    }));
    renderChart(data);
  } catch (error) {
    console.error('获取分时销售量数据失败:', error);
  }
};

// 渲染图表
const renderChart = (data) => {
  if (!chart.value) return;

  const myChart = echarts.init(chart.value);
  const option = {
    title: {
      text: '分时销售量统计',
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
      formatter: (params) => {
        let tooltip = `<b>${params[0].axisValueLabel}</b><br>`;
        params.forEach(param => {
          tooltip += `${param.marker} ${param.seriesName}: ${param.data}<br>`;
        });
        return tooltip;
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.hour),
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: { color: '#ffffff' },
    },
    yAxis: {
      type: 'value',
      name: '销售量 (元)',
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: { color: '#ffffff' },
      splitLine: { lineStyle: { color: '#444' } },
    },
    series: [
      {
        name: '销售量',
        type: 'bar',
        data: data.map(item => item.sales),
        barWidth: 15,
        itemStyle: {
          color: '#5dc5ef',
          borderRadius: [5, 5, 0, 0],
        },
      },
    ],
  };

  myChart.setOption(option);

  // 自动适应窗口大小
  window.addEventListener('resize', () => myChart.resize());
};

// 加载数据并渲染图表
onMounted(() => {
  fetchTimeSales();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px; /* 图表高度 */
  margin-top: 20px;
  border-radius: 10px; /* 圆角样式 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影 */
}
</style>
