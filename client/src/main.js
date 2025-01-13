import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from './utils/axios';
import './assets/styles/common.css';

// 创建 Vue 应用实例
const app = createApp(App);

// 全局配置 axios
app.config.globalProperties.$axios = axios;

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app'); 