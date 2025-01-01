<template>
	<div class="p-6">
		<div class="text-slate-300 text-center">
			累计快递总量：
			<span
				class="text-7xl ml-2 mr-2 font-bold font-[Electronic] text-gradient"
			>
				{{ total }}
			</span>
			件
		</div>
		<div class="mt-3 flex flex-wrap">
			<div class="w-1/3 text-center text-slate-400 text-sm">
				已揽收：
				<span class="text-[#5DC5EF] text-3xl font-[Electronic]">
					{{ alreadyCollected }}
				</span>
				件
			</div>
			<div class="w-1/3 text-center text-slate-400 text-sm">
				运输中：<span class="text-[#5DC5EF] text-3xl font-[Electronic]">{{ inTransit }}</span>件
			</div>
			<div class="w-1/3 text-center text-slate-400 text-sm">
				派送中：<span class="text-[#5DC5EF] text-3xl font-[Electronic]">{{ beingDelivered }}</span>件
			</div>
			<div class="w-1/3 text-center text-slate-400 text-sm">
				已签收：<span class="text-[#5DC5EF] text-3xl font-[Electronic]">{{ signedFor }}</span>件
			</div>
			<div class="w-1/3 text-center text-slate-400 text-sm">
				转寄退回：<span class="text-[#5DC5EF] text-3xl font-[Electronic]">{{ returned }}</span>件
			</div>
			<div class="w-1/3 text-center text-slate-400 text-sm">
				作废：<span class="text-[#5DC5EF] text-3xl font-[Electronic]">{{ voided }}</span>件
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
	data: {
		type: Object,
		required: true
	}
})

// 提取各个状态的数据
const total = computed(() => {
  return props.data.data.data.find(item => item.status === "总快递量")?.total_quantity || 0;
});

const alreadyCollected = computed(() => {
  return props.data.data.data.find(item => item.status === "已揽收")?.total_quantity || 0;
});

const inTransit = computed(() => {
  return props.data.data.data.find(item => item.status === "运输中")?.total_quantity || 0;
});

const beingDelivered = computed(() => {
  return props.data.data.data.find(item => item.status === "派送中")?.total_quantity || 0;
});

const signedFor = computed(() => {
  return props.data.data.data.find(item => item.status === "已签收")?.total_quantity || 0;
});

const returned = computed(() => {
  return props.data.data.data.find(item => item.status === "转寄退回")?.total_quantity || 0;
});

const voided = computed(() => {
  return props.data.data.data.find(item => item.status === "作废")?.total_quantity || 0;
});
</script>
