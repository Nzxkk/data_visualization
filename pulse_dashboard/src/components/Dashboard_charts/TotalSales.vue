<template>
  <div class="p-6">
    <!-- 总数据量展示 -->
    <div class="text-slate-300 text-center">
      销售总额：
      <span
        ref="totalCountTarget"
        class="text-7xl ml-2 mr-2 font-bold font-[Electronic] text-gradient"
      >
        0
      </span>
      元
    </div>

    <!-- 区域数据展示 -->
    <div class="mt-3 flex flex-wrap">
      <div
        v-for="(region, index) in regions"
        :key="index"
        class="w-1/3 text-center text-slate-400 text-sm"
        :title="getRegionDetails(region)" 
      >
        {{ region.label }}：
        <span
          :ref="region.ref"
          class="text-[#5DC5EF] text-3xl font-[Electronic]"
        >
          {{ region.total }} <!-- 绑定区域总销售额 -->
        </span>
        元
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, reactive, nextTick } from 'vue';
import { CountUp } from 'countup.js';
import { getProvinceSales } from '@/api/index';

// 绑定总数据量的 DOM 元素
const totalCountTarget = ref(null);

// 区域与省份的映射
const provinceToRegionMap = {
  华北: ["北京", "天津", "河北", "山西", "内蒙古"],
  东北: ["辽宁", "吉林", "黑龙江"],
  华东: ["上海", "江苏", "浙江", "安徽", "福建", "江西", "山东"],
  中南: ["河南", "湖北", "湖南", "广东", "广西", "海南"],
  西南: ["重庆", "四川", "贵州", "云南", "西藏"],
  西北: ["陕西", "甘肃", "青海", "宁夏", "新疆"],
};

// 定义区域数据，并将 regions 包装在 reactive 中
const regions = reactive([
  { label: "华北", ref: ref(null), total: 0, provinces: [] },
  { label: "东北", ref: ref(null), total: 0, provinces: [] },
  { label: "华东", ref: ref(null), total: 0, provinces: [] },
  { label: "中南", ref: ref(null), total: 0, provinces: [] },
  { label: "西南", ref: ref(null), total: 0, provinces: [] },
  { label: "西北", ref: ref(null), total: 0, provinces: [] },
]);

// 统计数据
const stats = ref({ total: 0 });

// 聚合区域数据
const aggregateRegionData = (provinceData) => {
  const regionTotals = {
    华北: 0,
    东北: 0,
    华东: 0,
    中南: 0,
    西南: 0,
    西北: 0,
  };

  provinceData.forEach(({ province, total_sales }) => {
    const sales = parseFloat(total_sales) || 0;
    console.log(`省份: ${province}, 销售额: ${sales}`);

    const region = Object.keys(provinceToRegionMap).find(r =>
      provinceToRegionMap[r].includes(province)
    );

    if (region) {
      regionTotals[region] += sales;
      console.log(`更新区域 ${region} 总销售额: ${regionTotals[region]}`);
      const regionObj = regions.find(r => r.label === region);
      if (regionObj) {
        regionObj.provinces.push({ province, sales });
      }
    } else {
      console.warn(`未找到区域映射: ${province}`);
    }
  });

  const total = Object.values(regionTotals).reduce((sum, value) => sum + value, 0);
  return { regionTotals, total };
};

// 生成区域详细信息
const getRegionDetails = (region) => {
  const provinceDetails = region.provinces
    .map(({ province, sales }) => `${province}: ${sales} 元`)
    .join("\n");

  return `详细数据:\n${provinceDetails}`;
};

// 加载并处理区域统计数据
const loadRegionStats = async () => {
  try {
    const response = await getProvinceSales();
    console.log("API Response:", response.data);

    const { regionTotals, total } = aggregateRegionData(response.data);
    console.log("Region Totals:", regionTotals);
    console.log("Total Sales:", total);

    // 更新总数
    stats.value.total = total;

    // 更新各个区域的总销售额
    regions.forEach(region => {
      region.total = regionTotals[region.label] || 0;
      console.log(`${region.label} - Total: ${region.total}`);
    });

    // 确保 DOM 更新后再启动动画
    await nextTick();

    // 启动总销售量的 CountUp 动画
    if (totalCountTarget.value) {
      const countUp = new CountUp(totalCountTarget.value, stats.value.total, {
        separator: ',',
        decimal: '.',
      });
      if (countUp.error) {
        console.error(countUp.error);
      } else {
        countUp.start();
      }
    } else {
      console.warn("未找到总量的 DOM 元素");
    }

    // 启动各区域销售量的 CountUp 动画
    regions.forEach(region => {
      if (region.ref.value) {
        const countUp = new CountUp(region.ref.value, region.total, {
          separator: ',',
          decimal: '.',
        });
        if (countUp.error) {
          console.error(`CountUp 错误: ${countUp.error}`);
        } else {
          countUp.start();
        }
      } else {
        console.warn(`未找到 DOM 元素: ${region.label}`);
      }
    });
  } catch (error) {
    console.error("加载省份数据失败:", error);
  }
};

// 组件挂载时加载数据
onMounted(loadRegionStats);
</script>
<style lang="scss" scoped>
.text-gradient {
  background: linear-gradient(90deg, #5dc5ef, #00ffdd);
  -webkit-background-clip: text;
  color: transparent;
}
</style>
