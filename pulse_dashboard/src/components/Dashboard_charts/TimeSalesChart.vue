<template>
    <div>
      <div ref="chart" class="chart-container"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import { getTimeSales } from '@/api/index'; // 调用封装的 API 方法
  
  const chart = ref(null); // 图表容器
  const salesData = ref([]); // 存储后端返回的销售数据
  const rateData = ref([]); // 存储变化率数据
  
  // 获取数据并处理
  const fetchTimeSalesData = async () => {
    try {
      const response = await getTimeSales();
      salesData.value = response.data.map(item => item.sales);
      rateData.value = salesData.value.map((value, index, array) =>
        index > 0 ? ((value - array[index - 1]) / array[index - 1]) * 100 : 0
      ); // 计算变化率
      renderChart(); // 渲染图表
    } catch (error) {
      console.error('获取分时销售数据失败:', error);
    }
  };
  
  // 渲染柱状图和折线图
  const renderChart = () => {
    if (!chart.value) return;
  
    const myChart = echarts.init(chart.value);
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
          const sales = params[0]?.value || 0;
          const rate = params[1]?.value ? `${params[1]?.value.toFixed(2)}%` : '0%';
          return `小时: ${params[0]?.name}<br/>销售额: ${sales} 元<br/>变化率: ${rate}`;
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
        },
      ],
    };
    myChart.setOption(option);
  
    // 自动适应窗口大小
    window.addEventListener('resize', () => myChart.resize());
  };
  
  onMounted(() => {
    fetchTimeSalesData(); // 加载数据并渲染图表
  });
  </script>
  
  <style scoped lang="less">
  .chart-container {
    width: 100%;
    height: 400px; /* 增加容器高度 */
    max-width: 100%;
    overflow: hidden;
  }
  </style>
  