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

// 格式化时间为 YYYY-MM-DD，仅显示日期
const formatDate = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取实时销售数据
const fetchSalesData = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/total-food-sales'); // 替换为你的API地址
    const rawData = response.data;

    const formattedData = rawData.map((item) => ({
      date: formatDate(item.date), // 仅格式化日期
      total_sales: parseFloat(item.total_sales),
    }));

    // 按日期升序排序（旧日期在左，新日期在右）
    formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 计算变化率（%）
    const changeRates = formattedData.map((item, index, arr) => {
      if (index === 0) return 0; // 第一个数据没有变化率
      const prev = arr[index - 1].total_sales;
      return ((item.total_sales - prev) / prev * 100).toFixed(2); // 保留两位小数
    });

    return { formattedData, changeRates };
  } catch (error) {
    console.error('获取实时销售数据失败:', error);
    return { formattedData: [], changeRates: [] };
  }
};

// 渲染图表
const renderChart = async () => {
  if (!chart.value) return;

  if (!myChart) {
    myChart = echarts.init(chart.value); // 初始化图表实例
  }

  const { formattedData, changeRates } = await fetchSalesData();

  const option = {
    title: {
      text: '实时食品销售额与变化率',
      left: 'center',
      textStyle: {
        fontSize: 19,
        color: '#ffffff',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        const sales = params[0] ? `￥${params[0].value}` : '无';
        const changeRate = params[1] ? `${params[1].value}%` : '无';
        return `
          <b>${params[0].axisValue}</b><br/>
          销售额: ${sales}<br/>
          变化率: ${changeRate}
        `;
      },
      textStyle: {
        color: '#ffffff',
      },
    },
    legend: {
      data: ['销售额', '变化率'],
      top: '10%',
      textStyle: {
        color: '#ffffff',
        fontSize: 14,
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '30%', // 增加底部间距
      top: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: formattedData.map(item => item.date),
      axisLabel: {
        color: '#ffffff',
        rotate: 0, // 旋转标签
        fontSize: 12, // 字体适中
        margin: 10,
      },
      axisLine: { lineStyle: { color: '#ffffff' } },
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额 (元)',
        axisLabel: {
          formatter: '{value} 元', // 添加‘元’单位
          color: '#ffffff',
          fontSize: 12, // 增大字体
        },
        axisLine: { lineStyle: { color: '#ffffff' } },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
      },
      {
        type: 'value',
        name: '变化率 (%)',
        axisLabel: {
          formatter: '{value} %', // 添加‘%’单位
          color: '#ffffff',
          fontSize: 10, // 增大字体
        },
        axisLine: { lineStyle: { color: '#ffffff' } },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: formattedData.map(item => item.total_sales),
        itemStyle: {
          color: '#5dc5ef',
          borderRadius: [10, 10, 0, 0], // 圆角
        },
        barWidth: '25%', // 调整柱宽
        label: {
          show: true,
          position: 'top',
          color: '#ffffff',
          fontSize: 12,
        },
      },
      {
        name: '变化率',
        type: 'line',
        yAxisIndex: 1,
        data: changeRates,
        smooth: true,
        lineStyle: {
          color: '#ff7043',
          width: 1, // 加粗线条
        },
        itemStyle: {
          color: '#ff7043',
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

  // 自动调整大小
  window.addEventListener('resize', () => myChart.resize());
};

// 定时轮询
const startPolling = () => {
  renderChart(); // 初次加载数据
  intervalId = setInterval(renderChart, 5000); // 每 5 秒刷新一次
};

// 停止轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

onMounted(() => {
  startPolling();
});

onBeforeUnmount(() => {
  stopPolling();
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 500px; /* 放大图表高度 */
  margin: 20px auto;
  border-radius: 15px; /* 更圆滑的边角 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); /* 更深的阴影 */
  background: transparent;
}

/* 响应式支持 */
@media (max-width: 768px) {
  .chart-container {
    height: 400px; /* 小屏幕适配 */
  }
}
</style>
