<template>
  <div class="bg-[url('assets/imgs/bg.jpg')] bg-cover bg-center h-screen text-white p-2 flex overflow-hidden">
    <!-- 左侧区域 -->
    <div class="w-1/4 mr-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col">
      <!-- 产品类型分布 -->
      <HotBrandsChart class="h-1/2 box-border pb-4" />
      <!-- Top 5 热销产品 -->
      <Top5ProductsChart class="h-1/2 box-border pb-4" />
    </div>

    <!-- 中间区域，划分为2块 -->
    <div class="w-1/2 mr-2 flex flex-col">

      <!-- 中部分：地图可视化 -->
      <FoodTotalSales class="h-1/3 bg-opacity-50 bg-slate-800 p-3 mb-2" />
      <SalesVolume class="h-2/3 bg-opacity-50 bg-slate-800 p-3 mb-2 " />
    </div>

    <!-- 右侧区域 -->
    <div class="w-1/4 ml-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col">
      <!-- 分时销售统计 -->
      <TotalSalesAmount class="h-1/2 box-border pb-4" />
      <!-- 退货趋势分析 -->
      <RefundTrendChart class="h-1/2 box-border pb-4" />
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import HotBrandsChart from '../components/FoodPage_charts/HotBrandsChart.vue';
import Top5ProductsChart from '../components/FoodPage_charts/Top5ProductsChart.vue';
import TotalSalesAmount from '../components/FoodPage_charts/TotalSalesAmount.vue';
import RefundTrendChart from '../components/FoodPage_charts/RefundTrendChart.vue';
import SalesVolume from '../components/FoodPage_charts/SalesVolume.vue';
import FoodTotalSales from '../components/FoodPage_charts/FoodTotalSales.vue';
</script>

<style lang="scss" scoped></style>

