<script lang="ts" setup>
import { reactive } from "vue";
import {vue3ScrollSeamless} from "vue3-scroll-seamless";
let list = reactive([{
          'title': '物流服务提升：菜鸟集团与淘天集团的物流联合保障措施显示，天猫双十一物流服务在提升物流体验方面取得了显著成就，国内半日达、国际五日达成为优质旗舰服务',
        }, {
          'title': ' ',
        }, {
          'title': '技术创新应用：菜鸟集团在仓储、运输节点、车辆、末端、包裹等环节加大物联网技术的研发和应用，推动整个行业加入技术投入，实现物流要素的数字化、智能化',
        }, {
          'title': ' ',
        }, {
          'title': '绿色物流：天猫双11的绿色会场共有来自2,000个商家共同参与，提供50万款绿色商品，体现了物流在环保方面的努力和成就',
        }, {
          'title': ' ',
        }
        ]);

        const classOptions = {
            singleHeight: 40
        };

</script>

<template>
  <div>
    <div>
      【荣誉展示】
    </div>
    <div class="demo">
      <vue3ScrollSeamless
        class="scroll-wrap"
        :classOptions="classOptions"
        :dataList="list"
      >
        <ul class="ui-wrap">
          <li class="li-item" v-for="(item,i) of list" :key="i">
              <p>{{item.title}}</p>
          </li>
        </ul>
      </vue3ScrollSeamless>
    </div>
  </div>
  

</template>
<style>
.demo {
  display: flex;
  align-items: center;
  justify-content: center;
}
.scroll-wrap {
  height:320px;
  width: 360px;
  margin: 0 auto;
  overflow: hidden;
}
.ui-wrap {
  list-style: none;
  padding: 0;
  margin: 0 auto;
}
.li-item {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: center;
}
</style>

