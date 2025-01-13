import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:3000',  // 设置基础URL
  timeout: 5000  // 设置超时时间
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      // 将 token 添加到请求头
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 如果是认证错误，清除本地存储并跳转到登录页
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = '/login';
      }
      console.error('请求失败:', error.response.data);
    } else {
      console.error('请求错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance; 