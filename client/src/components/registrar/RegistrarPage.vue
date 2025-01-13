<template>
  <div class="registrar-page">
    <page-header title="挂号工作站" />
    
    <div class="main-content">
      <div class="search-section">
        <input v-model="idCardSearch" placeholder="输入身份证号查询患者" @input="searchPatient">
        <button @click="showAddPatientModal = true">添加新患者</button>
      </div>

      <!-- 患者信息展示 -->
      <div v-if="currentPatient" class="patient-info">
        <h3>患者信息</h3>
        <p>姓名：{{ currentPatient.Name }}</p>
        <p>性别：{{ currentPatient.Gender }}</p>
        <p>年龄：{{ currentPatient.Age }}</p>
        <p>身份证：{{ currentPatient.IdCard }}</p>
        <button @click="showRegistrationModal = true">创建挂号</button>
      </div>

      <!-- 挂号记录列表 -->
      <div class="registration-list">
        <h3>挂号记录</h3>
        <table>
          <thead>
            <tr>
              <th>挂号时间</th>
              <th>科室</th>
              <th>医生</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reg in registrations" :key="reg.RegistrationID">
              <td>{{ formatDate(reg.RegistrationTime) }}</td>
              <td>{{ reg.Department }}</td>
              <td>{{ reg.DoctorName }}</td>
              <td>{{ getStatusText(reg.Status) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加患者弹窗 -->
    <div v-if="showAddPatientModal" class="modal">
      <div class="modal-content">
        <h3>添加新患者</h3>
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
            <input v-model="patientForm.age" type="number" required>
          </div>
          <div class="form-group">
            <label>身份证号</label>
            <input v-model="patientForm.idCard" required>
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input v-model="patientForm.contactInfo" required>
          </div>
          <div class="modal-buttons">
            <button type="submit">确定</button>
            <button type="button" @click="showAddPatientModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 创建挂号弹窗 -->
    <div v-if="showRegistrationModal" class="modal">
      <div class="modal-content">
        <h3>创建挂号</h3>
        <form @submit.prevent="handleRegistration">
          <div class="form-group">
            <label>科室</label>
            <select v-model="selectedDepartment" required>
              <option value="">请选择科室</option>
              <option v-for="dept in departments" :key="dept" :value="dept">
                {{ dept }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>医生</label>
            <select 
              v-model="registrationForm.doctorId" 
              required
              :disabled="!selectedDepartment"
            >
              <option value="">请选择医生</option>
              <option 
                v-for="doctor in availableDoctors" 
                :key="doctor.DoctorID" 
                :value="doctor.DoctorID"
              >
                {{ doctor.Name }} ({{ doctor.Title }})
              </option>
            </select>
          </div>
          <div class="modal-buttons">
            <button type="submit">确定</button>
            <button type="button" @click="showRegistrationModal = false">取消</button>
          </div>
        </form>
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
      departments: [],
      doctorsByDepartment: {},
      idCardSearch: '',
      currentPatient: null,
      registrations: [],
      showAddPatientModal: false,
      showRegistrationModal: false,
      patientForm: {
        name: '',
        gender: '男',
        age: '',
        idCard: '',
        contactInfo: ''
      },
      registrationForm: {
        doctorId: ''
      },
      selectedDepartment: '',
      availableDoctors: []
    };
  },
  async created() {
    await this.loadDepartmentsAndDoctors();
  },
  methods: {
    async loadDepartmentsAndDoctors() {
      try {
        const deptResponse = await axios.get('/api/registrar/departments');
        this.departments = deptResponse.data.departments;

        for (const dept of this.departments) {
          const doctorResponse = await axios.get(`/api/registrar/doctors?department=${dept}`);
          this.doctorsByDepartment[dept] = doctorResponse.data.doctors;
        }
      } catch (error) {
        console.error('获取科室和医生数据失败:', error);
        alert('获取科室和医生数据失败');
      }
    },
    handleDepartmentChange() {
      this.registrationForm.doctorId = '';
      if (this.selectedDepartment) {
        this.availableDoctors = this.doctorsByDepartment[this.selectedDepartment] || [];
      } else {
        this.availableDoctors = [];
      }
    },
    async searchPatient() {
      if (!this.idCardSearch) return;
      try {
        const response = await axios.get(`/api/registrar/patients/${this.idCardSearch}`);
        this.currentPatient = response.data.patient;
        if (this.currentPatient) {
          await this.loadRegistrations(this.currentPatient.PatientID);
        }
      } catch (error) {
        console.error('查询患者失败:', error);
      }
    },
    async loadRegistrations(patientId) {
      try {
        const response = await axios.get(`/api/registrar/registrations/${patientId}`);
        this.registrations = response.data.registrations;
      } catch (error) {
        console.error('获取挂号记录失败:', error);
      }
    },
    async handleAddPatient() {
      try {
        if (!this.patientForm.name || !this.patientForm.gender || 
            !this.patientForm.age || !this.patientForm.idCard) {
          alert('请填写所有必要信息');
          return;
        }

        const data = {
          Name: this.patientForm.name,
          Gender: this.patientForm.gender,
          Age: parseInt(this.patientForm.age),
          IdCard: this.patientForm.idCard,
          ContactInfo: this.patientForm.contactInfo
        };

        console.log('发送的数据:', data);

        const response = await axios.post('/api/registrar/patients', data);

        console.log('服务器响应:', response.data);

        this.showAddPatientModal = false;
        this.resetPatientForm();
        alert('添加患者成功');

        // 如果添加成功，立即查询该患者
        this.idCardSearch = response.data.patient.IdCard;
        await this.searchPatient();
      } catch (error) {
        console.error('添加患者失败:', error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            '添加患者失败';
        alert(errorMessage);
      }
    },
    async handleRegistration() {
      try {
        if (!this.selectedDepartment || !this.registrationForm.doctorId) {
          alert('请选择科室和医生');
          return;
        }

        await axios.post('/api/registrar/registrations', {
          patientId: this.currentPatient.PatientID,
          doctorId: this.registrationForm.doctorId,
          department: this.selectedDepartment
        });
        
        alert('创建挂号成功');
        this.showRegistrationModal = false;
        await this.loadRegistrations(this.currentPatient.PatientID);
        this.resetRegistrationForm();
      } catch (error) {
        console.error('创建挂号失败:', error);
        alert(error.response?.data?.message || '创建挂号失败');
      }
    },
    resetPatientForm() {
      this.patientForm = {
        name: '',
        gender: '男',
        age: '',
        idCard: '',
        contactInfo: ''
      };
    },
    resetRegistrationForm() {
      this.selectedDepartment = '';
      this.registrationForm.doctorId = '';
      this.availableDoctors = [];
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    getStatusText(status) {
      const statusMap = {
        'registered': '已挂号',
        'diagnosed': '已诊断',
        'paid': '已缴费',
        'completed': '已取药'
      };
      return statusMap[status] || status;
    }
  },
  watch: {
    selectedDepartment: {
      handler() {
        this.handleDepartmentChange();
      }
    }
  }
};
</script>

<style scoped>
.registrar-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #4CAF50;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.search-section {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
}

.search-section input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.patient-info {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.patient-info h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.patient-info p {
  margin: 0.5rem 0;
}

.registration-list {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
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
</style>
  