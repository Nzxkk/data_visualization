<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { getTimeSales } from '@/api/index'; // 调用封装的 API 方法

// 绑定图表的 DOM 元素
const chart = ref(null);
let myChart = null; // ECharts 实例

// 定时器 ID
let intervalId = null;

// 销售数据和变化率数据
const salesData = ref([]); // 存储销售额数据
const rateData = ref([]);  // 存储变化率数据

// 之前的数据，用于比较是否需要更新
const previousSalesData = ref([]);
const previousRateData = ref([]);

// 获取数据并处理
const fetchTimeSalesData = async () => {
  try {
    const response = await getTimeSales();
    // 假设 response.data 是一个数组，包含 { sales } 对象
    const newSalesData = response.data.map(item => parseFloat(item.sales).toFixed(2));
    
    // 计算变化率
    const newRateData = newSalesData.map((value, index, array) =>
      index > 0 ? ((parseFloat(value) - parseFloat(array[index - 1])) / parseFloat(array[index - 1])) * 100 : 0
    ).map(rate => parseFloat(rate.toFixed(2))); // 保留两位小数

    // 检查数据是否变化
    const isSalesDataChanged = JSON.stringify(newSalesData) !== JSON.stringify(previousSalesData.value);
    const isRateDataChanged = JSON.stringify(newRateData) !== JSON.stringify(previousRateData.value);

    if (isSalesDataChanged || isRateDataChanged) {
      salesData.value = newSalesData;
      rateData.value = newRateData;
      previousSalesData.value = [...newSalesData];
      previousRateData.value = [...newRateData];
      updateChart();
    }
  } catch (error) {
    console.error('获取分时销售数据失败:', error);
  }
};

// 渲染或更新图表
const updateChart = () => {
  if (!myChart) {
    // 初始化 ECharts 实例
    myChart = echarts.init(chart.value);

    const option = {
      title: {
        text: '分时订单销售额统计',
        left: 'center',
        top: '2%',
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: params => {
          const sales = params.find(p => p.seriesName === '销售额')?.value || 0;
          const rate = params.find(p => p.seriesName === '变化率')?.value || 0;
          return `小时: ${params[0]?.name}<br/>销售额: ${parseFloat(sales).toFixed(2)} 元<br/>变化率: ${parseFloat(rate).toFixed(2)}%`;
        },
      },
      legend: {
        data: ['销售额', '变化率'],
        top: '12%', // 图例位置下移更多
        textStyle: {
          color: '#ffffff',
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '25%', // 图表内容进一步下移，避免与标题、图例重叠
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: Array.from({ length: 24 }, (_, i) => `${i}:00`), // X 轴时间
        axisLabel: {
          color: '#ffffff',
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额 (元)',
          axisLabel: {
            color: '#ffffff',
            formatter: '{value}',
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff',
            },
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
          },
        },
        {
          type: 'value',
          name: '变化率 (%)',
          axisLabel: {
            color: '#ffffff',
            formatter: '{value}%',
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff',
            },
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: '销售额',
          type: 'bar',
          data: salesData.value,
          barWidth: '50%',
          itemStyle: {
            color: '#3398DB',
          },
          animationDuration: 1000, // 动画时长
          animationEasing: 'cubicOut', // 动画缓动效果
        },
        {
          name: '变化率',
          type: 'line',
          yAxisIndex: 1, // 使用右侧 Y 轴
          data: rateData.value,
          lineStyle: {
            color: '#FFAA00',
          },
          itemStyle: {
            color: '#FFAA00',
          },
          smooth: true, // 平滑曲线
          animationDuration: 1000, // 动画时长
          animationEasing: 'cubicOut', // 动画缓动效果
        },
      ],
      animationDurationUpdate: 1000, // 更新动画时长
      animationEasingUpdate: 'quinticInOut', // 更新动画缓动效果
    };

    myChart.setOption(option);

    // 自动适应窗口大小
    window.addEventListener('resize', () => myChart.resize());
  } else {
    // 更新数据并触发动画
    myChart.setOption({
      series: [
        {
          name: '销售额',
          data: salesData.value,
        },
        {
          name: '变化率',
          data: rateData.value,
        },
      ],
    });
  }
};

// 启动轮询
const startPolling = () => {
  fetchTimeSalesData(); // 初次加载数据
  intervalId = setInterval(fetchTimeSalesData, 5000); // 每 5 秒轮询
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
  width: 100%;
  height: 400px; /* 增加容器高度 */
  max-width: 100%;
  overflow: hidden;
  position: relative; /* 确保内部元素定位正确 */
  background-color: transparent; /* 可选：设置背景颜色以增强可视效果 */
}
</style>
