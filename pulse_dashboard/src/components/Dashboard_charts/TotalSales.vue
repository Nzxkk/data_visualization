<template>
  <div class="p-6 relative">
    <!-- 物流按钮 -->
    <button
      @click="goToLogistics"
      class="logistics-btn absolute top-0 left-0 m-4 px-4 py-2 text-white border border-white rounded hover:bg-white hover:text-black transition-all"
    >
      物流
    </button>

    <!-- 总数据量展示 -->
    <div class="text-slate-300 text-center">
      销售总额：
      <span
        ref="totalCountTarget"
        class="text-7xl ml-2 mr-2 font-bold font-[Electronic] text-gradient"
      >
        0.00
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
        {{ region.label }}
        <span
          :ref="el => (region.ref = el)"
          class="text-[#5DC5EF] text-3xl font-[Electronic]"
        >
          0.00
        </span>
        元
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive, nextTick } from 'vue';
import { useRouter } from 'vue-router'; // 引入 Vue Router 的 useRouter 方法
import { CountUp } from 'countup.js';
import { getProvinceSales } from '@/api/index';

// 使用 Vue Router 路由实例
const router = useRouter();

// 跳转到物流页面的函数
const goToLogistics = () => {
  router.push('/logistics'); // 替换为物流页面的实际路径
};

// 绑定总数据量的 DOM 元素
const totalCountTarget = ref(null);

// 定时器 ID
let intervalId = null;

// 区域与省份的映射
const provinceToRegionMap = {
  华北: ["北京", "天津", "河北", "山西", "内蒙古"],
  东北: ["辽宁", "吉林", "黑龙江"],
  华东: ["上海", "江苏", "浙江", "安徽", "福建", "江西", "山东"],
  中南: ["河南", "湖北", "湖南", "广东", "广西", "海南"],
  西南: ["重庆", "四川", "贵州", "云南", "西藏"],
  西北: ["陕西", "甘肃", "青海", "宁夏", "新疆"],
};

// 统计数据，初始化总销售额为 0.00
const stats = ref({ total: 0.00 });

// 定义区域数据，并将 regions 包装在 reactive 中
const regions = reactive([
  { label: "华北", ref: null, total: 0.00, provinces: [] },
  { label: "东北", ref: null, total: 0.00, provinces: [] },
  { label: "华东", ref: null, total: 0.00, provinces: [] },
  { label: "中南", ref: null, total: 0.00, provinces: [] },
  { label: "西南", ref: null, total: 0.00, provinces: [] },
  { label: "西北", ref: null, total: 0.00, provinces: [] },
]);

// 定义持久的 CountUp 实例
const countUpTotal = ref(null);
const countUpRegions = reactive(regions.map(() => null));

// 聚合区域数据
const aggregateRegionData = (provinceData) => {
  const regionTotals = {
    华北: 0.00,
    东北: 0.00,
    华东: 0.00,
    中南: 0.00,
    西南: 0.00,
    西北: 0.00,
  };

  // 重置各区域的 provinces 数组
  regions.forEach(region => {
    region.provinces = [];
  });

  provinceData.forEach(({ province, total_sales }) => {
    const sales = parseFloat(total_sales) || 0.00;

    const region = Object.keys(provinceToRegionMap).find((r) =>
      provinceToRegionMap[r].includes(province)
    );

    if (region) {
      regionTotals[region] += sales;
      const regionObj = regions.find((r) => r.label === region);
      if (regionObj) {
        regionObj.provinces.push({ province, sales });
      }
    }
  });

  const total = Object.values(regionTotals).reduce((sum, value) => sum + value, 0.00);
  return { regionTotals, total };
};

// 生成区域详细信息
const getRegionDetails = (region) => {
  const provinceDetails = region.provinces
    .map(({ province, sales }) => `${province}: ${sales.toFixed(2)} 元`)
    .join("\n");

  return `详细数据:\n${provinceDetails}`;
};

// 加载并处理区域统计数据
const loadRegionStats = async () => {
  try {
    const response = await getProvinceSales();

    const { regionTotals, total } = aggregateRegionData(response.data);

    // 检查总销售额是否变化
    if (stats.value.total !== total) {
      stats.value.total = total;
      // 更新 CountUp
      if (countUpTotal.value) {
        countUpTotal.value.update(stats.value.total);
      } else if (totalCountTarget.value) {
        countUpTotal.value = new CountUp(totalCountTarget.value, stats.value.total, {
          separator: ",",
          decimal: ".",
          decimalPlaces: 2, // 保留两位小数
        });
        if (countUpTotal.value.error) {
          console.error(countUpTotal.value.error);
        } else {
          countUpTotal.value.start();
        }
      }
    }

    // 更新各区域的总销售额
    regions.forEach((region, index) => {
      const newTotal = regionTotals[region.label] || 0.00;
      if (region.total !== newTotal) {
        region.total = newTotal;
        // 更新 CountUp
        if (countUpRegions[index]) {
          countUpRegions[index].update(region.total);
        } else if (region.ref) {
          countUpRegions[index] = new CountUp(region.ref, region.total, {
            separator: ",",
            decimal: ".",
            decimalPlaces: 2, // 保留两位小数
          });
          if (countUpRegions[index].error) {
            console.error(`CountUp 错误: ${countUpRegions[index].error}`);
          } else {
            countUpRegions[index].start();
          }
        }
      }
    });
  } catch (error) {
    console.error("加载省份数据失败:", error);
  }
};

// 启动轮询
const startPolling = () => {
  loadRegionStats(); // 初次加载数据
  intervalId = setInterval(loadRegionStats, 5000); // 每 5 秒轮询
};

// 停止轮询
const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// 生命周期钩子
onMounted(() => {
  // 初始化 CountUp 实例
  if (totalCountTarget.value) {
    countUpTotal.value = new CountUp(totalCountTarget.value, stats.value.total, {
      separator: ",",
      decimal: ".",
      decimalPlaces: 2, // 保留两位小数
    });
    if (!countUpTotal.value.error) {
      countUpTotal.value.start();
    } else {
      console.error(countUpTotal.value.error);
    }
  }

  regions.forEach((region, index) => {
    if (region.ref) {
      countUpRegions[index] = new CountUp(region.ref, region.total, {
        separator: ",",
        decimal: ".",
        decimalPlaces: 2, // 保留两位小数
      });
      if (!countUpRegions[index].error) {
        countUpRegions[index].start();
      } else {
        console.error(`CountUp 错误: ${countUpRegions[index].error}`);
      }
    }
  });

  startPolling(); // 启动轮询
});

onBeforeUnmount(() => {
  stopPolling(); // 停止轮询
});
</script>

<style lang="scss" scoped>
.text-gradient {
  background: linear-gradient(90deg, #5dc5ef, #00ffdd);
  -webkit-background-clip: text;
  color: transparent;
  background-clip: text;
}

.logistics-btn {
  background-color: transparent; /* 设置透明背景 */
  border: 1px solid #ffffff; /* 添加白色边框 */
  color: #ffffff; /* 按钮文字颜色 */
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ffffff; /* 悬停时背景变为白色 */
    color: #000000; /* 悬停时文字变为黑色 */
  }
}
</style>
