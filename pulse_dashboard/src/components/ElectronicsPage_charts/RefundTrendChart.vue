<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getRefundData } from '@/api/index'; // 确保正确导入封装的 API 方法
import * as echarts from 'echarts';

const chart = ref(null); // 图表容器
let myChart = null; // 图表实例

// 获取电子产品的退款数据
const fetchRefundData = async () => {
  try {
    const response = await getRefundData(); // 从 API 获取数据
    const data = response.data;

    // 按日期升序排序，确保旧日期在左、新日期在右
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    return data;
  } catch (error) {
    console.error('获取电子产品的退款数据失败:', error);
    return [];
  }
};

// 渲染折线图与柱状图
const renderChart = async () => {
  if (!chart.value) return;

  if (!myChart) {
    myChart = echarts.init(chart.value); // 初始化图表实例
  }

  const data = await fetchRefundData(); // 获取数据

  const option = {
    backgroundColor: 'transparent', // 设置透明背景
    title: {
      text: '退款趋势分析',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 20,
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
            param.seriesName === '退款率' ? param.data + '%' : '￥' + param.data
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
        fontSize: 14,
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '25%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(item => new Date(item.date).toLocaleDateString('zh-CN')), // 格式化日期为 YYYY/MM/DD
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        // 移除旋转
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '退款金额 (元)',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: {
          color: '#ffffff',
          fontSize: 12,
        },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      },
      {
        type: 'value',
        name: '退款率 (%)',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: {
          color: '#ffffff',
          fontSize: 12,
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '退款金额',
        type: 'bar',
        data: data.map(item => item.refund_amount),
        barWidth: '20%',
        itemStyle: {
          color: '#5dc5ef',
          borderRadius: [5, 5, 0, 0], // 柱状图圆角
        },
        label: {
          show: true,
          position: 'top',
          color: '#ffffff',
          fontSize: 10,
          formatter: '￥{c}',
        },
      },
      {
        name: '退款率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => (item.refund_rate * 100).toFixed(2)), // 转换为百分比
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
          position: 'top',
          formatter: '{c}%',
          color: '#ffffff',
          fontSize: 10,
        },
      },
    ],
  };

  myChart.setOption(option);

  // 自动适应窗口大小
  window.addEventListener('resize', () => myChart.resize());
};

onMounted(() => {
  renderChart();
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px; /* 调整高度为适中 */
  margin-top: 20px;
  border-radius: 15px; /* 圆角样式 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); /* 添加柔和阴影 */
  background: transparent; /* 背景透明 */
}
</style>
