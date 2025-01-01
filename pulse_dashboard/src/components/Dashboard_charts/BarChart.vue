<template>
  <div class="chart-wrapper">
    <!-- 柱状图图表容器始终渲染 -->
    <div ref="chart" class="chart-container"></div>
    
    <!-- 加载指示器和错误提示覆盖在图表上 -->
    <div v-if="loading" class="loading-indicator">加载中...</div>
    <div v-if="error" class="error-message">数据加载失败，请稍后重试。</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getProvinceSales } from '@/api/index'; // 确保路径正确

// 引用图表容器
const chart = ref(null);
let myChart = null; // ECharts 实例

// 定时器 ID
let intervalId = null;

// 省份销售数据
const provinceData = ref([]);

// 状态管理
const loading = ref(true);
const error = ref(false);

// 固定颜色库（可根据需求调整）
const colors = ['#5DC5EF', '#00FFDD', '#FF5733', '#C70039', '#900C3F', '#581845'];

// 初始化 ECharts 实例
const initChart = () => {
  if (chart.value) {
    myChart = echarts.init(chart.value);
    console.log('ECharts 初始化成功');

    const option = {
      title: {
        text: '各省市销售额 TOP5',
        left: 'center',
        top: '5%',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#ffffff',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '20%',
        bottom: '25%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: provinceData.value.map(item => item.province),
        axisLabel: {
          rotate: 30,
          interval: 0,
          color: '#ffffff',
        },
      },
      yAxis: {
        type: 'value',
        name: '销售额 (元)',
        axisLabel: {
          fontSize: 12,
          margin: 10,
          color: '#ffffff',
        },
        nameTextStyle: {
          color: '#ffffff',
        },
      },
      series: [
        {
          data: provinceData.value.map(item => item.total_sales),
          type: 'bar',
          barWidth: '60%', // 增加柱宽，使图表稍微大一点
          itemStyle: {
            color: '#3398DB',
          },
          animationDurationUpdate: 1000, // 动画时长
          animationEasingUpdate: 'quinticInOut', // 动画缓动效果
        },
      ],
    };

    myChart.setOption(option);

    // 监听窗口大小变化，自动调整图表大小
    window.addEventListener('resize', handleResize);
  } else {
    console.error('chart.value 为空，无法初始化 ECharts');
  }
};

// 更新柱状图数据
const updateChart = () => {
  if (myChart) {
    console.log('更新柱状图数据');
    myChart.setOption({
      xAxis: {
        data: provinceData.value.map(item => item.province),
      },
      series: [
        {
          data: provinceData.value.map(item => item.total_sales),
        },
      ],
    });
  } else {
    console.error('myChart 为空，无法更新图表');
  }
};

// 处理窗口大小变化
const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

// 获取数据并处理
const fetchTopProvinces = async () => {
  try {
    const response = await getProvinceSales();
    console.log('API 响应数据:', response.data); // 调试信息

    // 假设 response.data 是一个数组，包含 { province, total_sales } 对象
    const newData = response.data
      .sort((a, b) => b.total_sales - a.total_sales) // 按销售额排序
      .slice(0, 5); // 取前5个

    console.log('处理后的新数据:', newData); // 调试信息

    // 比较新旧数据，避免重复更新
    const isDataChanged = JSON.stringify(newData) !== JSON.stringify(provinceData.value);
    if (isDataChanged) {
      provinceData.value = newData;
      updateChart(); // 更新图表数据
    }
  } catch (err) {
    console.error('获取省份销售数据失败:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 启动轮询
const startPolling = () => {
  fetchTopProvinces(); // 初次加载数据
  intervalId = setInterval(fetchTopProvinces, 5000); // 每 5 秒轮询
};

// 停止轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 生命周期钩子
onMounted(async () => {
  // 确保 DOM 完全渲染
  await nextTick();
  initChart(); // 初始化 ECharts
  startPolling(); // 启动轮询
});

onBeforeUnmount(() => {
  stopPolling(); // 停止轮询
  if (myChart) {
    myChart.dispose(); // 销毁 ECharts 实例
  }
  window.removeEventListener('resize', handleResize); // 移除事件监听
});
</script>

<style scoped lang="less">
.chart-wrapper {
  position: relative; /* 相对定位，便于绝对定位的加载和错误提示 */
}

.loading-indicator,
.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 18px;
  background: rgba(0, 0, 0, 0.5); /* 半透明背景，提升可读性 */
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 10; /* 确保覆盖在图表上 */
}

.error-message {
  color: #ff0000;
}

.chart-container {
  width: 100%; /* 使用父容器的宽度 */
  height: 350px; /* 增加高度，使图表稍微大一点 */
  max-width: 100%; /* 确保容器不会超出父级 */
  overflow: hidden; /* 防止内容被裁剪 */
  background-color:  transparent;
  border-radius: 10px; /* 设置圆角 */
  padding: 10px 20px; /* 减少内边距，向上移动内容 */
  box-sizing: border-box; /* 确保 padding 不影响总宽高 */
}
</style>
