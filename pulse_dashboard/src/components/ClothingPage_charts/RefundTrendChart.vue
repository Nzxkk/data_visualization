<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

const chart = ref(null); // 图表容器
let myChart = null; // 图表实例
let intervalId = null; // 定时轮询 ID

// 获取退款趋势数据
const fetchRefundTrend = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/RE'); // 替换为你的API地址
    const data = response.data.map(item => ({
      date: item.date, // 日期
      refundAmount: item.refund_amount, // 退款金额
      refundRate: (item.refund_rate * 100).toFixed(2), // 退款率转换为百分比
    }));
    updateChart(data);
  } catch (error) {
    console.error('获取退款趋势数据失败:', error);
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
      top: '30%',
      left: '10%',
      right: '10%',
      bottom: '5%',
      containLabel: true,
    },
    xAxis: {
  type: 'category',
  data: data.map(item => item.date), // 使用日期作为 X 轴
  axisLine: { lineStyle: { color: '#ffffff' } },
  axisLabel: {
    color: '#ffffff',
    rotate: 0, // 旋转标签，避免重叠
    fontSize: 10,
    formatter: (value) => {
      // 假设 `value` 为完整的日期时间字符串，只提取日期部分
      return value.split('T')[0]; // 提取日期部分，例如 '2024-12-24T16:00:00.000Z' -> '2024-12-24'
    },
  },
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
        data: data.map(item => item.refundAmount), // 退款金额数据
        barWidth: '30%', // 调整柱宽
        itemStyle: {
          color: '#1e3a8a', // 柱子颜色
        },
        label: {
          show: true,
          position: 'top', // 标签显示在柱子顶部
          color: '#ffffff',
          fontSize: 10,
        },
      },
      {
        name: '退款率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.refundRate), // 退款率数据
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
          position: 'top', // 标签显示在线条顶部
          formatter: '{c}%', // 显示百分比
          color: '#ffffff',
          fontSize: 10,
        },
      },
    ],
  };

  myChart.setOption(option);

  // 响应窗口大小变化
  window.addEventListener('resize', () => myChart.resize());
};

// 定时轮询
const startPolling = () => {
  fetchRefundTrend(); // 初次加载数据
  intervalId = setInterval(fetchRefundTrend, 5000); // 每 5 秒刷新一次数据
};

// 停止轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId); // 清除定时器
    intervalId = null; // 重置定时器 ID
  }
};

// 生命周期钩子
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
