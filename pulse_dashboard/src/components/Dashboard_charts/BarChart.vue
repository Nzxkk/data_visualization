<template>
    <div>
      <div ref="chart" class="chart-container"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  import { getProvinceSales } from '@/api/index'; // 调用封装的 API 方法
  
  const chart = ref(null); // 引用图表容器
  const provinceData = ref([]); // 存储后端返回的数据
  
  // 获取数据并处理
  const fetchTopProvinces = async () => {
    try {
      const response = await getProvinceSales();
      provinceData.value = response.data
        .sort((a, b) => b.total_sales - a.total_sales) // 按销售额排序
        .slice(0, 5); // 取前5个
      renderChart(); // 渲染图表
    } catch (error) {
      console.error('获取省份销售数据失败:', error);
    }
  };
  
  // 渲染图表
  const renderChart = () => {
    if (!chart.value) return;
  
    const myChart = echarts.init(chart.value);
    const option = {
      title: {
        text: '各省市销售额 TOP5', // 标题内容
        left: 'center', // 标题居中
        top: '5%', // 标题距离顶部
        textStyle: {
          fontSize: 18, // 标题字体大小
          fontWeight: 'bold', // 标题字体加粗
          color: '#ffffff', // 标题颜色设置为白色
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '10%', // 左边距，避免 Y 轴数字被遮挡
        right: '10%', // 右边距
        top: '20%', // 上边距，给标题和内容足够空间
        bottom: '25%', // 下边距，给 X 轴标签足够显示空间
        containLabel: true, // 自动调整以包含标签
      },
      xAxis: {
        type: 'category',
        data: provinceData.value.map(item => item.province), // 省份名称
        axisLabel: {
          rotate: 30, // 旋转标签以防止重叠
          interval: 0, // 显示所有标签
          color: '#ffffff', // X 轴标签颜色为白色
        },
      },
      yAxis: {
        type: 'value',
        name: '销售额 (元)',
        axisLabel: {
          fontSize: 12, // 调整字体大小
          margin: 10, // 标签与轴线的距离
          color: '#ffffff', // Y 轴标签颜色为白色
        },
        nameTextStyle: {
          color: '#ffffff', // Y 轴名称颜色为白色
        },
      },
      series: [
        {
          data: provinceData.value.map(item => item.total_sales), // 销售额数据
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            color: '#3398DB', // 自定义柱状图颜色
          },
        },
      ],
    };
    myChart.setOption(option);
  
    // 监听窗口大小变化，自动调整图表大小
    window.addEventListener('resize', () => myChart.resize());
  };
  
  onMounted(() => {
    fetchTopProvinces(); // 加载数据并渲染图表
  });
  </script>
  
  <style scoped lang="less">
  .chart-container {
    width: 100%; /* 使用父容器的宽度 */
    height: 300px; /* 固定高度 */
    max-width: 100%; /* 确保容器不会超出父级 */
    overflow: visible; /* 防止内容被裁剪 */
  }
  </style>
  