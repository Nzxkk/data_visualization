<template>
	<div id="app">
	  <router-view :key="$route.fullPath"/> <!-- 用来渲染当前路由对应的组件 -->
	</div>
  </template>
  
  <script>
  import router from './router'; // 引入 router.js 中的 router 实例
  
  export default {
	name: 'App',
	router, // 注入路由实例
  };
  </script>
  
  <style>
  #app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
  }
  </style>
  