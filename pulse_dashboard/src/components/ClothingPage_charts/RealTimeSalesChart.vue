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

// 获取实时销售数据
const fetchRealTimeSales = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/TIME');
    const data = response.data.map(item => ({
      date: item.date,
      totalSales: item.total_sales_amount,
      growthRate: (item.year_on_year_growth_rate * 100).toFixed(2), // 转换为百分比并保留两位小数
    }));
    renderChart(data);
  } catch (error) {
    console.error('获取实时销售数据失败:', error);
  }
};

// 渲染图表
const renderChart = (data) => {
  if (!chart.value) return;

  const myChart = echarts.init(chart.value);
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
      top: '10%',
      textStyle: {
        color: '#ffffff',
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
      data: data.map(item => item.date),
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: { color: '#ffffff' },
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
        barWidth: 15,
        itemStyle: {
          color: '#5dc5ef',
          borderRadius: [5, 5, 0, 0],
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
      },
    ],
  };

  myChart.setOption(option);

  // 自动适应窗口大小
  window.addEventListener('resize', () => myChart.resize());
};

// 加载数据并渲染图表
onMounted(() => {
  fetchRealTimeSales();
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
