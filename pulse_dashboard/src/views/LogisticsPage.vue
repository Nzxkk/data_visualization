<template>
	<dv-full-screen-container>
		<div class=" bg-[url('assets/imgs/bg.jpg')] bg-cover bg-center h-screen text-white flex overflow-hidden" v-if="data">
		  
			<div class="h-screen flex bg-center">
			  <!--左-->
			  <div class=" flex-1 mr-5 bg-opacity-50 bg-slate-800 flex flex-col mt-7 mb-3">
				<!-- 竖形图 -->
				<VerticalBar class="h-1/3 " :data="data.Logisticsdata"/>
				<!-- 动态环图 -->
				<ActiveRingBar class="h-1/3" :data="data.category"/>
				<!-- 横行图 -->
				<ConicalColumn class="h-1/3" :data="data.company"/>
			  </div>
			  <!--中-->
			  <div class="w-1/2 mr-5 flex flex-col mt-7 mb-3">
				<!-- 数据展示图 -->
				<TotalData class="bg-opacity-50 bg-slate-800 p-3" :data="data.Total"/>
				<!-- 地图可视化 -->
				<FlyLineBar class="bg-opacity-50 bg-slate-800 p-3 mt-2 flex-1" :data="data.mapdata"/>
			  </div>
			  <!--右-->
			  <div class=" flex-1 bg-opacity-50 bg-slate-800 flex flex-col mt-7 mb-3">
				<!-- 表格图 -->
				<TopBar class="h-5/8" :data="data.routing_efficiency_top10"/>
				<ShowHonor class="h-3/8" />
			  </div>
			</div>  
		  
		</div> 
	</dv-full-screen-container>
	
  
  
  </template>
  <script setup>
  import TotalData from '../components/LogisticsPage_charts/TotalData.vue'
  import VerticalBar from '../components/LogisticsPage_charts/VerticalBar.vue'
  import TopBar from '../components/LogisticsPage_charts/TopBar.vue'
  import ConicalColumn from '../components/LogisticsPage_charts/ConicalColumn.vue'
  import ActiveRingBar from '../components/LogisticsPage_charts/ActiveRingBar.vue'
  import FlyLineBar from '../components/LogisticsPage_charts/FlyLineBar.vue'
  import ShowHonor from '../components/LogisticsPage_charts/ShowHonor.vue'
  import {reqLogisticsdataInfo ,reqTotalInfo,reqFlight_pathsInfo,reqProvincesInfo,reqTopInfo,reqcompanyInfo
	,reqcategoryInfo,reqpointInfo
  } from "../api/index.js"
  import { ref } from 'vue'
  
  
  const data = ref(null)
  const loadData = async () => {
	const Logisticsdata = await reqLogisticsdataInfo();
	const Total = await reqTotalInfo();
	const flight_paths=await reqFlight_pathsInfo();
	const provinces=await reqProvincesInfo();
	const routing_efficiency_top10=await reqTopInfo();
	const company=await reqcompanyInfo();
	const category=await reqcategoryInfo();
	const point=await reqpointInfo();
	data.value={
	  Logisticsdata:Logisticsdata,
	  Total:Total,
	  mapdata: {
		provinces: provinces,
		flight_paths: flight_paths,
		point:point
	  },
	  routing_efficiency_top10:routing_efficiency_top10,
	  company:company,
	  category:category,
	}
	console.log(data.value)
  }
  
  loadData()
  
  setInterval(() => {
	  loadData()
  }, 3000)
  
  
  </script>
  <style lang="scss" scoped></style>