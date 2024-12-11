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

// 获取退款趋势数据
const fetchRefundTrend = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/RE');
    const data = response.data.map(item => ({
      date: item.date,
      refundAmount: item.refund_amount,
      refundRate: item.refund_rate * 100, // 转换为百分比
    }));
    renderChart(data);
  } catch (error) {
    console.error('获取退款趋势数据失败:', error);
  }
};

// 渲染折线图与柱状图
const renderChart = (data) => {
  if (!chart.value) return;

  const myChart = echarts.init(chart.value);
  const option = {
    title: {
      text: '退款趋势分析',
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
            param.seriesName === '退款率' ? param.data + '%' : param.data
          }<br>`;
        });
        return tooltip;
      },
    },
    legend: {
      data: ['退款金额', '退款率'],
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
        name: '退款金额',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: { color: '#ffffff' },
        splitLine: { lineStyle: { color: '#444' } },
      },
      {
        type: 'value',
        name: '退款率 (%)',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: { color: '#ffffff' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '退款金额',
        type: 'bar',
        data: data.map(item => item.refundAmount),
        barWidth: 15,
        itemStyle: {
          color: '#5dc5ef',
          borderRadius: [5, 5, 0, 0],
        },
      },
      {
        name: '退款率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.refundRate),
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
  fetchRefundTrend();
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
