<template>
  <div class="login-page">
    <div class="login-box">
      <h2>医院管理系统</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>账号</label>
          <input v-model="form.account" type="text" required>
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" required>
        </div>
        <button type="submit">登录</button>
      </form>
      <div class="links">
        <router-link to="/register">注册账号</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        account: '',
        password: ''
      }
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('/api/auth/login', {
          account: this.form.account,
          password: this.form.password
        });

        if (response.data.token) {
          // 保存 token 和用户信息
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userRole', response.data.user.role);
          localStorage.setItem('userName', response.data.user.name);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          // 根据用户角色跳转到不同页面
          const roleRoutes = {
            'admin': '/admin',
            'doctor': '/doctor',
            'registrar': '/registrar',
            'cashier': '/cashier',
            'pharmacy': '/pharmacy'
          };

          const targetRoute = roleRoutes[response.data.user.role] || '/';
          await this.$router.push(targetRoute);
        }
      } catch (error) {
        console.error('登录失败:', error);
        alert(error.response?.data?.message || '登录失败，请检查账号密码');
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #45a049;
}

.links {
  text-align: center;
  margin-top: 1rem;
}

.links a {
  color: #4CAF50;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style> 