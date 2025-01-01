<template>
  <div class="chart-wrapper">
    <div class="chart-title">品牌销售环形图</div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const chart = ref(null);
let myChart = null;

// 模拟 API 数据
const fetchBrandSales = async () => {
  const data = [
    { brand_name: "小米", total_quantity: "54" },
    { brand_name: "苹果", total_quantity: "12" },
    { brand_name: "索尼", total_quantity: "71" },
    { brand_name: "三星", total_quantity: "55" },
    { brand_name: "华为", total_quantity: "35" },
  ];
  return data;
};

// 处理数据以适应环形图格式
const processBrandData = (data) => {
  return data.map(({ brand_name, total_quantity }) => ({
    name: brand_name,
    value: Number(total_quantity),
  }));
};

// 渲染环形图
const renderChart = async () => {
  if (!chart.value) return;

  if (!myChart) {
    myChart = echarts.init(chart.value);
  }

  const rawData = await fetchBrandSales();
  const brandData = processBrandData(rawData);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      top: '5%',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 12,
      },
    },
    series: [
      {
        name: '品牌销售',
        type: 'pie',
        radius: ['50%', '70%'],
        label: {
          show: true,
          position: 'inside', // 将标签移到外部
          formatter: '{b}: {d}%', // 显示品牌和百分比
          color: '#ffffff',
        },
        labelLine: {
          show: true, // 显示引导线
          lineStyle: {
            color: '#ffffff',
          },
        },
        data: brandData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: `hsl(${(index * 60) % 360}, 40%, 60%)`, // 低饱和度颜色
          },
        })),
      },
    ],
  };

  myChart.setOption(option);

  // 自动调整大小
  window.addEventListener('resize', () => myChart.resize());
};

onMounted(() => {
  renderChart();
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: transparent;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.chart-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.chart-container {
  width: 100%;
  max-width: 600px;
  height: 400px;
  background-color: transparent;
}
</style>
