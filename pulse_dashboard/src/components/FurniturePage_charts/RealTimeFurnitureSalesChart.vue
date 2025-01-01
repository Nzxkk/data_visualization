<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';
import dayjs from 'dayjs'; // 引入dayjs库用于日期格式化

const chart = ref(null); // 图表容器

// 获取家居用品实时销售数据
const fetchRealTimeFurnitureSales = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/FUR_HOME_TIME');
    const data = response.data.map(item => ({
      date: dayjs(item.date).format('YYYY-MM-DD'), // 将日期格式修改为只显示到日
      totalSales: item.total_sales_amount,
      growthRate: (item.year_on_year_growth_rate * 100).toFixed(2),
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
      text: '实时家居用品销售额及同比增长率',
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
            param.seriesName === '同比增长率'? param.data + '%' : param.data
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
  fetchRealTimeFurnitureSales();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
  margin-top: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>