<template>
  <div class="cashier-page">
    <page-header title="收费工作站" />
    
    <div class="main-content">
      <h3>待缴费患者列表</h3>
      <table>
        <thead>
          <tr>
            <th>挂号时间</th>
            <th>患者姓名</th>
            <th>科室</th>
            <th>医生</th>
            <th>诊断结果</th>
            <th>金额</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in pendingPatients" :key="patient.RegistrationID">
            <td>{{ formatDate(patient.RegistrationTime) }}</td>
            <td>{{ patient.PatientName }}</td>
            <td>{{ patient.Department }}</td>
            <td>{{ patient.DoctorName }}</td>
            <td>{{ patient.Diagnosis }}</td>
            <td>¥{{ patient.TotalAmount.toFixed(2) }}</td>
            <td>
              <button @click="showPaymentModal(patient)">收费</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 收费弹窗 -->
    <div v-if="showPaymentDialog" class="modal">
      <div class="modal-content">
        <h3>收费详情</h3>
        <div class="patient-info">
          <p>患者姓名：{{ selectedPatient?.PatientName }}</p>
          <p>科室：{{ selectedPatient?.Department }}</p>
          <p>医生：{{ selectedPatient?.DoctorName }}</p>
        </div>

        <div class="prescription-details" v-if="prescriptionDetails.length">
          <h4>处方明细</h4>
          <table>
            <thead>
              <tr>
                <th>药品名称</th>
                <th>规格</th>
                <th>单价</th>
                <th>数量</th>
                <th>用法</th>
                <th>频次</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in prescriptionDetails" :key="item.PrescriptionDrugID">
                <td>{{ item.DrugName }}</td>
                <td>{{ item.Specification }}</td>
                <td>¥{{ item.Price.toFixed(2) }}</td>
                <td>{{ item.Quantity }}</td>
                <td>{{ item.Usage }}</td>
                <td>{{ item.Frequency }}</td>
                <td>¥{{ item.SubTotal.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="payment-form">
          <div class="total-amount">
            总金额：<span class="amount">¥{{ selectedPatient?.TotalAmount.toFixed(2) }}</span>
          </div>
          
          <div class="form-group">
            <label>支付方式</label>
            <select v-model="paymentMethod" required>
              <option value="cash">现金</option>
              <option value="card">银行卡</option>
              <option value="wechat">微信支付</option>
              <option value="alipay">支付宝</option>
            </select>
          </div>

          <div class="modal-buttons">
            <button @click="handlePayment">确认收费</button>
            <button @click="showPaymentDialog = false">取消</button>
          </div>
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
      pendingPatients: [],
      selectedPatient: null,
      showPaymentDialog: false,
      prescriptionDetails: [],
      paymentMethod: 'cash'
    };
  },
  async created() {
    await this.loadPendingPatients();
  },
  methods: {
    async loadPendingPatients() {
      try {
        console.log('正在获取待缴费患者列表...');
        const response = await axios.get('/api/cashier/payments/pending');
        console.log('获取到的数据:', response.data);
        this.pendingPatients = response.data.patients || [];
      } catch (error) {
        console.error('获取待缴费患者列表失败:', error);
        if (error.response?.status === 401) {
          this.$router.push('/login');
        } else {
          alert('获取待缴费患者列表失败，请刷新页面重试');
        }
      }
    },
    async showPaymentModal(patient) {
      this.selectedPatient = patient;
      this.showPaymentDialog = true;
      this.paymentMethod = 'cash';
      
      try {
        const response = await axios.get(`/api/cashier/prescriptions/${patient.PrescriptionID}`);
        this.prescriptionDetails = response.data.prescription;
      } catch (error) {
        console.error('获取处方详情失败:', error);
      }
    },
    async handlePayment() {
      try {
        await axios.post('/api/cashier/payments', {
          registrationId: this.selectedPatient.RegistrationID,
          amount: this.selectedPatient.TotalAmount,
          paymentMethod: this.paymentMethod
        });
        
        this.showPaymentDialog = false;
        await this.loadPendingPatients();
        alert('收费成功');
      } catch (error) {
        console.error('收费失败:', error);
        alert(error.response?.data?.message || '收费失败');
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
};
</script>

<style scoped>
.cashier-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
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

.prescription-details {
  margin: 1rem 0;
}

.payment-form {
  margin-top: 2rem;
}

.total-amount {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.amount {
  color: #e53935;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
  