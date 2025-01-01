<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

const chart = ref(null);
let myChart = null;
let intervalId = null; // 定时器 ID

// 获取家居用品产品类型销售金额占比数据
const fetchFurnitureHomeTypeRatio = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/FUR_HOME_TYPE_RATIO');
    const data = response.data.map(item => ({
      type: item.product_type,
      ratio: parseFloat(item.ratio),
    }));
    if (myChart) {
      updateChart(data); // 更新图表数据
    } else {
      renderChart(data); // 初次渲染图表
    }
  } catch (error) {
    console.error('获取产品类型占比数据失败:', error);
  }
};

// 渲染图表（首次加载）
const renderChart = (data) => {
  if (!chart.value) return;

  myChart = echarts.init(chart.value);
  const option = {
    title: {
      text: '家居用品产品类型销售金额占比',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0, // 调整图例位置到底部
      textStyle: {
        color: '#ffffff',
      },
      data: data.map(item => item.type),
    },
    series: [
      {
        name: '产品类型占比（内层）',
        type: 'pie',
        selectedMode: 'single',
        radius: [0, '35%'], // 调整内环半径
        label: {
          position: 'inner',
          fontSize: 12,
          color: '#ffffff', // 确保内环标签颜色为白色
        },
        labelLine: {
          show: false,
        },
        data: data.map(item => ({
          value: item.ratio * 100,
          name: item.type,
        })),
      },
      {
        name: '产品类型占比（外层）',
        type: 'pie',
        radius: ['40%', '60%'], // 调整外环半径
        label: {
          show: true,
          formatter: '{b}\n({d}%)', // 显示完整百分比
          color: '#ffffff', // 外环标签颜色
          fontSize: 12, // 增大外环标签字体大小
        },
        labelLine: {
          length: 10, // 调整标签线长度
          length2: 10, // 第二段标签线长度
        },
        data: data.map(item => ({
          value: item.ratio * 100,
          name: item.type,
        })),
      },
    ],
  };

  myChart.setOption(option);

  // 自动适应窗口大小
  window.addEventListener('resize', () => myChart.resize());
};

// 更新图表数据（动态更新内容）
const updateChart = (data) => {
  if (!myChart) return;

  const option = {
    legend: {
      data: data.map(item => item.type), // 更新图例数据
    },
    series: [
      {
        data: data.map(item => ({
          value: item.ratio * 100,
          name: item.type,
        })),
      },
      {
        data: data.map(item => ({
          value: item.ratio * 100,
          name: item.type,
        })),
      },
    ],
  };

  myChart.setOption(option); // 动态更新图表内容
};

// 启动定时轮询
const startPolling = () => {
  fetchFurnitureHomeTypeRatio(); // 初次加载数据
  intervalId = setInterval(() => {
    fetchFurnitureHomeTypeRatio(); // 每隔 5 秒获取一次数据
  }, 5000);
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
  renderChart([]); // 初始化空图表
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
  margin-top: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
