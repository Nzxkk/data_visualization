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

// 固定颜色数组
const fixedColors = ['#3398DB', '#FF9F7F', '#FFD700', '#37A2DA', '#32C5E9'];

// 获取数据函数
const fetchData = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/FUR_BRAND_HOME');
    const data = response.data.map((item, index) => ({
      name: item.brand_name,
      value: item.total_sales,
      color: fixedColors[index % fixedColors.length], // 使用固定颜色数组循环分配颜色
    }));

    console.log('Processed Data:', data); // 打印处理后的数据
    if (data.length > 0) {
      updateChart(data); // 动态更新图表数据
    } else {
      console.warn('数据为空');
      updateChart([]); // 渲染空数据
    }
  } catch (error) {
    console.error('数据获取失败:', error);
  }
};

// 渲染图表（首次加载）
const renderChart = (data) => {
  if (!chart.value) return;

  myChart = echarts.init(chart.value); // 初始化图表实例

  const option = {
    title: {
      text: '家居品牌销售分布',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}', // 显示数据名称和值
    },
    polar: {}, // 定义极坐标系
    angleAxis: {
      type: 'category',
      data: data.map((item) => item.name), // 分类数据
      axisLabel: {
        color: '#ffffff',
        interval: 0,
        fontSize: 10,
        margin: 5, // 增加间距
      },
    },
    radiusAxis: {
      axisLabel: {
        color: '#ffffff', // 半径轴标签颜色
      },
    },
    series: [
      {
        type: 'bar',
        data: data.map((item) => ({
          value: item.value,
          itemStyle: {
            color: item.color, // 使用固定颜色
          },
        })),
        coordinateSystem: 'polar', // 使用极坐标系
        barWidth: 20, // 柱条宽度
        label: {
          show: true, // 显示标签
          position: 'outside', // 标签位置
          color: '#ffffff', // 标签颜色
          fontSize: 10, // 标签字体大小
          formatter: '{c}', // 格式化为柱条的值
        },
      },
    ],
  };

  myChart.setOption(option); // 设置图表配置项
};

// 更新图表（动态更新数据，不刷新）
const updateChart = (data) => {
  if (!myChart) {
    console.error('图表未初始化');
    return;
  }

  console.log('Updating Chart with Data:', data); // 打印更新数据

  myChart.setOption({
    angleAxis: {
      data: data.map((item) => item.name), // 动态更新角轴数据
    },
    series: [
      {
        data: data.map((item) => ({
          value: item.value,
          itemStyle: {
            color: item.color, // 使用固定颜色
          },
        })), // 动态更新系列数据
      },
    ],
    animationDurationUpdate: 1000, // 更新动画持续时间
    animationEasingUpdate: 'cubicOut', // 更新动画缓动效果
  });
};

// 启动定时轮询
const startPolling = () => {
  fetchData(); // 首次加载数据
  intervalId = setInterval(() => {
    fetchData(); // 每隔 5 秒获取一次数据
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
  if (chart.value) {
    console.log('Chart container mounted:', chart.value); // 确保 DOM 容器存在
    renderChart([]); // 初始化空图表
    startPolling(); // 启动定时轮询
  }
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
  background: transparent;
}
</style>
