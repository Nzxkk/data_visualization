<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { getCategorySales } from '@/api/index';

const chart = ref(null);
let myChart = null;
let intervalId = null;

const categoryData = ref([]);
const previousCategoryData = ref([]);
const router = useRouter();

const handleClick = (category) => {
  const routes = {
    服饰: '/clothing',
    电子产品: '/electronics',
    家居用品: '/furniture',
    母婴用品: '/motherbaby',
    食品: '/food',
  };
  const path = routes[category];
  if (path) {
    router.push(path);
  } else {
    console.warn('未定义的跳转类别:', category);
  }
};

const fetchCategorySales = async () => {
  try {
    const response = await getCategorySales();
    const newData = response.data.map(item => ({
      name: item.category,
      value: Math.round(parseFloat(item.total_sales) * 100) / 100,
    }));
    const isDataChanged = JSON.stringify(newData) !== JSON.stringify(previousCategoryData.value);
    if (isDataChanged) {
      categoryData.value = newData;
      previousCategoryData.value = [...newData];
      updateChart();
    }
  } catch (error) {
    console.error('获取商品类别销售数据失败:', error);
  }
};

const updateChart = () => {
  if (!myChart) {
    myChart = echarts.init(chart.value);
    const option = {
      title: {
        text: '各类商品销量占比',
        left: 'center',
        top: '1%', // 向上移动标题
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        top: '10%', // 调整图例向上移动
        left: 'center',
        textStyle: {
          color: '#ffffff',
        },
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          name: '销量占比',
          type: 'pie',
          radius: ['35%', '50%'], // 调整饼图半径
          center: ['50%', '40%'], // 确保饼图居中
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}\n{d}%', // 显示名称和百分比
            color: '#ffffff',
            fontSize: 14,
          },
          labelLine: {
            length: 10,
            length2: 15,
            lineStyle: {
              color: '#ffffff',
            },
          },
          data: categoryData.value,
          animationDuration: 1000,
          animationEasing: 'cubicOut',
        },
      ],
      animationDurationUpdate: 1000,
      animationEasingUpdate: 'quinticInOut',
    };

    myChart.setOption(option);
    myChart.on('click', params => handleClick(params.name));
    window.addEventListener('resize', () => myChart.resize());
  } else {
    myChart.setOption({
      series: [
        {
          data: categoryData.value,
        },
      ],
    });
  }
};

const startPolling = () => {
  fetchCategorySales();
  intervalId = setInterval(fetchCategorySales, 5000);
};

const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

onMounted(() => {
  startPolling();
});

onBeforeUnmount(() => {
  stopPolling();
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped lang="less">
.chart-container {
  width: 100%;
  height: 400px;
  margin-top: 10px; /* 减少容器顶部外边距 */
  border-radius: 10px;
  overflow: hidden;
  background-color: transparent;
  padding: 0 20px; /* 减小上边距，向上移动图表 */
}
</style>
