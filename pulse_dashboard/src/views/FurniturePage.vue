<template>
  <div class="bg-[url('assets/imgs/bg.jpg')] bg-cover bg-center h-screen text-white p-2 flex overflow-hidden">
    <!-- 左侧区域 -->
    <div class="w-1/4 mr-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col">
      <!-- 横向柱状图（例如按家居用品品类统计销售量，修改说明文字体现是家居用品相关） -->
      <FurnitureDistributionChart class="h-1/2 box-border pb-4" />
      <!-- 雷达图（例如展示不同家居用品产品综合评分情况，修改说明文字体现是家居用品相关，假设已有对应数据接口和逻辑，若暂无可后续完善） -->
      <Top5FurnitureRatingChart class="h-1/2 box-border pb-4" />
    </div>

    <!-- 中间区域，划分为3块 -->
    <div class="w-1/2 mr-2 flex flex-col">
      <!-- 上部分：数据展示图（例如展示家居用品总销售额，修改说明文字体现是家居用品相关） -->
      <FurnitureSalesAmount class="h-1/4 bg-opacity-50 bg-slate-800 p-3 mb-2" />

      <!-- 中部分：地图可视化（例如展示各地区家居用品销售分布情况，修改说明文字体现是家居用品相关，此处已改成地图展示） -->
      <FurnitureSalesVolumeByRegion class="h-1/2 bg-opacity-50 bg-slate-800 p-3 mb-2 " />

    
    </div>

    <!-- 右侧区域 -->
    <div class="w-1/4 ml-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col">
      <!-- 竖向柱状图（例如按时间段统计家居用品销售数量，修改说明文字体现是家居用品相关） -->
      <RealTimeFurnitureSalesChart class="h-1/2 box-border pb-4" />
      <!-- 环形图（例如展示不同家居用品品牌或类型占比情况，修改原材质占比的说明文字，假设已有对应数据获取和图表渲染逻辑） -->
      <FurnitureBrandRatioChart class="h-1/2 box-border pb-4" />
      <FurnitureTypeRatioChart class="h-1/2 box-border pb-4" />
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import FurnitureDistributionChart from '../components/FurniturePage_charts/FurnitureDistributionChart.vue';
import FurnitureAverageProfit from '../components/FurniturePage_charts/FurnitureAverageProfit.vue';
import RealTimeFurnitureSalesChart from '../components/FurniturePage_charts/RealTimeFurnitureSalesChart.vue';
import FurnitureTypeRatioChart from '../components/FurniturePage_charts/FurnitureTypeRatioChart.vue';
import FurnitureSalesAmount from '../components/FurniturePage_charts/FurnitureSalesAmount.vue';
import FurnitureSalesVolumeByRegion from '../components/FurniturePage_charts/FurnitureSalesVolumeByRegion.vue';
import Top5FurnitureRatingChart from '../components/FurniturePage_charts/Top5FurnitureRatingChart.vue';
</script>

<style lang="scss" scoped></style>