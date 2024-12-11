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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';

const chart = ref(null); // 图表容器
const selectedCategory = ref('product_type'); // 默认选择产品类型
const options = [
  { label: '按类型统计', value: 'product_type' },
  { label: '按品牌统计', value: 'brand_name' },
]; // 控制按钮的选项

// 生成颜色函数
const generateColor = () => `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

// 根据类别获取数据
const fetchData = async (category) => {
  try {
    let url;
    if (category === 'product_type') {
      url = 'http://127.0.0.1:3006/api/CLO';
    } else if (category === 'brand_name') {
      url = 'http://127.0.0.1:3006/api/CLOBrand';
    }
    const response = await axios.get(url);
    const data = response.data.map(item => ({
      name: item[category],
      value: item.total_quantity,
    }));
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
      text: category === 'product_type' ? '服装类型分布' : '服装品牌分布',
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
      left: '12%',
      right: '12%',
      top: '15%',
      bottom: '20%', // 加大底部间距，防止重叠
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
        name: category === 'product_type' ? '数量' : '销售量',
        type: 'bar',
        data: data.map(item => ({
          value: item.value,
          itemStyle: { 
            color: generateColor(),
            borderRadius: [5, 5, 5, 5], // 圆角设置，统一为5px
          },
        })),
        barWidth: 12, // 更窄的条形
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
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 350px; /* 降低高度，避免重叠 */
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
