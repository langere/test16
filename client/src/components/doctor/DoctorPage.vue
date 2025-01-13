<template>
  <div class="doctor-page">
    <page-header title="医生工作站" />
    
    <div class="main-content">
      <div class="tabs">
        <button 
          :class="{ active: currentTab === 'pending' }"
          @click="currentTab = 'pending'"
        >
          待诊患者
        </button>
        
      </div>

      <!-- 待诊患者列表 -->
      <div v-if="currentTab === 'pending'" class="patient-list">
        <table>
          <thead>
            <tr>
              <th>挂号时间</th>
              <th>患者姓名</th>
              <th>性别</th>
              <th>年龄</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in pendingPatients" :key="patient.RegistrationID">
              <td>{{ formatDate(patient.RegistrationTime) }}</td>
              <td>{{ patient.PatientName }}</td>
              <td>{{ patient.Gender }}</td>
              <td>{{ patient.Age }}</td>
              <td>
                <button @click="startDiagnose(patient)">开始诊断</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>      
    </div>

    <!-- 添加诊断弹窗 -->
    <div v-if="showDiagnoseModal" class="modal">
      <div class="modal-content">
        <h3>诊断处方</h3>
        <div class="patient-info">
          <p>患者姓名：{{ selectedPatient?.PatientName }}</p>
          <p>性别：{{ selectedPatient?.Gender }}</p>
          <p>年龄：{{ selectedPatient?.Age }}</p>
        </div>
        
        <form @submit.prevent="handleSubmitDiagnose">
          <div class="form-group">
            <label>诊断结果</label>
            <textarea 
              v-model="diagnoseForm.diagnosis" 
              rows="3" 
              required
              placeholder="请输入诊断结果"
            ></textarea>
          </div>

          <div class="prescriptions">
            <h4>处方药品</h4>
            <div v-for="(item, index) in diagnoseForm.prescriptions" :key="index" class="prescription-item">
              <select v-model="item.drugId" required>
                <option value="">选择药品</option>
                <option v-for="drug in drugs" :key="drug.DrugID" :value="drug.DrugID">
                  {{ drug.DrugName }} ({{ drug.Specification }})
                </option>
              </select>
              <input 
                type="number" 
                v-model="item.quantity" 
                placeholder="数量" 
                min="1" 
                required
              >
              <input 
                v-model="item.usage" 
                placeholder="用法" 
                required
              >
              <input 
                v-model="item.frequency" 
                placeholder="频次" 
                required
              >
              <button type="button" @click="removePrescription(index)" class="remove-btn">删除</button>
            </div>
            <button type="button" @click="addPrescription" class="add-btn">添加药品</button>
          </div>

          <div class="modal-buttons">
            <button type="submit">确认</button>
            <button type="button" @click="showDiagnoseModal = false">取消</button>
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
      currentTab: 'pending',
      pendingPatients: [],
      selectedPatient: null,
      patientHistory: [],
      showDiagnoseModal: false,
      drugs: [], // 药品列表
      diagnoseForm: {
        diagnosis: '',
        prescriptions: []
      }
    };
  },
  async created() {
    await this.loadPendingPatients();
    await this.loadDrugs();
  },
  watch: {
    currentTab: {
      handler(newTab) {
        if (newTab === 'pending') {
          this.loadPendingPatients();
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadPendingPatients() {
      try {
        console.log('正在获取待诊患者列表...');
        const response = await axios.get('/api/doctor/patients/pending');
        console.log('获取到的数据:', response.data);
        this.pendingPatients = response.data.patients;
      } catch (error) {
        console.error('获取待诊患者列表失败:', error);
        if (error.response?.status === 401) {
          this.$router.push('/login');
        }
      }
    },
    async startDiagnose(patient) {
      this.selectedPatient = patient;
      this.showDiagnoseModal = true;
      this.diagnoseForm = {
        diagnosis: '',
        prescriptions: [{ drugId: '', quantity: 1, usage: '', frequency: '' }]
      };
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    async loadDrugs() {
      try {
        console.log('正在获取药品列表...');
        const response = await axios.get('/api/doctor/drugs');
        console.log('获取到的药品数据:', response.data);
        this.drugs = response.data.drugs;
      } catch (error) {
        console.error('获取药品列表失败:', error);
        alert('获取药品列表失败，请刷新页面重试');
      }
    },
    addPrescription() {
      this.diagnoseForm.prescriptions.push({
        drugId: '',
        quantity: 1,
        usage: '',
        frequency: ''
      });
    },
    removePrescription(index) {
      this.diagnoseForm.prescriptions.splice(index, 1);
    },
    async handleSubmitDiagnose() {
      try {
        await axios.post(`/api/doctor/patients/${this.selectedPatient.RegistrationID}/diagnose`, {
          diagnosis: this.diagnoseForm.diagnosis,
          prescriptions: this.diagnoseForm.prescriptions
        });
        
        this.showDiagnoseModal = false;
        await this.loadPendingPatients();
        alert('诊断完成');
      } catch (error) {
        console.error('提交诊断失败:', error);
        alert(error.response?.data?.message || '提交诊断失败');
      }
    }
  }
};
</script>

<style scoped>
.doctor-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.tabs {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f0f0f0;
}

.tabs button.active {
  background-color: #4CAF50;
  color: white;
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
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 4px;
  width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.patient-info {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.patient-info p {
  margin: 0.5rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.prescriptions {
  margin-top: 1rem;
}

.prescription-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.prescription-item select,
.prescription-item input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.remove-btn {
  background-color: #dc3545;
}

.add-btn {
  margin-top: 1rem;
  background-color: #007bff;
}

.modal-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
  