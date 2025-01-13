<template>
  <header class="page-header">
    <h1>{{ title }}</h1>
    <div class="user-menu">
      <span class="user-name" @click="toggleDropdown">
        {{ userName }}
        <i class="arrow-down"></i>
      </span>
      <div v-if="showDropdown" class="dropdown-menu">
        <button @click="showProfileModal = true">个人资料</button>
        <button @click="handleLogout">退出登录</button>
      </div>
    </div>

    <!-- 个人资料弹窗 -->
    <div v-if="showProfileModal" class="modal">
      <div class="modal-content">
        <h2>个人资料</h2>
        <form @submit.prevent="handleUpdateProfile">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="profile.name" type="text" :readonly="!isAdmin">
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="profile.gender" :disabled="!isAdmin">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="form-group">
            <label>职称</label>
            <input v-model="profile.title" type="text" :readonly="!isAdmin">
          </div>
          <div class="form-group">
            <label>科室</label>
            <input v-model="profile.department" type="text" :readonly="!isAdmin">
          </div>
          <div class="form-group">
            <label>账号</label>
            <input v-model="profile.account" type="text" readonly>
          </div>
          <div class="form-group">
            <label>角色</label>
            <input :value="getRoleName(profile.role)" type="text" readonly>
          </div>
          <template v-if="isAdmin">
            <div class="form-group">
              <label>新密码</label>
              <input v-model="profile.newPassword" type="password" placeholder="不修改请留空">
            </div>
            <div class="form-group">
              <label>确认新密码</label>
              <input v-model="profile.confirmPassword" type="password" placeholder="不修改请留空">
            </div>
          </template>
          <div class="modal-buttons">
            <button type="submit" v-if="isAdmin">保存</button>
            <button type="button" @click="showProfileModal = false">
              {{ isAdmin ? '取消' : '关闭' }}
            </button>
            <button 
              v-if="isAdmin" 
              type="button" 
              class="delete-btn" 
              @click="handleDeleteAccount"
            >
              注销账户
            </button>
          </div>
        </form>
      </div>
    </div>
  </header>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showDropdown: false,
      showProfileModal: false,
      userName: localStorage.getItem('userName') || '用户',
      profile: {
        name: '',
        gender: '',
        title: '',
        department: '',
        account: '',
        role: '',
        newPassword: '',
        confirmPassword: ''
      }
    };
  },
  created() {
    this.loadProfile();
  },
  computed: {
    isAdmin() {
      return localStorage.getItem('userRole') === 'admin';
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    async handleLogout() {
      if (this.isAdmin || confirm('确定要退出登录吗？')) {
        try {
          await axios.post('/api/auth/logout');
        } catch (error) {
          console.error('登出失败:', error);
        } finally {
          localStorage.clear();
          this.$router.push('/login');
        }
      }
    },
    async loadProfile() {
      try {
        const response = await axios.get('/api/auth/me');
        this.profile = {
          name: response.data.user.name,
          gender: response.data.user.gender,
          title: response.data.user.title,
          department: response.data.user.department,
          account: response.data.user.account,
          role: response.data.user.role
        };
      } catch (error) {
        console.error('获取个人资料失败:', error);
      }
    },
    async handleUpdateProfile() {
      try {
        if (this.profile.newPassword) {
          if (this.profile.newPassword !== this.profile.confirmPassword) {
            alert('两次输入的密码不一致');
            return;
          }
        }

        const updateData = {
          name: this.profile.name,
          gender: this.profile.gender,
          title: this.profile.title,
          department: this.profile.department
        };

        if (this.profile.newPassword) {
          updateData.password = this.profile.newPassword;
        }

        await axios.put('/api/auth/profile', updateData);
        
        localStorage.setItem('userName', this.profile.name);
        this.userName = this.profile.name;
        
        this.profile.newPassword = '';
        this.profile.confirmPassword = '';
        
        this.showProfileModal = false;
        alert('个人资料更新成功');
      } catch (error) {
        console.error('更新个人资料失败:', error);
        alert(error.response?.data?.message || '更新个人资料失败');
      }
    },
    async handleDeleteAccount() {
      if (!confirm('确定要注销账户吗？此操作不可恢复！')) {
        return;
      }

      const confirmInput = prompt('请输入您的账号以确认注销操作');
      if (confirmInput !== this.profile.account) {
        alert('账号输入错误，操作取消');
        return;
      }

      try {
        await axios.delete('/api/auth/account');
        localStorage.clear();
        this.$router.push('/login');
        alert('账户已注销');
      } catch (error) {
        console.error('注销账户失败:', error);
        alert(error.response?.data?.message || '注销账户失败');
      }
    },
    getRoleName(role) {
      const roleNames = {
        'admin': '管理员',
        'doctor': '医生',
        'registrar': '挂号员',
        'cashier': '收费员',
        'pharmacy': '药房管理员'
      };
      return roleNames[role] || role;
    }
  }
};
</script>

<style scoped>
.page-header {
  background-color: #4CAF50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.user-menu {
  position: relative;
}

.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.arrow-down {
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  margin-top: 0.5rem;
  z-index: 1000;
}

.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  color: #333;
}

.dropdown-menu button:hover {
  background-color: #f5f5f5;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 4px;
  width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input[readonly] {
  background-color: #f5f5f5;
}

.modal-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-buttons button[type="submit"] {
  background-color: #4CAF50;
  color: white;
}

.modal-buttons button[type="button"] {
  background-color: #f5f5f5;
  color: #666;
}

.delete-btn {
  background-color: #dc3545 !important;
  color: white !important;
}

.delete-btn:hover {
  background-color: #c82333 !important;
}

.form-group input[type="password"] {
  font-family: monospace;
}
</style> 