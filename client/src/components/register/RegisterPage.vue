<template>
  <div class="register-page">
    <div class="register-box">
      <h2>注册账号</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>姓名</label>
          <input v-model="form.name" type="text" required>
        </div>
        <div class="form-group">
          <label>性别</label>
          <select v-model="form.gender" required>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div class="form-group">
          <label>职称</label>
          <input v-model="form.title" type="text" required>
        </div>
        <div class="form-group">
          <label>科室</label>
          <input v-model="form.department" type="text" required>
        </div>
        <div class="form-group">
          <label>账号</label>
          <input v-model="form.account" type="text" required>
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" required>
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input v-model="form.confirmPassword" type="password" required>
        </div>
        <div class="buttons">
          <button type="submit">注册</button>
          <router-link to="/login" class="back-btn">返回登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'RegisterPage',
  data() {
    return {
      form: {
        name: '',
        gender: '男',
        title: '',
        department: '',
        account: '',
        password: '',
        confirmPassword: '',
        role: 'admin'
      }
    };
  },
  methods: {
    async handleRegister() {
      try {
        // 验证密码
        if (this.form.password !== this.form.confirmPassword) {
          alert('两次输入的密码不一致');
          return;
        }

        const response = await axios.post('/api/auth/register', {
          Name: this.form.name,
          Gender: this.form.gender,
          Title: this.form.title,
          Department: this.form.department,
          Account: this.form.account,
          Password: this.form.password,
          Role: this.form.role
        });

        if (response.data.message === '注册成功') {
          alert('注册成功，请登录');
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('注册失败:', error);
        alert(error.response?.data?.message || '注册失败');
      }
    }
  }
};
</script>

<style scoped>
.register-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.register-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
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

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

button, .back-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-align: center;
  text-decoration: none;
}

button {
  background-color: #4CAF50;
  color: white;
}

button:hover {
  background-color: #45a049;
}

.back-btn {
  background-color: #f5f5f5;
  color: #666;
}

.back-btn:hover {
  background-color: #e0e0e0;
}
</style> 