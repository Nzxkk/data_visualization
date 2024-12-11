<template>
	<div class="bg-[url('assets/imgs/bg.jpg')] bg-cover bg-center h-screen text-white p-2 flex overflow-hidden">
		<div class="flex-1 mr-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col justify-between">
  <!-- 横向柱状图 -->
  <BarChart class="h-1/3 box-border pb-4" />
  <!-- 雷达图 -->
  <PieChart class="h-1/3 box-border pb-4" />
  <!-- 数据传递关系图 -->
  <WordCloud class="h-1/3 flex-1 overflow-hidden" />
		</div>

		<div class="w-1/2 mr-2 flex flex-col">
			<!-- 数据展示图 -->
			<TotalSales
				class="h-1/4 bg-opacity-50 bg-slate-800 p-3"
			/>
			<!-- 地图可视化 -->
			<ChinaMap
				class="h-3/4 bg-opacity-50 bg-slate-800 p-3 mt-2 flex-1"
			/>
		</div>
		<div class="flex-1 bg-opacity-50 bg-slate-800 p-3 flex flex-col">
			<!-- 竖向柱状图 -->
			<TimeOrdersChart class="h-1/2 box-border pb-4"  />
			<!-- 环形资源站比图 -->
			<TimeSalesChart class="h-1/3 box-border pb-4" />
			
		</div>
	</div>
</template>

<script setup>
import axios from 'axios';
import PieChart from '@/components/Dashboard_charts/PieChart.vue';  
import TimeSalesChart from '@/components/Dashboard_charts/TimeSalesChart.vue';
import TimeOrdersChart from '@/components/Dashboard_charts/TimeOrdersChart.vue';
import WordCloud from '@/components/Dashboard_charts/WordCloud.vue';
import ChinaMap from '@/components/Dashboard_charts/ChinaMap.vue';
import BarChart from '@/components/Dashboard_charts/BarChart.vue'; 
import TotalSales from '@/components/Dashboard_charts/TotalSales.vue'; 
</script>

<style lang="scss" scoped></style>