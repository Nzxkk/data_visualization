<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';
import mapJson from '@/assets/MapData/china.json'; // 确保路径正确，引入中国地图 GeoJSON 文件

const chart = ref(null); // 图表容器
let myChart = null; // 图表实例
let intervalId = null; // 定时轮询 ID

// 获取食品按省份统计的销售量数据
const fetchFoodSalesVolumeByProvince = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/FOOD_PROVINCE_SALES');
    const data = response.data.map(item => ({
      name: item.province,
      value: item.sales_volume,
    }));
    updateChart(data); // 更新图表数据
  } catch (error) {
    console.error('获取按省份销售量数据失败:', error);
  }
};

// 初始化图表
const renderChart = (data) => {
  if (!chart.value) return;

  myChart = echarts.init(chart.value);
  echarts.registerMap('china', mapJson); // 注册完整的中国地图数据

  const option = {
    backgroundColor: 'transparent', // 背景设置为深蓝透明
    title: {
      text: '各省份食品销售量统计',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const value = params.value ? params.value : '无数据';
        return `${params.name}<br/>销售量: ${value}`;
      },
    },
    visualMap: {
      min: 0,
      max: 1, // 初始值，稍后动态更新
      left: 'left',
      bottom: '20%',
      text: ['高', '低'], // 显示高低文本
      textStyle: {
        color: '#ffffff', // 设置视觉映射文本颜色
      },
      calculable: true, // 开启滑块
      inRange: {
        color: ['rgba(173, 216, 230, 0.8)', 'rgba(50, 107, 168, 0.8)'], // 浅蓝到深蓝渐变
      },
      formatter: (value) => parseInt(value).toLocaleString(), // 格式化滑块上的值
    },
    series: [
      {
        type: 'map',
        map: 'china',
        roam: true, // 支持缩放和平移
        label: {
          show: true, // 显示省份名称
          color: '#ffffff',
          fontSize: 10,
        },
        itemStyle: {
          areaColor: 'rgba(76, 145, 225, 0.3)', // 默认区域颜色，带透明度
          borderColor: 'rgba(255, 255, 255, 0.8)', // 区域边界颜色
          borderWidth: 0.5, // 边界宽度
        },
        emphasis: {
          label: {
            show: true,
            color: '#FFFB00', // 鼠标悬停时省份名称颜色
          },
          itemStyle: {
            areaColor: 'rgba(255, 204, 51, 0.8)', // 鼠标悬停时区域颜色
          },
        },
        data: data,
      },
    ],
  };

  myChart.setOption(option);
};

// 更新图表数据
const updateChart = (data) => {
  if (!myChart) return;

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));

  const option = {
    visualMap: {
      min: minValue || 0,
      max: maxValue || 1, // 动态更新最大值
    },
    series: [
      {
        data: data, // 动态更新地图数据
      },
    ],
  };

  myChart.setOption(option);
};

// 启动定时轮询
const startPolling = () => {
  fetchFoodSalesVolumeByProvince(); // 首次加载数据
  intervalId = setInterval(() => {
    fetchFoodSalesVolumeByProvince(); // 每隔 5 秒获取一次数据
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
  height: 500px; /* 图表高度 */
  margin-top: 20px;
  border-radius: 10px; /* 圆角样式 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影 */
  background: transparent; /* 背景透明 */
  overflow: hidden;
}

/* 响应式支持 */
@media (max-width: 768px) {
  .chart-container {
    height: 350px; /* 调整小屏幕高度 */
  }
}
</style>
