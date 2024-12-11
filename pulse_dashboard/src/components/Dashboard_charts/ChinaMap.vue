<template>
    <div class="chart-container">
      <div ref="target" class="map-container"></div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import * as echarts from 'echarts'
  import mapJson from '@/assets/MapData/china.json'  // 确保路径正确，指向包含中国地图的 GeoJSON 文件
  import axios from 'axios'
  
  const target = ref(null)
  let mChart = null
  const provinceSalesData = ref([]) // 存储各省销售额数据
  
  onMounted(() => {
    // 注册地图数据
    echarts.registerMap('china', mapJson)
  
    // 初始化图表实例
    mChart = echarts.init(target.value)
  
    // 获取销售额数据
    fetchProvinceSalesData()
  
    // 渲染地图
    renderChart()
  
    // 监听窗口尺寸变化，动态调整图表大小
    window.addEventListener('resize', onResize)
  })
  
  onBeforeUnmount(() => {
    // 移除 resize 监听事件，避免内存泄漏
    window.removeEventListener('resize', onResize)
  
    // 销毁 ECharts 实例
    if (mChart) {
      mChart.dispose()
    }
  })
  
  // 获取省份销售总额数据
  const fetchProvinceSalesData = async () => {
    try {
      const response = await axios.get('http://localhost:3006/api/province-sales')
      provinceSalesData.value = response.data
      renderChart()  // 获取到数据后渲染图表
    } catch (error) {
      console.error("获取省份销售总额数据失败:", error)
    }
  }
  
  // 渲染地图图表
  const renderChart = () => {
    // 将销售额数据与省份名称进行匹配
    const salesMap = new Map()
    provinceSalesData.value.forEach(item => {
      salesMap.set(item.province, item.total_sales)
    })
  
    let options = {
      tooltip: {
        trigger: 'item',  // 鼠标悬停时显示
        formatter: function (params) {
          const provinceName = params.name
          const sales = salesMap.get(provinceName) || 0  // 获取对应省份的销售额，默认值为0
          return `${provinceName}: ${sales}元`  // 显示省份名称和销售额
        }
      },
      series: [
        {
          name: 'China Map',    // 图表名称
          type: 'map',          // 类型为地图
          map: 'china',         // 使用已注册的中国地图
          roam: false,          // 不允许缩放和拖动
          label: {
            show: true,         // 显示省份名称
            color: '#ffffff',   // 设置标签字体颜色为白色
          },
          itemStyle: {
            normal: {
              areaColor: 'rgba(0, 0, 0, 0)',  // 去除地图区域的背景色，透明
              borderColor: '#ddd', // 设置边框颜色
              borderWidth: 1,        // 设置边框宽度
            },
            emphasis: {
              areaColor: '#8ba4b1',  // 鼠标悬浮时的颜色
              borderColor: '#1e90ff', // 鼠标悬浮时的边界颜色
            },
          },
          data: provinceSalesData.value.map(item => ({
            name: item.province,
            value: item.total_sales,
          })),
        }
      ],
    }
  
    // 设置地图配置
    mChart.setOption(options)
  }
  
  // 处理窗口尺寸变化时重新调整图表尺寸
  const onResize = () => {
    if (mChart) {
      mChart.resize()  // 重新调整图表尺寸
    }
  }
  </script>
  
  <style lang="scss" scoped>
  /* 确保地图容器的宽高能填充父级 */
  .chart-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .map-container {
    width: 100%;
    height: 500px;  /* 自定义地图容器的高度 */
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
  </style>
  