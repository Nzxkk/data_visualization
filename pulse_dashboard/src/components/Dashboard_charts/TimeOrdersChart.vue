<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { getTimeOrders } from '@/api/index'; // 确保正确导入 API 方法

const chart = ref(null); // 图表容器
let myChart = null; // ECharts 实例
let intervalId = null; // 定时器 ID

const ordersData = ref([]); // 订单数量
const rateData = ref([]); // 变化率

// 获取分时订单数据
const fetchTimeOrdersData = async () => {
  try {
    const response = await getTimeOrders(); // 获取数据
    const rawData = response.data;

    console.log('API 数据:', rawData); // 打印数据便于调试

    // 订单数量（四舍五入为整数）
    const newOrdersData = rawData.map((item) => Math.round(parseFloat(item.order_count)));

    // 计算变化率
    const newRateData = newOrdersData.map((value, index, array) => {
      if (index === 0 || array[index - 1] === 0) {
        return 0; // 第一个时间点没有变化率，或前一个值为 0
      }
      const rate = ((value - array[index - 1]) / array[index - 1]) * 100;
      return Math.round(rate * 100) / 100; // 保留两位小数
    });

    console.log('新订单数据:', newOrdersData);
    console.log('新变化率数据:', newRateData);

    // 更新数据
    ordersData.value = newOrdersData;
    rateData.value = newRateData;

    updateChart(); // 更新图表
  } catch (error) {
    console.error('获取分时订单数据失败:', error);
  }
};

// 更新图表
const updateChart = () => {
  if (!myChart) {
    // 初始化 ECharts 实例
    myChart = echarts.init(chart.value);

    const option = {
      title: {
        text: '分时订单数量统计',
        left: 'center',
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params) => {
          const orderCount = params.find((p) => p.seriesName === '订单数量')?.value || 0;
          const rate = params.find((p) => p.seriesName === '变化率')?.value || 0;
          return `时间: ${params[0]?.name}<br/>订单数量: ${orderCount}<br/>变化率: ${rate}%`;
        },
      },
      legend: {
        data: ['订单数量', '变化率'],
        top: '10%',
        textStyle: {
          color: '#ffffff',
        },
      },
      grid: {
        left: '20%',
        right: '10%',
        bottom: '15%',
        top: '25%', // 图表内容进一步下移，避免与标题、图例重叠
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => `${i}:00`), // X轴时间（0:00-23:00）
        axisLabel: {
          color: '#ffffff',
          interval: 5, // 每隔 5 个刻度显示一个标签
          formatter: (value, index) => {
            if (index % 6 === 0) {
              return value; // 只显示 0:00, 6:00, 12:00, 18:00 等
            }
            return '';
          },
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
          name: '订单数量',
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
          min: 0, // 起始值为 0
          max: Math.ceil(Math.max(...ordersData.value) * 1.2), // 动态最大值，向上取整
          interval: 1, // 每个刻度为 1
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
          max: Math.ceil(Math.max(...rateData.value) * 1.2), // 动态计算变化率最大值
          min: Math.floor(Math.min(...rateData.value) * 1.2), // 动态计算变化率最小值
        },
      ],
      series: [
        {
          name: '订单数量',
          type: 'bar',
          data: ordersData.value,
          barWidth: '50%',
          itemStyle: {
            color: '#3398DB',
          },
        },
        {
          name: '变化率',
          type: 'line',
          yAxisIndex: 1,
          data: rateData.value,
          lineStyle: {
            color: '#FFAA00',
          },
          itemStyle: {
            color: '#FFAA00',
          },
          smooth: true, // 平滑曲线
        },
      ],
    };

    myChart.setOption(option);

    // 自动适应窗口大小
    window.addEventListener('resize', () => myChart.resize());
  } else {
    // 更新数据
    myChart.setOption({
      yAxis: [
        {
          max: Math.ceil(Math.max(...ordersData.value) * 1.2), // 更新订单数量最大值
        },
        {
          max: Math.ceil(Math.max(...rateData.value) * 1.2), // 更新变化率最大值
          min: Math.floor(Math.min(...rateData.value) * 1.2), // 更新变化率最小值
        },
      ],
      series: [
        {
          name: '订单数量',
          data: ordersData.value,
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
  fetchTimeOrdersData(); // 初次加载数据
  intervalId = setInterval(fetchTimeOrdersData, 5000); // 每 5 秒轮询
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
  height: 400px; /* 设置图表高度 */
  background-color: transparent; /* 背景透明 */
  border-radius: 10px; /* 圆角样式 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加柔和阴影 */
}
</style>
