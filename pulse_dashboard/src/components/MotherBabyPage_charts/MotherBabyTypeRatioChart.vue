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

// 获取母婴用品退款数据
const fetchRefundData = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/mb-refund-data'); // 替换为实际 API 地址
    const data = response.data.map(item => ({
      date: item.date.split('T')[0], // 仅保留日期部分
      refundAmount: item.refund_amount, // 退款金额
      refundRate: (item.refund_rate * 100).toFixed(2), // 格式化退款率为百分比
    }));

    // 按日期升序排序（从旧到新）
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    renderChart(data); // 渲染图表
  } catch (error) {
    console.error('获取母婴退款数据失败:', error);
  }
};

// 渲染图表函数
const renderChart = (data) => {
  if (!chart.value) return;

  if (!myChart) {
    myChart = echarts.init(chart.value); // 初始化图表实例
  }

  const option = {
    title: {
      text: '母婴用品退款数据',
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
        if (!params || params.length === 0) return '暂无数据'; // 避免空数据报错
        let tooltip = `<b>${params[0].axisValueLabel}</b><br>`;
        params.forEach(param => {
          tooltip += `${param.marker} ${param.seriesName}: ${
            param.seriesName === '退款率' ? param.data + '%' : '￥' + param.data
          }<br>`;
        });
        return tooltip;
      },
      textStyle: {
        color: '#ffffff',
      },
    },
    legend: {
      data: ['退款金额', '退款率'],
      top: '5%',
      textStyle: {
        color: '#ffffff',
      },
    },
    grid: {
      top: '20%',
      left: '10%',
      right: '10%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date), // 仅显示日期部分，按升序排列
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: {
        color: '#ffffff',
        formatter: (value) => value, // 确保只显示日期
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '退款金额',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: {
          formatter: '{value} 元',
          color: '#ffffff',
        },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      },
      {
        type: 'value',
        name: '退款率 (%)',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: {
          formatter: '{value} %',
          color: '#ffffff',
        },
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
        label: {
          show: true,
          position: 'top',
          formatter: '￥{c}',
          color: '#ffffff',
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
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#ffffff',
        },
      },
    ],
  };

  myChart.setOption(option); // 设置图表配置
};

// 定时轮询
const startPolling = () => {
  fetchRefundData(); // 首次加载数据
  intervalId = setInterval(() => {
    fetchRefundData(); // 每 5 秒更新一次数据
  }, 5000);
};

// 停止轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
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
  height: 400px;
  margin: 20px auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: transparent; /* 确保容器背景透明 */
}

/* 响应式支持 */
@media (max-width: 768px) {
  .chart-container {
    height: 300px; /* 小屏幕高度适配 */
  }
}
</style>
