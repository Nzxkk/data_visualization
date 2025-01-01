<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chart = ref(null);

const data = [
  { name: '沙发', value: 12345 },
  { name: '桌子', value: 67890 },
  { name: '椅子', value: 34567 },
  { name: '床', value: 45678 },
  { name: '柜子', value: 23456 },
];

const renderChart = () => {
  if (!chart.value) return;

  const myChart = echarts.init(chart.value);

  const option = {
    title: {
      text: 'Top 5 家居用品产品销量',
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
      max: Math.ceil(Math.max(...data.map(item => item.value)) * 1.1),
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: {
        color: '#ffffff',
        formatter: (value) => value.toLocaleString(),
        fontSize: 12,
        rotate: 45, // 标签旋转
        margin: 10,
      },
      splitLine: { lineStyle: { color: '#444' } },
      splitNumber: 5, // 限制分割数
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: { color: '#ffffff' },
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: data.map(item => ({
          value: item.value,
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

onMounted(() => {
  renderChart();
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
