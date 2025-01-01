<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios'; // 确保已安装 axios
import * as echarts from 'echarts';

const chart = ref(null); // 图表容器
let myChart = null; // 图表实例

// 从 API 获取产品类型数据
const fetchProductTypeData = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/CLO'); // 调用 API
    // 假设返回的数据格式为 [{ product_type: '鞋类', total_quantity: 55 }, ...]
    const data = response.data.map(item => ({
      name: item.product_type,
      value: parseInt(item.total_quantity, 10), // 转换数量为整数
    }));
    return data;
  } catch (error) {
    console.error('获取产品类型数据失败:', error);
    return [];
  }
};

// 渲染环形图
const renderChart = async () => {
  if (!chart.value) return;

  // 获取数据
  const data = await fetchProductTypeData();

  // 初始化 ECharts 实例（如果尚未初始化）
  if (!myChart) {
    myChart = echarts.init(chart.value);
  }

  // 配置图表选项
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
      data: data.map(item => item.name), // 从数据中提取类型名称
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
        data: data,
        itemStyle: {
          borderRadius: 0, // 每块区域的圆角处理
          borderColor: 'transparent',
          borderWidth: 2,
        },
      },
    ],
  };

  myChart.setOption(option);

  // 响应窗口大小变化
  window.addEventListener('resize', () => myChart.resize());
};

onMounted(() => {
  renderChart(); // 加载并渲染图表
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose(); // 销毁图表实例
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px; /* 图表高度 */
  margin-top: 20px;
  border-radius: 10px; /* 圆角样式 */
  background: transparent; /* 背景透明 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影 */
}
</style>
