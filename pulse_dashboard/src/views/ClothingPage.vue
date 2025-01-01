<template>
  <div class="bg-[url('assets/imgs/bg.jpg')] bg-cover bg-center h-screen text-white p-2 flex overflow-hidden">
    <!-- 左侧区域 -->
    <div class="flex-1 mr-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col">
      <!-- 横向柱状图 -->
      <ClothingDistributionChart class="h-1/2 box-border pb-4" />
      <!-- 雷达图 -->
      <Top5BarChart class="h-1/2 box-border pb-4" />
    </div>

    <!-- 中间区域，划分为3块 -->
    <div class="w-1/2 mr-2 flex flex-col">
      <!-- 上部分：数据展示图 -->
      <SalesAmount class="h-1/4 bg-opacity-50 bg-slate-800 p-3 mb-2" />

      <!-- 中部分：地图可视化 -->
      <SalesVolume class="h-3/4 bg-opacity-50 bg-slate-800 p-3 mb-2 " />

    </div>

    <!-- 右侧区域 -->
    <div class="flex-1 ml-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col">
      <!-- 竖向柱状图 -->
      <RealTimeSalesChart class="h-1/2 box-border pb-4" />
      <!-- 环形资源站比图 -->
      <RefundTrendChart class="h-1/2 box-border pb-4" />
    </div>
  </div>
</template>
<script setup>
import axios from 'axios';
import ClothingDistributionChart from '../components/ClothingPage_charts/ClothingDistributionChart.vue';
import Profit from '../components/ClothingPage_charts/Profit.vue';
import RealTimeSalesChart from '../components/ClothingPage_charts/RealTimeSalesChart.vue';
import RefundTrendChart from '../components/ClothingPage_charts/RefundTrendChart.vue';
import SalesAmount from '../components/ClothingPage_charts/SalesAmount.vue';
import SalesVolume from '../components/ClothingPage_charts/SalesVolume.vue';
import Top5BarChart from '../components/ClothingPage_charts/Top5BarChart.vue';

</script>

<style lang="scss" scoped></style>