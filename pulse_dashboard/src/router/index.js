import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import ClothingPage from '@/views/ClothingPage.vue';
import ElectronicsPage from '@/views/ElectronicsPage.vue';
import FurniturePage from '@/views/FurniturePage.vue';
import MotherBabyPage from '@/views/MotherBabyPage.vue';
import FoodPage from '@/views/FoodPage.vue';
import LogisticsPage from '@/views/LogisticsPage.vue'; // 引入 LogisticsPage 页面

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
  {
    path: '/electronics',
    name: 'ElectronicsPage',
    component: ElectronicsPage,
  },
  {
    path: '/food',
    name: 'FoodPage',
    component: FoodPage,
  },
  {
    path: '/furniture',
    name: 'FurniturePage',
    component: FurniturePage,
  },
  {
    path: '/motherbaby',
    name: 'MotherBabyPage',
    component: MotherBabyPage,
  },
  {
    path: '/logistics', // 新增的物流页面路由
    name: 'LogisticsPage',
    component: LogisticsPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
