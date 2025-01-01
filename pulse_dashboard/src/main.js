import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';

// 导入DataVVue3组件库
import DataVVue3 from '@kjgl77/datav-vue3';

// 导入vue3-scroll-seamless插件
import { vue3ScrollSeamless } from "vue3-scroll-seamless";

// 创建Vue应用实例
const app = createApp(App);

// 使用Vue Router
app.use(router);

// 使用DataVVue3组件库
app.use(DataVVue3);

// 注册vue3-scroll-seamless插件为全局组件
app.component('vue3ScrollSeamless', vue3ScrollSeamless);

// 挂载Vue应用到DOM
app.mount('#app');