<template>
  <div>
    <div class="controls">
      <button
        v-for="option in options"
        :key="option.value"
        :class="['control-btn', { active: selectedCategory === option.value }]"
        @click="fetchData(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

const chart = ref(null); // 图表容器
const selectedCategory = ref('product_name'); // 默认选择产品名称
const options = [
  { label: '按产品统计', value: 'product_name' },
  { label: '按品牌统计', value: 'brand_name' },
]; // 控制按钮选项

// 定义预设的颜色数组
const colorPalette = ['#3498db', '#2ecc71', '#f39c12', '#e67e22', '#9b59b6']; // 蓝色，绿色，黄色，橙色，紫色

// 获取数据并渲染图表
const fetchData = async (category) => {
  try {
    let url;
    if (category === 'product_name') {
      url = `http://127.0.0.1:3006/api/TOP5`;
    } else if (category === 'brand_name') {
      url = `http://127.0.0.1:3006/api/TOP5Brand`;
    }
    const response = await axios.get(url);
    const data = response.data
      .map(item => ({
        name: item[category],
        value: item.sales_volume,
      }))
      .slice(0, 5); // 只取前5项数据
    renderChart(data, category);
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 渲染横向条形图
const renderChart = (data, category) => {
  if (!chart.value) return;

  const myChart = echarts.init(chart.value);
  const option = {
    title: {
      text: category === 'product_name' ? 'Top 5 产品销量' : 'Top 5 品牌销量',
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
    },
    grid: {
      left: '15%',
      right: '10%',
      top: '15%',
      bottom: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: { color: '#ffffff' },
      splitLine: { lineStyle: { color: '#444' } },
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLine: { lineStyle: { color: '#ffffff' } },
      axisLabel: { color: '#ffffff' },
    },
    series: [
      {
        name: category === 'product_name' ? '销量' : '销售量',
        type: 'bar',
        data: data.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: colorPalette[index % colorPalette.length], // 循环使用预定义的颜色
            borderRadius: [5, 5, 5, 5], // 圆角设置
          },
        })),
        barWidth: 15, // 调整条形宽度
      },
    ],
  };
  myChart.setOption(option);

  // 响应窗口大小变化
  window.addEventListener('resize', () => myChart.resize());
};

// 初次加载默认渲染
onMounted(() => {
  fetchData(selectedCategory.value);

  // 设置定时器进行轮询，每5秒刷新一次数据
  const interval = setInterval(() => {
    fetchData(selectedCategory.value);
  }, 5000); // 每5秒刷新一次数据

  // 清除定时器，避免组件销毁后仍然在运行
  onBeforeUnmount(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 350px; /* 控制图表高度 */
  margin-top: 20px;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px; /* 增加按钮与图表之间的间距 */
}

.control-btn {
  padding: 10px 20px;
  border: 1px solid #3398db;
  color: #ffffff;
  background-color: transparent;
  cursor: pointer;
  transition: background-color 0.3s;
}

.control-btn.active {
  background-color: #3398db;
}

.control-btn:hover {
  background-color: #1e88e5;
}
</style>
