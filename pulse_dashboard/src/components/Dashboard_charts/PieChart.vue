<template>
  <div>
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router'; // 引入 Vue Router
import * as echarts from 'echarts';
import { getCategorySales } from '@/api/index'; // 调用封装的 API 方法

// 绑定图表的 DOM 元素
const chart = ref(null);
let myChart = null; // ECharts 实例

// 定时器 ID
let intervalId = null;

// 类别销售数据
const categoryData = ref([]); // 存储后端返回的数据
const previousCategoryData = ref([]); // 存储之前的数据，用于比较

// Vue Router 实例
const router = useRouter();

// 跳转到目标页面的函数
const handleClick = (category) => {
  console.log('点击的类别:', category); // 检查是否点击了正确的类别
  const routes = {
    服饰: '/clothing', // 服装页面
    电子产品: '/electronics', // 电子产品页面
    家居用品: '/furniture', // 家居用品页面
    母婴用品: '/motherbaby', // 母婴用品页面
    食品: '/food', // 食品页面
  };
  const path = routes[category];
  console.log('跳转路径:', path); // 输出跳转的路径
  if (path) {
    router.push(path); // 跳转到对应页面
  } else {
    console.warn('未定义的跳转类别:', category);
  }
};

// 获取数据并处理
const fetchCategorySales = async () => {
  try {
    const response = await getCategorySales(); // 获取 API 数据
    // 假设后端返回的数据格式为 [{ category: '类别1', total_sales: 1000 }, ...]
    const newData = response.data.map(item => ({
      name: item.category,
      value: Math.round(parseFloat(item.total_sales) * 100) / 100, // 保留两位小数并确保数值类型
    }));

    // 检查数据是否变化
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

// 渲染或更新饼图
const updateChart = () => {
  if (!myChart) {
    // 初始化 ECharts 实例
    myChart = echarts.init(chart.value);

    const option = {
      title: {
        text: '各类商品销量占比',
        left: 'center',
        top: '1%', // 调整标题位置，向上移动
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
          //fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        top: '10%', // 调整图例位置，向上移动
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
          radius: ['35%', '50%'], // 调整饼图半径
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}\n{d}%', // 标签格式为名称+百分比
            color: '#ffffff', // 标签颜色为白色
            fontSize: 14, // 调整字体大小
            //fontWeight: 'bold', // 标签字体加粗
          },
          labelLine: {
            length: 10, // 标签连线长度
            length2: 15, // 连线到标签的延伸长度
            lineStyle: {
              color: '#ffffff', // 连线颜色为白色
            },
          },
          data: categoryData.value, // 饼图数据
          animationDuration: 1000, // 动画时长
          animationEasing: 'cubicOut', // 动画缓动效果
        },
      ],
      animationDurationUpdate: 1000, // 更新动画时长
      animationEasingUpdate: 'quinticInOut', // 更新动画缓动效果
    };

    myChart.setOption(option);

    // 添加点击事件
    myChart.on('click', params => {
      console.log('点击的类别:', params.name); // 调试信息
      handleClick(params.name); // 跳转页面
    });

    // 自动适应窗口大小
    window.addEventListener('resize', () => myChart.resize());
  } else {
    // 更新数据并触发动画
    myChart.setOption({
      series: [
        {
          data: categoryData.value,
        },
      ],
    });
  }
};

// 启动轮询
const startPolling = () => {
  fetchCategorySales(); // 初次加载数据
  intervalId = setInterval(fetchCategorySales, 5000); // 每 5 秒轮询
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
  width: 100%; /* 使用父容器宽度 */
  height: 400px; /* 增加容器高度，避免布局过于紧凑 */
  max-width: 100%; /* 确保宽度不会超出页面 */
  overflow: hidden; /* 防止内容溢出 */
  background-color: transparent; /* 设置背景颜色 */
  border-radius: 10px; /* 设置圆角 */
  padding: 10px 20px; /* 减少上边距，向上移动内容 */
}
</style>
