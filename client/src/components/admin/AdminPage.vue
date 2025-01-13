<template>
  <div class="admin-page">
    <page-header title="管理员控制台" />
    
    <div class="main-content">
      <div class="tabs">
        <button 
          :class="{ active: currentTab === 'users' }"
          @click="currentTab = 'users'"
        >
          用户管理
        </button>
        <button 
          :class="{ active: currentTab === 'patients' }"
          @click="currentTab = 'patients'"
        >
          患者管理
        </button>
        <button 
          :class="{ active: currentTab === 'drugs' }"
          @click="currentTab = 'drugs'"
        >
          药品管理
        </button>
      </div>

      <!-- 用户管理 -->
      <div v-if="currentTab === 'users'" class="users-list">
        <div class="action-bar">
          <button @click="showAddUserModal = true">添加用户</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>性别</th>
              <th>职称</th>
              <th>科室</th>
              <th>账号</th>
              <th>角色</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.DoctorID">
              <td>{{ user.Name }}</td>
              <td>{{ user.Gender }}</td>
              <td>{{ user.Title }}</td>
              <td>{{ user.Department }}</td>
              <td>{{ user.Account }}</td>
              <td>{{ getRoleName(user.Role) }}</td>
              <td>
                <template v-if="user.Role !== 'admin'">
                  <button @click="handleEditUser(user)">编辑</button>
                  <button @click="handleDeleteUser(user.DoctorID)">删除</button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 患者管理页面 -->
      <div v-if="currentTab === 'patients'" class="patients-list">
        <div class="action-bar">
          <button @click="showAddPatientModal = true">添加患者</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>性别</th>
              <th>年龄</th>
              <th>身份证号</th>
              <th>联系方式</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in patients" :key="patient.PatientID">
              <td>{{ patient.Name }}</td>
              <td>{{ patient.Gender }}</td>
              <td>{{ patient.Age }}</td>
              <td>{{ patient.IdCard }}</td>
              <td>{{ patient.ContactInfo }}</td>
              <td>
                <button @click="handleEditPatient(patient)">编辑</button>
                <button @click="handleDeletePatient(patient.PatientID)" class="delete-btn">删除</button>
                <button @click="showMedicalHistory(patient)" class="history-btn">查看病历</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 药品管理 -->
      <div v-if="currentTab === 'drugs'" class="drugs-list">
        <div class="action-bar">
          <div class="action-buttons">
            <button @click="loadDrugs" class="refresh-btn">刷新数据</button>
            <button @click="showAddDrugModal = true">添加药品</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>药品名称</th>
              <th>规格</th>
              <th>剂型</th>
              <th>价格</th>
              <th>库存</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="drug in drugs" :key="drug.DrugID">
              <td>{{ drug.DrugName }}</td>
              <td>{{ drug.Specification }}</td>
              <td>{{ drug.DosageForm }}</td>
              <td>¥{{ drug.Price }}</td>
              <td>{{ drug.StockQuantity }}</td>
              <td>
                <button @click="handleEditDrug(drug)">编辑</button>
                <button @click="handleDeleteDrug(drug.DrugID)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加用户弹窗 -->
    <div v-if="showAddUserModal" class="modal">
      <div class="modal-content">
        <h3>添加用户</h3>
        <form @submit.prevent="handleAddUser">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="userForm.name" required>
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="userForm.gender" required>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="form-group">
            <label>职称</label>
            <input v-model="userForm.title" required>
          </div>
          <div class="form-group">
            <label>科室</label>
            <input v-model="userForm.department" required>
          </div>
          <div class="form-group">
            <label>账号</label>
            <input v-model="userForm.account" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="userForm.password" type="password" required>
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="userForm.role" required>
              <option value="doctor">医生</option>
              <option value="registrar">挂号员</option>
              <option value="cashier">收费员</option>
              <option value="pharmacy">药房管理员</option>
            </select>
          </div>
          <div class="modal-buttons">
            <button type="submit">确定</button>
            <button type="button" @click="showAddUserModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑用户弹窗 -->
    <div v-if="showEditUserModal" class="modal">
      <div class="modal-content">
        <h3>编辑用户</h3>
        <form @submit.prevent="submitEditUser">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="editUserForm.name" required>
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="editUserForm.gender" required>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="form-group">
            <label>职称</label>
            <input v-model="editUserForm.title" required>
          </div>
          <div class="form-group">
            <label>科室</label>
            <input v-model="editUserForm.department" required>
          </div>
          <div class="form-group">
            <label>账号</label>
            <input v-model="editUserForm.account" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="editUserForm.password" type="password" placeholder="不修改请留空">
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="editUserForm.role" required>
              <option value="doctor">医生</option>
              <option value="registrar">挂号员</option>
              <option value="cashier">收费员</option>
              <option value="pharmacy">药房管理员</option>
            </select>
          </div>
          <div class="modal-buttons">
            <button type="submit">确定</button>
            <button type="button" @click="showEditUserModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加药品弹窗 -->
    <div v-if="showAddDrugModal" class="modal">
      <div class="modal-content">
        <h3>添加药品</h3>
        <form @submit.prevent="handleAddDrug">
          <div class="form-group">
            <label>药品名称</label>
            <input v-model="drugForm.name" required>
          </div>
          <div class="form-group">
            <label>规格</label>
            <input v-model="drugForm.specification" required>
          </div>
          <div class="form-group">
            <label>剂型</label>
            <input v-model="drugForm.dosageForm" required>
          </div>
          <div class="form-group">
            <label>价格</label>
            <input v-model.number="drugForm.price" type="number" step="0.01" required>
          </div>
          <div class="form-group">
            <label>库存数量</label>
            <input v-model.number="drugForm.stockQuantity" type="number" required>
          </div>
          <div class="modal-buttons">
            <button type="submit">确定</button>
            <button type="button" @click="showAddDrugModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑药品弹窗 -->
    <div v-if="showEditDrugModal" class="modal">
      <div class="modal-content">
        <h3>编辑药品</h3>
        <form @submit.prevent="submitEditDrug">
          <div class="form-group">
            <label>药品名称</label>
            <input v-model="editDrugForm.name" required>
          </div>
          <div class="form-group">
            <label>规格</label>
            <input v-model="editDrugForm.specification" required>
          </div>
          <div class="form-group">
            <label>剂型</label>
            <input v-model="editDrugForm.dosageForm" required>
          </div>
          <div class="form-group">
            <label>价格</label>
            <input v-model.number="editDrugForm.price" type="number" step="0.01" required>
          </div>
          <div class="form-group">
            <label>库存数量</label>
            <input v-model.number="editDrugForm.stockQuantity" type="number" required>
          </div>
          <div class="modal-buttons">
            <button type="submit">确定</button>
            <button type="button" @click="showEditDrugModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加患者弹窗 -->
    <div v-if="showAddPatientModal" class="modal">
      <div class="modal-content">
        <h3>添加患者</h3>
        <form @submit.prevent="handleAddPatient">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="patientForm.name" required>
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="patientForm.gender" required>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="form-group">
            <label>年龄</label>
            <input type="number" v-model="patientForm.age" required>
          </div>
          <div class="form-group">
            <label>身份证号</label>
            <input v-model="patientForm.idCard" required>
          </div>
          <div class="form-group">
            <label>联系方式</label>
            <input v-model="patientForm.contactInfo" required>
          </div>
          <div class="modal-buttons">
            <button type="submit">确认</button>
            <button type="button" @click="showAddPatientModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑患者弹窗 -->
    <div v-if="showEditPatientModal" class="modal">
      <div class="modal-content">
        <h3>编辑患者信息</h3>
        <form @submit.prevent="handleUpdatePatient">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="editPatientForm.name" required>
          </div>
          <div class="form-group">
            <label>性别</label>
            <select v-model="editPatientForm.gender" required>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="form-group">
            <label>年龄</label>
            <input type="number" v-model="editPatientForm.age" required>
          </div>
          <div class="form-group">
            <label>身份证号</label>
            <input v-model="editPatientForm.idCard" required>
          </div>
          <div class="form-group">
            <label>联系方式</label>
            <input v-model="editPatientForm.contactInfo" required>
          </div>
          <div class="modal-buttons">
            <button type="submit">保存</button>
            <button type="button" @click="showEditPatientModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加病历查看弹窗 -->
    <div v-if="showMedicalHistoryModal" class="modal">
      <div class="modal-content">
        <h3>{{ selectedPatient?.Name }} 的就诊历史</h3>
        <div class="medical-history">
          <div v-for="record in medicalHistory" :key="record.RegistrationID" class="history-item">
            <div class="history-header">
              <span>就诊时间：{{ formatDate(record.RegistrationTime) }}</span>
              <span>科室：{{ record.Department }}</span>
              <span>医生：{{ record.DoctorName }}</span>
            </div>
            <div class="diagnosis">
              <strong>诊断：</strong>
              <p>{{ record.Diagnosis }}</p>
            </div>
            <div class="prescription">
              <strong>处方：</strong>
              <ul>
                <li v-for="drug in record.Drugs" :key="drug.PrescriptionDrugID">
                  {{ drug.DrugName }} - {{ drug.Quantity }}份
                  <div class="usage">
                    用法：{{ drug.Usage }}
                    频次：{{ drug.Frequency }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-buttons">
          <button @click="showMedicalHistoryModal = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';
import PageHeader from '../common/PageHeader.vue';

export default {
  components: {
    PageHeader
  },
  data() {
    return {
      currentTab: 'users',
      users: [],
      drugs: [],
      showAddUserModal: false,
      showEditUserModal: false,
      showAddDrugModal: false,
      showEditDrugModal: false,
      userForm: {
        name: '',
        gender: '男',
        title: '',
        department: '',
        account: '',
        password: '',
        role: 'doctor'
      },
      editUserForm: {
        id: null,
        name: '',
        gender: '',
        title: '',
        department: '',
        account: '',
        password: '',
        role: ''
      },
      drugForm: {
        name: '',
        specification: '',
        dosageForm: '',
        price: '',
        stockQuantity: 0
      },
      editDrugForm: {
        id: null,
        name: '',
        specification: '',
        dosageForm: '',
        price: '',
        stockQuantity: 0
      },
      patients: [],
      showAddPatientModal: false,
      showEditPatientModal: false,
      patientForm: {
        name: '',
        gender: '男',
        age: '',
        idCard: '',
        contactInfo: ''
      },
      editPatientForm: {
        id: null,
        name: '',
        gender: '',
        age: '',
        idCard: '',
        contactInfo: ''
      },
      showMedicalHistoryModal: false,
      selectedPatient: null,
      medicalHistory: [],
      loading: false
    };
  },
  async created() {
    try {
      await this.loadData();
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  },
  methods: {
    async loadData() {
      if (this.currentTab === 'users') {
        await this.loadUsers();
      } else if (this.currentTab === 'drugs') {
        await this.loadDrugs();
      } else if (this.currentTab === 'patients') {
        await this.loadPatients();
      }
    },
    async loadUsers() {
      try {
        const response = await axios.get('/api/admin/users');
        this.users = response.data.users;
      } catch (error) {
        console.error('获取用户列表失败:', error);
        if (error.response?.status === 401) {
          this.$router.push('/login');
        }
      }
    },
    async loadDrugs() {
      try {
        this.loading = true;
        const response = await axios.get('/api/admin/drugs');
        this.drugs = response.data.drugs;
      } catch (error) {
        console.error('获取药品列表失败:', error);
        alert('获取药品列表失败');
      } finally {
        this.loading = false;
      }
    },
    async loadPatients() {
      try {
        const response = await axios.get('/api/admin/patients');
        this.patients = response.data.patients;
      } catch (error) {
        console.error('获取患者列表失败:', error);
        alert('获取患者列表失败');
      }
    },
    // 添加用户
    async handleAddUser() {
      try {
        await axios.post('/api/admin/users', {
          Name: this.userForm.name,
          Gender: this.userForm.gender,
          Title: this.userForm.title,
          Department: this.userForm.department,
          Account: this.userForm.account,
          Password: this.userForm.password,
          Role: this.userForm.role
        });
        
        this.showAddUserModal = false;
        this.loadUsers();
        alert('添加用户成功');
      } catch (error) {
        console.error('添加用户失败:', error);
        alert(error.response?.data?.message || '添加用户失败');
      }
    },
    
    // 编辑用户
    handleEditUser(user) {
      this.editUserForm = {
        id: user.DoctorID,
        name: user.Name,
        gender: user.Gender,
        title: user.Title,
        department: user.Department,
        account: user.Account,
        password: '',
        role: user.Role
      };
      this.showEditUserModal = true;
    },
    
    // 提交编辑用户
    async submitEditUser() {
      try {
        await axios.put(`/api/admin/users/${this.editUserForm.id}`, {
          Name: this.editUserForm.name,
          Gender: this.editUserForm.gender,
          Title: this.editUserForm.title,
          Department: this.editUserForm.department,
          Account: this.editUserForm.account,
          Password: this.editUserForm.password || undefined,
          Role: this.editUserForm.role
        });
        
        this.showEditUserModal = false;
        this.loadUsers();
        alert('修改用户成功');
      } catch (error) {
        console.error('修改用户失败:', error);
        alert(error.response?.data?.message || '修改用户失败');
      }
    },
    
    // 删除用户
    async handleDeleteUser(id) {
      if (!confirm('确定要删除该用户吗？')) return;
      
      try {
        await axios.delete(`/api/admin/users/${id}`);
        this.loadUsers();
        alert('删除用户成功');
      } catch (error) {
        console.error('删除用户失败:', error);
        alert(error.response?.data?.message || '删除用户失败');
      }
    },
    
    // 添加药品
    async handleAddDrug() {
      try {
        await axios.post('/api/admin/drugs', {
          DrugName: this.drugForm.name,
          Specification: this.drugForm.specification,
          DosageForm: this.drugForm.dosageForm,
          Price: this.drugForm.price,
          StockQuantity: this.drugForm.stockQuantity
        });
        
        this.showAddDrugModal = false;
        this.loadDrugs();
        alert('添加药品成功');
      } catch (error) {
        console.error('添加药品失败:', error);
        alert(error.response?.data?.message || '添加药品失败');
      }
    },
    
    // 编辑药品
    handleEditDrug(drug) {
      this.editDrugForm = {
        id: drug.DrugID,
        name: drug.DrugName,
        specification: drug.Specification,
        dosageForm: drug.DosageForm,
        price: drug.Price,
        stockQuantity: drug.StockQuantity
      };
      this.showEditDrugModal = true;
    },
    
    // 提交编辑药品
    async submitEditDrug() {
      try {
        await axios.put(`/api/admin/drugs/${this.editDrugForm.id}`, {
          DrugName: this.editDrugForm.name,
          Specification: this.editDrugForm.specification,
          DosageForm: this.editDrugForm.dosageForm,
          Price: this.editDrugForm.price,
          StockQuantity: this.editDrugForm.stockQuantity
        });
        
        this.showEditDrugModal = false;
        this.loadDrugs();
        alert('修改药品成功');
      } catch (error) {
        console.error('修改药品失败:', error);
        alert(error.response?.data?.message || '修改药品失败');
      }
    },
    
    // 删除药品
    async handleDeleteDrug(id) {
      if (!confirm('确定要删除该药品吗？')) return;
      
      try {
        await axios.delete(`/api/admin/drugs/${id}`);
        this.loadDrugs();
        alert('删除药品成功');
      } catch (error) {
        console.error('删除药品失败:', error);
        alert(error.response?.data?.message || '删除药品失败');
      }
    },
    
    // 获取角色名称
    getRoleName(role) {
      const roleNames = {
        'admin': '管理员',
        'doctor': '医生',
        'registrar': '挂号员',
        'cashier': '收费员',
        'pharmacy': '药房管理员'
      };
      return roleNames[role] || role;
    },
    
    // 添加患者
    async handleAddPatient() {
      try {
        await axios.post('/api/admin/patients', {
          Name: this.patientForm.name,
          Gender: this.patientForm.gender,
          Age: parseInt(this.patientForm.age),
          IdCard: this.patientForm.idCard,
          ContactInfo: this.patientForm.contactInfo
        });
        
        await this.loadPatients();
        this.showAddPatientModal = false;
        this.patientForm = {
          name: '',
          gender: '男',
          age: '',
          idCard: '',
          contactInfo: ''
        };
        alert('添加患者成功');
      } catch (error) {
        console.error('添加患者失败:', error);
        alert(error.response?.data?.message || '添加患者失败');
      }
    },
    
    // 编辑患者
    handleEditPatient(patient) {
      this.editPatientForm = {
        id: patient.PatientID,
        name: patient.Name,
        gender: patient.Gender,
        age: patient.Age,
        idCard: patient.IdCard,
        contactInfo: patient.ContactInfo
      };
      this.showEditPatientModal = true;
    },
    
    // 更新患者信息
    async handleUpdatePatient() {
      try {
        await axios.put(`/api/admin/patients/${this.editPatientForm.id}`, {
          Name: this.editPatientForm.name,
          Gender: this.editPatientForm.gender,
          Age: parseInt(this.editPatientForm.age),
          IdCard: this.editPatientForm.idCard,
          ContactInfo: this.editPatientForm.contactInfo
        });
        
        await this.loadPatients();
        this.showEditPatientModal = false;
        alert('更新患者信息成功');
      } catch (error) {
        console.error('更新患者信息失败:', error);
        alert(error.response?.data?.message || '更新患者信息失败');
      }
    },
    
    // 删除患者
    async handleDeletePatient(patientId) {
      if (!confirm('确定要删除该患者吗？此操作不可恢复！')) {
        return;
      }
      
      try {
        await axios.delete(`/api/admin/patients/${patientId}`);
        await this.loadPatients();
        alert('删除患者成功');
      } catch (error) {
        console.error('删除患者失败:', error);
        alert(error.response?.data?.message || '删除患者失败');
      }
    },

    async showMedicalHistory(patient) {
      this.selectedPatient = patient;
      try {
        const response = await axios.get(`/api/admin/patients/${patient.PatientID}/history`);
        if (response.data.history) {
          this.medicalHistory = response.data.history;
          this.showMedicalHistoryModal = true;
        } else {
          throw new Error('未获取到就诊历史数据');
        }
      } catch (error) {
        console.error('获取就诊历史失败:', error);
        alert(error.response?.data?.message || '获取就诊历史失败');
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  },
  watch: {
    currentTab: {
      handler(newTab) {
        if (newTab === 'drugs') {
          this.loadDrugs();
        } else if (newTab === 'patients') {
          this.loadPatients();
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.admin-page {
  padding: 2rem;
}

.tabs {
  margin-bottom: 2rem;
}

.tabs button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
}

.tabs button.active {
  background-color: #4CAF50;
  color: white;
}

.action-bar {
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

button {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
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
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-buttons {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.delete-btn {
  background-color: #dc3545;
  margin-left: 0.5rem;
}

.delete-btn:hover {
  background-color: #c82333;
}

.history-btn {
  background-color: #2196F3;
}

.medical-history {
  max-height: 60vh;
  overflow-y: auto;
}

.history-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
}

.diagnosis {
  margin: 1rem 0;
}

.prescription ul {
  list-style: none;
  padding: 0;
}

.prescription li {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.usage {
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.9em;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.refresh-btn {
  background-color: #2196F3;
}

.refresh-btn:hover {
  background-color: #1976D2;
}

.loading {
  opacity: 0.7;
  pointer-events: none;
}

.table-loading {
  position: relative;
}

.table-loading::after {
  content: '加载中...';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
