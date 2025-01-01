<template>
	<div>
	  <div ref="target" class="w-full h-full">
	  </div>
  </div>
</template>
<script setup>
import { watch, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import mapJson from '@/assets/MapData/china.json'

const props = defineProps({
  data: {
	  type: Object,
	  required: true
  }
})
console.log(props.data.flight_paths.data);
//飞线图
const propsDataFlightPaths = props.data.flight_paths.data.data;
const propsDataPoint=props.data.point.data.data
const fly_pathdata = propsDataFlightPaths.map(item => {
return {
  name:item.shipping_start,
  coords: [
	[item.start_longitude, item.start_latitude], // 起点经纬度
	[item.end_longitude, item.end_latitude]     // 终点经纬度
  ]
};
});
//散点图
const topdata=propsDataPoint.map(item => {
return {
  name: item.province,
  value: [
	item.longitude, item.latitude,item.value // 起点经纬度
  ]
};
});
console.log(topdata);
const target = ref(null)
let mChart = null
let currentBatch = 0 // 当前批次
const batchSize = 10 // 每批显示的飞线数量
const intervalTime = 6000 // 每5秒切换一批
onMounted(() => {
  mChart = echarts.init(target.value)
  renderChart()
  startInterval() // 开始定时器
})
const renderChart = () => {
echarts.registerMap('china', mapJson)
  const options = {
	  grid: {
			  right: '2%',
			  top: '15%',
			  bottom: '10%',
			  width: '20%'
		  },
	  geo: {
			  // 展示
			  show: true,
			  // 中国地图
			  map: 'china',
			  // 开启缩放
			  roam: true,
			  // 初始缩放
			  zoom: 0.8,
			  // 中心点
			  center: [113.83531246, 34.0267395887],
			  // 默认状态的省份样式
			  itemStyle: {
				  normal: {
					  // 边框色值
					  borderColor: 'rgba(147, 235, 248, 1)',
					  // 边框宽度
					  borderWidth: 1,
					  // 区域颜色
					  areaColor: {
						  // 经向色值
						  type: 'radial',
						  x: 0.5,
						  y: 0.5,
						  r: 0.5,
						  colorStops: [
							  // 0% 处的颜色
							  {
								  offset: 0,
								  color: 'rgba(147, 235, 248, 0)'
							  },
							  // 100% 处的颜色
							  {
								  offset: 1,
								  color: 'rgba(147, 235, 248, .2)'
							  }
						  ],
						  // 缺省为 false
						  globalCoord: false
					  }
				  },
				  // 鼠标移入的色值
				  emphasis: {
					  areaColor: '#389BB7',
					  borderWidth: 0
				  }
			  }
		  },
	  // 柱形图核心配置
	  xAxis: {
			  // 数据轴
			  type: 'value',
			  // 脱离 0 值比例
			  scale: false,
			  // 位置
			  position: 'top',
			  // 不显示分割线
			  splitLine: {
				  show: false
			  },
			  // 不显示轴线
			  axisLine: {
				  show: false
			  },
			  // 不显示刻度尺
			  axisTick: {
				  show: false
			  },
			  // 类别文字
			  axisLabel: {
				  margin: 2,
				  textStyle: {
					  color: '#aaa'
				  }
			  }
	  },
	  // Y 轴
	  yAxis: {
		  // 选项轴
		  type: 'category',
		  // 轴线
		  axisLine: {
			  show: true,
			  lineStyle: {
				  color: '#ddd'
			  }
		  },
		  // 轴刻度
		  axisTick: {
			  show: false,
			  lineStyle: {
				  color: '#ddd'
			  }
		  },
		  // 轴标签
		  axisLabel: {
			  interval: 0,
			  textStyle: {
				  color: '#ddd'
			  }
		  },
		  // 根据年份，获取对应数据
		  data: props.data.provinces.data.data.map((item) => item.province)
	  },
	  series: [
	  {
				  zlevel: 1.5,
				  // 柱形图
				  type: 'bar',
				  // 每个柱子的色值
				  // itemStyle: {
				  // 	normal: {
				  // 		color: props.data.colors[2019]
				  // 	}
				  // },
				  // 根据年份，获取对应数据
				  data: props.data.provinces.data.data.map((item) => item.province_count)
			  },
		  {
			  // 散点（气泡）图
			  type: 'effectScatter',
			  // 使用地理坐标系
			  coordinateSystem: 'geo',
			  // 数据
			  data: topdata,
			  // 标记大小
			  symbolSize: function (val) {
				  return val[2] / 4
			  },
			  // 绘制完成后显示特效
			  showEffectOn: 'render',
			  // 展示涟漪特效
			  rippleEffect: {
				  brushType: 'stroke'
			  },
			  // 文字
			  label: {
				  normal: {
					  formatter: '{b}',
					  position: 'right',
					  show: true
				  }
			  },
			  // 每一项的配置
			  itemStyle: {
				  normal: {
					  // color: props.data.colors[index],
					  // 阴影配置
					  shadowBlur: 5,
					  // shadowColor: props.data.colors[index]
				  }
			  },
			  zlevel: 1
		  },
		  {
			  name: '飞线',
			  type: 'lines',
			  coordinateSystem: 'geo',
			  data: fly_pathdata.slice(currentBatch, currentBatch + batchSize),
			  lineStyle: {
			  normal: {
				  color: '#FFA500',
				  width: 5,
				  opacity: 0,
				  curveness: 0.2 // 曲线程度
			  }
			  },
			  effect: {
			  show: true,
			  period: 5,
			  trailLength: 0.7,
			  color:' #FFFFFF' ,
			  symbolSize: 5
			  },
			  zlevel: 1
		  }
	  ]
  }

  mChart.setOption(options)
}
const startInterval = () => {
setInterval(() => {
  // 更新当前批次
  currentBatch += batchSize
  if (currentBatch + batchSize > fly_pathdata.length) {
	currentBatch = 0 // 如果超出数组长度，重置为0
  }
  renderChart() // 重新渲染图表
}, intervalTime)
}
watch(
	() => props.data,
	() => {
		renderChart()
	}
)
</script>