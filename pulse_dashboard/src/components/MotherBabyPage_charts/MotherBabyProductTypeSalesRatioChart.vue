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
let myChart = null; // 图表实例
let intervalId = null; // 定时器 ID

// 获取母婴用品产品类型销售占比数据
const fetchProductTypeSalesRatio = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3006/api/MB_PRODUCT_TYPE_SALES_RATIO');
    const data = response.data.map(item => ({
      name: item.product_type,
      value: parseFloat(item.sales_ratio) * 100, // 转换为百分比
    }));

    console.log('产品类型销售占比数据:', data); // 调试用
    updateChart(data); // 动态更新图表
  } catch (error) {
    console.error('获取产品类型销售占比数据失败:', error);
  }
};

// 渲染饼图（首次加载）
const renderChart = (data) => {
  if (!chart.value) return;

  myChart = echarts.init(chart.value);
  const option = {
    title: {
      text: '母婴用品产品类型销售占比情况',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%', // 确保显示百分比
    },
    series: [
      {
        name: '销售占比',
        type: 'pie',
        radius: ['30%', '60%'], // 增加半径范围
        center: ['50%', '50%'], // 图表居中
        data: data,
        itemStyle: {
          color: function (params) {
            const colors = [
              '#5b9bd5', '#ffb84d', '#8c9eff', '#f58a42', '#93c47d', '#e7dba7', '#c68b59',
            ];
            return colors[params.dataIndex % colors.length];
          },
        },
        label: {
          show: true,
          position: 'inside', // 标签放置在外部
          formatter: '{b}: {d}%', // 显示产品名称和占比百分比
          fontSize: 12,
          color: '#ffffff',
        },
        labelLine: {
          show: true,
          length: 25, // 调整连接线的第一段长度
          length2: 15, // 调整连接线的第二段长度
          lineStyle: {
            color: '#ffffff', // 设置连接线颜色
            width: 1, // 连接线宽度
          },
        },
        avoidLabelOverlap: false, // 防止标签重叠
      },
    ],
  };

  myChart.setOption(option);

  // 自动适应窗口大小
  window.addEventListener('resize', () => myChart.resize());
};

// 动态更新图表（无刷新更新数据）
const updateChart = (data) => {
  if (!myChart) return;

  const option = {
    series: [
      {
        data: data, // 更新数据
      },
    ],
  };

  myChart.setOption(option); // 更新图表
};

// 启动定时轮询
const startPolling = () => {
  fetchProductTypeSalesRatio(); // 初次加载数据
  intervalId = setInterval(() => {
    fetchProductTypeSalesRatio(); // 每隔 5 秒获取一次数据
  }, 5000);
};

// 停止定时轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 生命周期钩子
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
  height: 450px; /* 增大容器高度 */
  margin: 20px auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: transparent; /* 统一背景风格 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-container {
    height: 350px; /* 小屏幕高度适配 */
  }
}
</style>
