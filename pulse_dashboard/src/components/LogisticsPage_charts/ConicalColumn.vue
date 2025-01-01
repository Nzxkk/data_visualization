<template>
  <div>
      <div>【运输公司分布】</div>
      <div demo-bg style="display: flex; justify-content: center; align-items: center; height: 250px;">
          <dv-conical-column-chart :config="config" style="width:400px;height:200px;" />
      </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue'
const props = defineProps({
data: {
  type: Object,
  required: true
}
})

// 使用 ref 来定义 company 和 config，以便它们可以响应式地更新
const company = ref(props.data.data);
console.log(company);


// 定义一个比较函数，按照物流公司名称排序
function compareCourierCompany(a, b) {
const order = ['顺丰', '申通', '韵达', '圆通', '中通'];
const indexA = order.indexOf(a.courier_company);
const indexB = order.indexOf(b.courier_company);
if (indexA < indexB) return -1;
if (indexA > indexB) return 1;
return 0;
}

// 使用 watch 来监听 props.data 的变化，并更新 company 和 config
watch(() => props.data, (newData) => {
company.value = newData.data;
company.value.data.sort(compareCourierCompany);
updateConfig();
}, { deep: true });

function updateConfig() {
config.value.data = company.value.data.map(item => ({
  name: item.courier_company,
  value: item.count
}));
}

// 导入图片资源
import top1 from '@/assets/imgs/sp.png'
import top2 from '@/assets/imgs/sto.png'
import top3 from '@/assets/imgs/yd.png'
import top4 from '@/assets/imgs/yt.png'
import top5 from '@/assets/imgs/zto.png'

// 使用 ref 来定义 config，以便它可以响应式地更新
const config = ref({
data: company.value.data.map(item => ({
  name: item.courier_company,
  value: item.count
})),
img: [
  top1,
  top2,
  top3,
  top4,
  top5,
],
showValue: true,
sort: false
});

// 初始时也执行一次更新，以确保 config 被正确初始化
onMounted(() => {
company.value.data.sort(compareCourierCompany);
updateConfig();
});
</script>