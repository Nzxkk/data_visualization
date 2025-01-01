<template>
  <div class="chart-container">
    <div ref="chart" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import chinaMapData from '@/assets/MapData/china.json'; // 确保路径正确，包含中国地图的 GeoJSON 数据

const chart = ref(null); // 图表容器
let myChart = null; // 图表实例
let intervalId = null; // 定时器 ID

// 验证数据格式
const validateData = (data) => {
  if (!Array.isArray(data)) {
    console.error('数据格式错误: 数据应为数组');
    return [];
  }
  return data.map((item) => ({
    name: item.province || '未知',
    value: parseFloat(item.sales_volume) || 0,
  }));
};

// 获取省份销售量数据
const fetchFurnitureSalesVolumeByProvince = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/FUR_HOME_PROVINCE_SALES'); // 替换为你的实际 API 地址
    const validatedData = validateData(response.data);
    updateChart(validatedData); // 更新图表数据
  } catch (error) {
    console.error('获取按省份销售量数据失败:', error);
  }
};

// 渲染地图图表（首次加载）
const renderChart = (data) => {
  if (!chart.value) return;

  myChart = echarts.init(chart.value);
  echarts.registerMap('china', chinaMapData); // 注册中国地图数据

  const option = {
    backgroundColor: 'transparent', // 背景透明
    title: {
      text: '各省份家居用品销售量统计',
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
      max: 1, // 初始最大值
      left: 'left',
      bottom: '30px',
      text: ['高', '低'],
      textStyle: {
        color: '#ffffff',
      },
      inRange: {
        color: ['rgba(173, 216, 230, 0.5)', 'rgba(50, 107, 168, 0.8)'], // 透明度统一
      },
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
          areaColor: 'rgba(76, 145, 225, 0.8)', // 默认区域颜色，带统一透明度
          borderColor: 'rgba(255, 255, 255, 0.8)', // 边界颜色
          borderWidth: 0.5, // 边界宽度
        },
        emphasis: {
          label: {
            show: true,
            color: '#000000', // 悬停时省份名称颜色
          },
          itemStyle: {
            areaColor: 'rgba(255, 204, 51, 0.8)', // 鼠标悬停时区域颜色，统一透明度
          },
        },
        data: data,
      },
    ],
  };

  myChart.setOption(option);
};

// 动态更新图表数据（无刷新更新）
const updateChart = (data) => {
  if (!myChart) return;

  const maxValue = Math.max(...data.map((item) => item.value));
  const minValue = Math.min(...data.map((item) => item.value));

  const option = {
    visualMap: {
      min: minValue || 0,
      max: maxValue || 1,
    },
    series: [
      {
        data: data, // 更新数据
      },
    ],
  };

  myChart.setOption(option); // 应用更新后的配置
};

// 启动定时轮询
const startPolling = () => {
  fetchFurnitureSalesVolumeByProvince(); // 初次加载数据
  intervalId = setInterval(() => {
    fetchFurnitureSalesVolumeByProvince(); // 每隔 5 秒获取一次数据
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
  height: 500px;
  margin-top: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}
</style>
