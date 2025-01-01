<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getFoodRefundData } from '@/api/index'; // 确保正确导入封装的 API 方法
import * as echarts from 'echarts';

const chart = ref(null); // 图表容器
let myChart = null; // 图表实例
let intervalId = null; // 定时轮询 ID

// 格式化时间为 YYYY-MM-DD，仅显示日期
const formatDate = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 渲染折线图与柱状图
const renderChart = (data) => {
  if (!chart.value) return;

  if (!myChart) {
    myChart = echarts.init(chart.value); // 初始化 ECharts 实例
  }

  const option = {
    title: {
      text: '食品退款趋势分析',
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
            param.seriesName === '退款率' ? `${param.data}%` : `￥${param.data}`
          }<br>`;
        });
        return tooltip;
      },
    },
    legend: {
      data: ['退款金额', '退款率'],
      top: '7%',
      textStyle: {
        color: '#ffffff',
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top:'20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date), // 使用格式化后的日期
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: {
        color: '#ffffff',
        rotate: 0, // 旋转标签以防止重叠
        fontSize: 12,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '退款金额 (元)',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: {
          color: '#ffffff',
          formatter: '{value} 元',
        },
        splitLine: { lineStyle: { color: '#444' } },
      },
      {
        type: 'value',
        name: '退款率 (%)',
        axisLine: { lineStyle: { color: '#ffffff' } },
        axisLabel: {
          color: '#ffffff',
          formatter: '{value} %',
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '退款金额',
        type: 'bar',
        data: data.map(item => item.refund_amount),
        barWidth: 14,
        itemStyle: {
          color: '#5dc5ef',
          borderRadius: [10, 10, 0, 0],
        },
        label: {
          show: true,
          position: 'insideTop', // 调整标签位置
          distance: 10,
          color: '#ffffff',
        },
      },
      {
        name: '退款率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => (item.refund_rate * 100).toFixed(2)), // 保留两位小数
        smooth: true,
        lineStyle: {
          color: '#ff7043',
          width: 2,
        },
        itemStyle: {
          color: '#ff7043',
        },
        label: {
          show: true,
          position: 'top',
          distance: 10,
          color: '#ffffff',
          formatter: '{c}%', // 显示带百分号的退款率
        },
      },
    ],
  };

  myChart.setOption(option);
};

// 获取食品退款数据
const fetchRefundData = async () => {
  try {
    const response = await getFoodRefundData(); // 从 API 获取数据
    const formattedData = response.data.map(item => ({
      date: formatDate(item.date), // 格式化时间，仅显示日期
      refund_amount: parseFloat(item.refund_amount),
      refund_rate: parseFloat(item.refund_rate),
    }));
    return formattedData;
  } catch (error) {
    console.error('获取食品的退款数据失败:', error);
    return [];
  }
};

// 定时轮询，动态更新图表数据
const startPolling = () => {
  const updateData = async () => {
    const data = await fetchRefundData(); // 获取最新数据
    renderChart(data); // 更新图表内容
  };

  updateData(); // 首次加载数据
  intervalId = setInterval(updateData, 5000); // 每隔 5 秒刷新一次数据
};

// 停止定时轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 生命周期管理
onMounted(() => {
  startPolling(); // 启动轮询
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
  height: 450px; /* 图表高度 */
  margin-top: 20px;
  border-radius: 15px; /* 更大的圆角样式 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); /* 增加更深的阴影 */
  background: transparent; /* 半透明背景 */
}
</style>
