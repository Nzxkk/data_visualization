// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue'; // 引入 Dashboard 页面
import ClothingPage from '@/views/ClothingPage.vue'; // 引入 ClothingPage 页面

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/clothing',
    name: 'ClothingPage',
    component: ClothingPage,
  },
  // 可以继续添加其他路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; // 导出 router 实例
