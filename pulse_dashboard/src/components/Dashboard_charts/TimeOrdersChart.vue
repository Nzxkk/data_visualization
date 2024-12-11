<template>
    <div>
      <div ref="chart" class="chart-container"></div>
      
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import { getTimeOrders } from '@/api/index'; // 调用封装的 API 方法
  
  const chart = ref(null); // 图表容器
  const ordersData = ref([]); // 存储后端返回的数据
  
  // 存储每个时间段的订单数量
  const morningOrder = ref(0);
  const afternoonOrder = ref(0);
  const eveningOrder = ref(0);
  const nightOrder = ref(0);
  
  // 获取数据并处理
  const fetchTimeOrdersData = async () => {
    try {
      const response = await getTimeOrders();
      const rawData = response.data;
  
      // 获取每个时间段的订单数量
      morningOrder.value = rawData.find(item => item.time_interval === '早晨')?.order_count || 0;
      afternoonOrder.value = rawData.find(item => item.time_interval === '下午')?.order_count || 0;
      eveningOrder.value = rawData.find(item => item.time_interval === '晚上')?.order_count || 0;
      nightOrder.value = rawData.find(item => item.time_interval === '凌晨')?.order_count || 0;
  
      // 填充饼图数据
      ordersData.value = [
        { name: '凌晨', value: nightOrder.value },
        { name: '早晨', value: morningOrder.value },
        { name: '下午', value: afternoonOrder.value },
        { name: '晚上', value: eveningOrder.value },
      ];
  
      renderChart(); // 渲染图表
    } catch (error) {
      console.error('获取分时订单数据失败:', error);
    }
  };
  
  // 渲染实心饼图
  const renderChart = () => {
    if (!chart.value) {
      console.error('Chart container not found.');
      return;
    }
  
    const myChart = echarts.init(chart.value);
  
    const option = {
      title: {
        text: '分时订单数量分布',
        left: 'center',
        top: '2%',
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)', // 格式化显示
      },
      series: [
        {
          name: '订单数量',
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'], // 图表居中
          data: ordersData.value, // 数据
          label: {
            show: true,
            formatter: '{b}',
            color: '#ffffff',
            overflow: 'truncate', // 设置文字溢出时显示省略号
            position: 'outside',  // 标签位置
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)', // 设置阴影效果
          },
        },
      ],
    };
  
    myChart.setOption(option);
  
    // 自动适应窗口大小
    window.addEventListener('resize', () => myChart.resize());
  };
  
  onMounted(() => {
    fetchTimeOrdersData(); // 加载数据并渲染图表
  });
  </script>
  
  <style scoped lang="less">
  .chart-container {
    width: 100%;
    height: 400px; /* 增加容器高度 */
    max-width: 100%;
    overflow: hidden;
  }

  
  .annotations {
    color: #ffffff;
    margin-top: 20px;
    font-size: 16px;
  }
  </style>
  