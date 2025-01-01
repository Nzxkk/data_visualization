<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud'; // 确保已安装词云插件
import { getWordCloudData } from '@/api/index'; // 调用封装的 API 方法

// 绑定词云图表的 DOM 元素
const chart = ref(null);
let myChart = null; // ECharts 实例

// 定时器 ID
let intervalId = null;

// 最大显示的词数
const maxWords = 6;  // 最多显示 5-6 个词

// 词云数据
const wordCloudData = ref([]);
const previousWordCloudData = ref([]);

// 获取词云数据并处理
const fetchWordCloudData = async () => {
  try {
    const response = await getWordCloudData();
    // 假设 response.data 是一个数组，包含 { brand_name, total_sales } 对象
    const newData = response.data.map(item => ({
      name: item.brand_name,
      value: Math.round(parseFloat(item.total_sales) * 100) / 100, // 保留两位小数并确保数值类型
    }));

    // 按照 value 排序，选择前 maxWords 个最多的词
    const sortedData = newData.sort((a, b) => b.value - a.value);  // 从大到小排序
    const limitedData = sortedData.slice(0, maxWords); // 只保留前 maxWords 个词

    // 比较新旧数据
    const isDataChanged = JSON.stringify(limitedData) !== JSON.stringify(previousWordCloudData.value);
    if (isDataChanged) {
      wordCloudData.value = limitedData;
      previousWordCloudData.value = limitedData;
      updateChart();
    }
  } catch (error) {
    console.error('获取词云数据失败:', error);
  }
};

// 渲染或更新词云图表
const updateChart = () => {
  if (!myChart) {
    // 初始化 ECharts 实例
    myChart = echarts.init(chart.value);

    const option = {
      title: {
        text: '销售品牌一览',
        left: 'center',
        top: '5%',  // 调整标题的顶部位置
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        show: true,
      },
      series: [
        {
          type: 'wordCloud',
          gridSize: 8, // 调整网格大小
          sizeRange: [12, 36], // 限制字体大小
          rotationRange: [0, 0], // 不旋转文字
          shape: 'circle', // 圆形词云
          textStyle: {
            color: () =>
              `rgb(${Math.round(Math.random() * 255)}, ${Math.round(
                Math.random() * 255
              )}, ${Math.round(Math.random() * 255)})`,
          },
          emphasis: {
            focus: 'self',
            textStyle: {
              shadowBlur: 10,
              shadowColor: '#333',
            },
          },
          data: wordCloudData.value,
          top: '1%'  // 调整词云的顶部位置，使其上移
        },
      ],
      animationDurationUpdate: 1000, // 动画时长（毫秒）
      animationEasingUpdate: 'quinticInOut', // 动画缓动效果
    };

    myChart.setOption(option);

    // 自动适应窗口大小
    window.addEventListener('resize', () => myChart.resize());
  } else {
    // 更新数据并触发动画
    myChart.setOption({
      series: [
        {
          data: wordCloudData.value,
        },
      ],
    });
  }
};

// 启动轮询
const startPolling = () => {
  fetchWordCloudData(); // 初次加载数据
  intervalId = setInterval(fetchWordCloudData, 5000); // 每 5 秒轮询
};

// 停止轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 生命周期钩子
onMounted(() => {
  startPolling(); // 启动轮询
});

onBeforeUnmount(() => {
  stopPolling(); // 停止轮询
  if (myChart) {
    myChart.dispose(); // 销毁 ECharts 实例
  }
});
</script>

<style scoped lang="less">
.chart-container {
  width: 100%; /* 占满父容器宽度 */
  height: 400px; /* 根据需要调整高度 */
  max-width: 100%; /* 确保不会超出页面 */
  overflow: hidden; /* 防止内容超出 */
  position: relative; /* 确保内部元素定位正确 */
}
</style>
