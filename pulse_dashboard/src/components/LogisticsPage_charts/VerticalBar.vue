<template>
    <div>
      <div>【快递发出前五位】</div>
      <div ref="target" class="w-full h-full"></div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, watch, reactive } from 'vue'
  import * as echarts from 'echarts'
  const props = defineProps({
    data: {
      type: Object,
      required: true
    }
  })
  console.log(props.data.data);
  
  const target = ref(null)
  let mChart = null
  
  onMounted(() => {
    mChart = echarts.init(target.value)
    renderChart()
  })
  
  const renderChart = () => {
    const options = {
      xAxis: {
        type: 'category',
        data: props.data.data.data.map((item) => item.province),
        axisLabel: {
          color: '#9EB1C8'
        }
      },
      yAxis: {
        type: 'value',
        show: false,
        max: function (value) {
          return parseInt(value.max * 1.0)
        }
      },
      series: {
        type: 'bar',
        data: props.data.data.data.map((item) => ({
          name: item.province,
          value: item.count
        })),
        itemStyle: {
          color: '#479AD3',
          barBorderRadius: 5,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 5
        },
        barWidth: 12,
        label: {
          show: true,
          position: 'top',
          textStyle: {
            color: '#fff'
          },
          formatter: '{c}'
        }
      }
    }
  
    mChart.setOption(options)
  }
  watch(
      () => props.data,
      () => {
          renderChart()
      }
  )
  
  </script>
  