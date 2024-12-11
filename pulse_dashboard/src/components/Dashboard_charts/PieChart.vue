<template>
    <div>
      <div ref="chart" class="chart-container"></div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // 引入 Vue Router
import * as echarts from 'echarts';
import { getCategorySales } from '@/api/index'; // 调用封装的 API 方法

const chart = ref(null); // 图表容器
const categoryData = ref([]); // 存储后端返回的数据
const router = useRouter(); // Vue Router 实例

// 获取数据并处理
const fetchCategorySales = async () => {
  try {
    const response = await getCategorySales();
    // 假设后端返回的数据格式为 [{ category: '类别1', total_sales: 1000 }, ...]
    categoryData.value = response.data.map(item => ({
      name: item.category,
      value: item.total_sales,
    }));
    renderChart(); // 渲染图表
  } catch (error) {
    console.error('获取商品类别销售数据失败:', error);
  }
};

// 跳转到目标页面
const handleClick = (category) => {
  console.log('点击的类别:', category);  // 检查是否点击了正确的类别
  const routes = {
    服饰: '/clothing', // 服装页面
 
  };
  const path = routes[category];
  console.log('跳转路径:', path); // 输出跳转的路径
  if (path) {
    router.push(path); // 跳转到对应页面
  } else {
    console.warn('未定义的跳转类别:', category);
  }
};


// 渲染饼图
const renderChart = () => {
  if (!chart.value) return;

  const myChart = echarts.init(chart.value);
  const option = {
    title: {
      text: '各类商品销量占比', // 标题内容
      left: 'center', // 标题居中
      top: '2%', // 标题距离顶部
      textStyle: {
        color: '#ffffff', // 标题颜色为白色
        fontSize: 18, // 标题字体大小
        fontWeight: 'bold', // 标题字体加粗
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      top: '15%', // 图例距离顶部更远，避免与标题重叠
      left: 'center',
      textStyle: {
        color: '#ffffff', // 图例文字颜色为白色
      },
      itemWidth: 10, // 图例图标宽度
      itemHeight: 10, // 图例图标高度
    },
    series: [
      {
        name: '销量占比',
        type: 'pie',
        radius: ['35%', '50%'], // 缩小饼图半径，避免布局拥挤
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%', // 标签格式为名称+百分比
          color: '#ffffff', // 标签颜色为白色
        },
        labelLine: {
          length: 10, // 标签连线长度
          length2: 15, // 连线到标签的延伸长度
          lineStyle: {
            color: '#ffffff', // 连线颜色为白色
          },
        },
        data: categoryData.value, // 饼图数据
      },
    ],
  };
  myChart.setOption(option);

  // 添加点击事件
  myChart.on('click', params => {
    console.log('点击的类别:', params.name); // 调试信息
    handleClick(params.name); // 跳转页面
  });

  // 自动适应窗口大小
  window.addEventListener('resize', () => myChart.resize());
};

onMounted(() => {
  fetchCategorySales(); // 加载数据并渲染饼图
});
</script>

  
  <style scoped lang="less">
  .chart-container {
    width: 100%; /* 使用父容器宽度 */
    height: 350px; /* 增加容器高度，避免布局过于紧凑 */
    max-width: 100%; /* 确保宽度不会超出页面 */
    overflow: hidden; /* 防止内容溢出 */
  }
  </style>
  