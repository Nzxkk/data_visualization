<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud'; // 确保已安装词云插件
import { getWordCloudData } from '@/api/index'; // 调用封装的 API 方法

const chart = ref(null);
const wordCloudData = ref([]);

// 获取词云数据并处理
const fetchWordCloudData = async () => {
  try {
    const response = await getWordCloudData();
    wordCloudData.value = response.data.map(item => ({
      name: item.brand_name,
      value: item.total_sales,
    }));
    renderChart();
  } catch (error) {
    console.error('获取词云数据失败:', error);
  }
};

// 渲染词云图表
const renderChart = () => {
  if (!chart.value) return;

  const myChart = echarts.init(chart.value);
  const option = {
    title: {
      text: '销售品牌一览', // 设置标题内容
      left: 'center', // 标题居中
      top: '10%', // 向下移动标题
      textStyle: {
        color: '#ffffff', // 白色标题
        fontSize: 18, // 字体大小
        fontWeight: 'bold',
      },
    },
    tooltip: {
      show: true,
    },
    series: [
      {
        type: 'wordCloud',
        gridSize: 10,
        sizeRange: [12, 50],
        rotationRange: [0, 0], // 不旋转文字
        shape: 'circle', // 圆形词云
        textStyle: {
          color: () =>
            `rgb(${Math.round(Math.random() * 255)}, ${Math.round(
              Math.random() * 255
            )}, ${Math.round(Math.random() * 255)})`,
        },
        data: wordCloudData.value,
      },
    ],
  };
  myChart.setOption(option);

  // 自动适应窗口大小
  window.addEventListener('resize', () => myChart.resize());
};

onMounted(fetchWordCloudData);
</script>

<style scoped lang="less">
.chart-container {
  width: 100%; /* 占满父容器宽度 */
  height: 300px; /* 限制高度 */
  max-width: 100%; /* 确保不会超出页面 */
  overflow: hidden; /* 防止内容超出 */
}
</style>
