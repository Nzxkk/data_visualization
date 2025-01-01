<template>
  <div class="chart-wrapper">
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getSalesData } from '@/api/index'; // 确保正确导入封装的 API 方法
import * as echarts from 'echarts';

// 图表容器引用
const chart = ref(null);
let myChart = null;

// 格式化日期为 YYYY-MM-DD
const formatDate = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取销售数据
const fetchSalesData = async () => {
  try {
    const response = await getSalesData(); // 从 API 获取数据
    console.log('完整的 API 响应:', response); // 打印完整响应，便于调试
    const { data } = response; // 提取数据
    if (!Array.isArray(data)) {
      throw new Error('API 返回的数据不是数组');
    }
    return data; // 返回提取的数组
  } catch (error) {
    console.error('获取电子产品的销售数据失败:', error);
    return [];
  }
};

// 按日期分组销售数据
const groupByDate = (data) => {
  const groupedData = {};
  data.forEach((item) => {
    const date = formatDate(item.order_date); // 提取日期部分
    if (!groupedData[date]) {
      groupedData[date] = 0;
    }
    groupedData[date] += parseFloat(item.total_sales); // 累加销售额
  });
  return Object.entries(groupedData).map(([date, totalSales]) => ({
    date,
    totalSales,
  }));
};

// 计算每日增长率
const calculateGrowthRates = (groupedData) => {
  const growthRates = [];
  for (let i = 0; i < groupedData.length; i++) {
    if (i === 0) {
      growthRates.push(0); // 第一天没有增长率
    } else {
      const prevSales = groupedData[i - 1].totalSales;
      const currentSales = groupedData[i].totalSales;
      const growth = ((currentSales - prevSales) / prevSales) * 100;
      growthRates.push(Number(growth.toFixed(2))); // 保留两位小数
    }
  }
  return growthRates;
};

// 渲染图表
const renderChart = async () => {
  if (!chart.value) return;

  if (!myChart) {
    myChart = echarts.init(chart.value); // 初始化 ECharts 实例
  }

  const rawData = await fetchSalesData(); // 获取数据
  const groupedData = groupByDate(rawData); // 按日期分组
  const dates = groupedData.map((item) => item.date); // 提取日期
  const sales = groupedData.map((item) => item.totalSales); // 提取销售额
  const growthRates = calculateGrowthRates(groupedData); // 计算增长率

  const option = {
    backgroundColor: 'transparent', // 设置背景透明
    title: {
      text: '每日销售额与增长率',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 20,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        let tooltip = `<b>${params[0].axisValueLabel}</b><br>`;
        params.forEach((param) => {
          tooltip += `${param.marker} ${param.seriesName}: ${
            param.seriesName === '增长率' ? param.data + '%' : param.data
          }<br>`;
        });
        return tooltip;
      },
    },
    legend: {
      data: ['销售额', '增长率'],
      top: '10%',
      textStyle: {
        color: 'white',
        fontSize: 14,
      },
    },
    grid: {
      top: '30%',
      left: '20%',
      right: '15%',
      bottom: '10%',
    },
    xAxis: {
      type: 'category',
      data: dates, // 使用分组后的日期
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        formatter: (value) => value, // 显示日期
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
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#444444',
          },
        },
      },
      {
        type: 'value',
        name: '增长率 (%)',
        axisLabel: {
          color: '#ffffff',
          fontSize: 12,
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
        data: sales, // 使用分组后的销售额
        barWidth: '20%',
        itemStyle: {
          color: '#5dc5ef', // 柱状图颜色
          borderRadius: [5, 5, 0, 0], // 圆角柱状图
        },
      },
      {
        name: '增长率',
        type: 'line',
        data: growthRates, // 使用计算后的增长率
        yAxisIndex: 1, // 使用第二个 Y 轴
        smooth: true,
        lineStyle: {
          color: '#ffde33',
          width: 2,
        },
        itemStyle: {
          color: '#ffde33', // 折线图数据点颜色
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%', // 显示百分号
          color: '#ffffff',
          fontSize: 10,
        },
      },
    ],
  };

  myChart.setOption(option);

  // 自动适应窗口大小
  window.addEventListener('resize', () => {
    if (myChart) {
      myChart.resize();
    }
  });
};

// 生命周期钩子
onMounted(async () => {
  await renderChart(); // 渲染图表
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.chart-wrapper {
  width: 80%;
  margin: 20px auto;
  background-color: transparent;
}

.chart-container {
  width: 100%;
  height: 400px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: transparent;
}
</style>
