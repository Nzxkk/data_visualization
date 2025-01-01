
<template>
  <div class="bg-[url('assets/imgs/bg.jpg')] bg-cover bg-center h-screen text-white p-2 flex overflow-hidden">
    <!-- 左侧区域 -->
    <div class="w-1/4 mr-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col">
      <!-- 横向柱状图（例如按家居用品品类统计销售量，修改说明文字体现是家居用品相关） -->
      <MotherBabyBrandMarketShareChart class="h-1/2 box-border pb-4" />
      <!-- 雷达图（例如展示不同家居用品产品综合评分情况，修改说明文字体现是家居用品相关，假设已有对应数据接口和逻辑，若暂无可后续完善） -->
      <MotherBabyProductTypeSalesRatioChart class="h-1/2 box-border pb-4" />
    </div>

   

    <!-- 中间区域，划分为3块 -->
    <div class="w-1/2 mr-2 flex flex-col">
      <!-- 上部分：数据展示图（例如展示家居用品总销售额，修改说明文字体现是家居用品相关） -->
      <MotherBabySalesAmount class="h-1/4 bg-opacity-50 bg-slate-800 p-3 mb-2" />

      <!-- 中部分：地图可视化（例如展示各地区家居用品销售分布情况，修改说明文字体现是家居用品相关，此处已改成地图展示） -->
      <MotherBabySalesVolumeByRegion class="h-3/4 bg-opacity-50 bg-slate-800 p-3 mb-2 " />

      
    </div>

    <!-- 右侧区域 -->
    <div class="w-1/4 ml-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col">
      <!-- 竖向柱状图（例如按时间段统计家居用品销售数量，修改说明文字体现是家居用品相关） -->
      <MotherBabyRealTimeSalesChart class="h-1/2 box-border pb-4" />
      <!-- 环形图（例如展示不同家居用品品牌或类型占比情况，修改原材质占比的说明文字，假设已有对应数据获取和图表渲染逻辑） -->
      <MotherBabyTypeRatioChart class="h-1/2 box-border pb-4" />
      
    </div>
  </div>
</template>
<script setup>
import MotherBabyAverageProfit from '../components/MotherBabyPage_charts/MotherBabyAverageProfit.vue';
import MotherBabyRealTimeSalesChart from '../components/MotherBabyPage_charts/MotherBabyRealTimeSalesChart.vue';
import MotherBabyTypeRatioChart from '../components/MotherBabyPage_charts/MotherBabyTypeRatioChart.vue';
import MotherBabySalesAmount from '../components/MotherBabyPage_charts/MotherBabySalesAmount.vue';
import MotherBabySalesVolumeByRegion from '../components/MotherBabyPage_charts/MotherBabySalesVolumeByRegion.vue';
import MotherBabyBrandMarketShareChart from '../components/MotherBabyPage_charts/MotherBabyBrandMarketShareChart.vue';
import MotherBabyProductTypeSalesRatioChart from '../components/MotherBabyPage_charts/MotherBabyProductTypeSalesRatioChart.vue';
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
