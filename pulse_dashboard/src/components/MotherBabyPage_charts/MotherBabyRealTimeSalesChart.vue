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

// 获取母婴用品实时销售数据
const fetchRealTimeMotherBabySales = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/MB_TIME'); // 替换为实际 API 地址
    const data = response.data.map(item => ({
      date: new Date(item.date).toLocaleDateString(), // 格式化日期
      totalSales: item.total_sales_amount,
      growthRate: (item.year_on_year_growth_rate * 100).toFixed(2), // 格式化同比增长率为百分比
    }));

    renderChart(data); // 渲染图表
  } catch (error) {
    console.error('获取实时销售数据失败:', error);
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
      text: '实时母婴用品销售额及同比增长率',
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
            param.seriesName === '同比增长率' ? param.data + '%' : '￥' + param.data
          }<br>`;
        });
        return tooltip;
      },
      backgroundColor: 'transparent', // 设置透明背景
      borderColor: 'transparent', // 去除边框颜色
      textStyle: {
        color: '#ffffff', // 文字颜色
      },
    },
    legend: {
      data: ['销售额', '同比增长率'],
      top: '10%',
      textStyle: {
        color: '#ffffff',
      },
      backgroundColor: 'transparent', // 去除图例背景色
    },
    grid: {
      top:'20%',
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
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
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
        label: {
          show: true,
          position: 'top',
          formatter: '￥{c}',
          color: '#ffffff',
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
  fetchRealTimeMotherBabySales(); // 首次加载数据
  intervalId = setInterval(() => {
    fetchRealTimeMotherBabySales(); // 每 5 秒更新一次数据
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
  height: 450px;
  margin-top: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: transparent; /* 确保容器背景透明 */
}

/* 响应式支持 */
@media (max-width: 768px) {
  .chart-container {
    height: 350px; /* 小屏幕高度适配 */
  }
}
</style>
