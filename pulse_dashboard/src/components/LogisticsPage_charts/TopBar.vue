<template>
    <div>
      <div>【货物运输路线前十位】</div>
      <div style="display: flex; justify-content: center; align-items: center; height: 420px;">
        <dv-scroll-ranking-board :config="config" style="width:380px;height:400px" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue'
  
  const props = defineProps({
    data: {
      type: Object,
      required: true
    }
  })
  
  // 使用 ref 来定义 data 和 config，以便它们可以响应式地更新
  const data = ref([]);
  const config = ref({
    data: []
  });
  
  // 定义一个函数来更新 data 和 config
  function updateData() {
    data.value = props.data.data.data.map(item => {
      return {
        name: item.route,
        value: item.total_quantity
      };
    });
    config.value.data = data.value; // 更新 config
  }
  
  // 每3秒钟增加数字
  function increaseNumbers() {
    setInterval(() => {
      data.value = data.value.map(item => ({
        ...item,
        value: item.value + 1 // 每次增加1
      }));
      config.value.data = data.value; // 更新 config
    }, 10000); // 3秒钟更新一次
  }
  
  // 监听 props.data 的变化
  watch(() => props.data, () => {
    updateData();
  }, { deep: true });
  
  // 在组件挂载时初始化数据
  onMounted(() => {
    updateData();
    increaseNumbers(); // 启动定时器
  });
  
  // 打印数据以便调试
  console.log(data.value);
  </script>
  