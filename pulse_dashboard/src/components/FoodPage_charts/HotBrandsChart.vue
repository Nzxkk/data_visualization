<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';

const chart = ref(null);
let myChart = null; // 图表实例
let intervalId = null; // 定时器 ID

// 渲染圆环图
const renderChart = (data) => {
  if (!chart.value) return;

  // 初始化图表实例
  if (!myChart) {
    myChart = echarts.init(chart.value);
  }

  const option = {
    title: {
      text: '产品类型分布',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)', // 显示名称、值和占比
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#ffffff',
      },
      data: data.map(item => item.product_type), // 显示每个产品类型
    },
    series: [
      {
        name: '产品类型',
        type: 'pie',
        radius: ['40%', '70%'], // 设置内外半径，形成环形效果
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{d}%', // 显示名称和占比
          color: '#ffffff',
        },
        labelLine: {
          length: 15, // 连接线长度
          length2: 10, // 标签延伸线长度
          lineStyle: {
            color: 'transparent', // 设置连接线颜色
          },
        },
        data: data.map(item => ({
          name: item.product_type, // 产品类型
          value: item.total_quantity, // 对应销售量
        })),
        itemStyle: {
          borderRadius: 0, // 每块区域的圆角处理
          borderColor: 'transparent',
          borderWidth: 2,
        },
      },
    ],
  };

  // 设置图表配置
  myChart.setOption(option);
};

// 获取数据并渲染圆环图
const fetchProductTypeDistribution = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/GET_PRODUCT_TYPE_DISTRIBUTION');
    const data = response.data;
    renderChart(data);
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 定时轮询功能
const startPolling = () => {
  fetchProductTypeDistribution(); // 首次加载数据
  intervalId = setInterval(() => {
    fetchProductTypeDistribution(); // 每 5 秒更新数据
  }, 5000);
};

// 停止轮询功能
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 生命周期钩子
onMounted(() => {
  startPolling(); // 启动定时轮询
});

onBeforeUnmount(() => {
  stopPolling(); // 停止定时轮询
  if (myChart) {
    myChart.dispose(); // 销毁图表实例
  }
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
