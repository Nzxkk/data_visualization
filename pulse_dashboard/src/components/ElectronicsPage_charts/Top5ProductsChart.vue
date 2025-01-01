<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getTopProducts } from '@/api/index';
import * as echarts from 'echarts';

const chart = ref(null);
let myChart = null;
let intervalId = null;

const fetchTopProducts = async () => {
  try {
    const response = await getTopProducts();
    return response.data;
  } catch (error) {
    console.error('获取数据失败:', error);
    return [];
  }
};

const renderChart = async () => {
  const data = await fetchTopProducts();
  const productNames = data.map(item => item.product_name);
  const quantities = data.map(item => item.total_quantity);
  const maxValue = Math.max(...quantities);
  const formattedData = quantities.map(value => {
    if (value === maxValue) {
      return {
        value,
        itemStyle: {
          color: '#1e3a8a',
        },
      };
    }
    return value;
  });

  const option = {
    backgroundColor: 'transparent', // 设置背景为完全透明
    title: {
      text: '电子产品热销排行榜前五',
      left: 'center',
      top: '1%',
      textStyle: {
        fontSize: 20,
        color: '#ffffff',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['销售量'],
      top: '5%',
      left: '70%',
      textStyle: {
        color: '#ffffff',
        fontSize: 10,
      },
    },
    grid: {
      top: '35%',
      left: '10%',
      right: '10%',
      bottom: '20%', // 增加底部空间，防止标签被截断
    },
    xAxis: {
      type: 'category',
      data: productNames,
      axisLabel: {
        color: '#ffffff',
        fontSize: 10,
        rotate: 45, // 使标签倾斜显示，避免重叠
        formatter: function (value) {
          // 实现换行显示
          return value.length > 6 ? value.slice(0, 6) + '\n' + value.slice(6) : value;
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#ffffff',
        fontSize: 10,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
    series: [
      {
        name: '销售量',
        type: 'bar',
        data: formattedData,
        itemStyle: {
          color: '#3398DB',
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          color: '#ffffff',
          fontSize: 10,
        },
        barWidth: '40%',
      },
    ],
  };
  myChart.setOption(option);
};

const startPolling = () => {
  renderChart();
  intervalId = setInterval(() => {
    renderChart();
  }, 5000);
};

const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

onMounted(() => {
  myChart = echarts.init(chart.value);
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
  width: 80%;
  max-width: 800px;
  height: 300px;
  margin: 20px auto;
  border-radius: 10px;
  overflow: hidden;
  background: transparent; /* 确保背景完全透明 */
}

@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }
}
</style>
