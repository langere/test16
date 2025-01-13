<template>
  <div class="pharmacy-page">
    <page-header title="药房工作站" />
    
    <div class="main-content">
      <!-- 标签页切换 -->
      <div class="tabs">
        <button 
          :class="{ active: currentTab === 'dispense' }"
          @click="currentTab = 'dispense'"
        >
          处方发药
        </button>
        <button 
          :class="{ active: currentTab === 'inventory' }"
          @click="currentTab = 'inventory'"
        >
          药品管理
        </button>
      </div>

      <!-- 处方发药页面 -->
      <div v-if="currentTab === 'dispense'" class="dispense-section">
        <h3>待发药处方列表</h3>
        <table>
          <thead>
            <tr>
              <th>处方时间</th>
              <th>患者姓名</th>
              <th>科室</th>
              <th>医生</th>
              <th>诊断结果</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prescription in pendingPrescriptions" :key="prescription.PrescriptionID">
              <td>{{ formatDate(prescription.CreateTime) }}</td>
              <td>{{ prescription.PatientName }}</td>
              <td>{{ prescription.Department }}</td>
              <td>{{ prescription.DoctorName }}</td>
              <td>{{ prescription.Diagnosis }}</td>
              <td>
                <button @click="showDispenseModal(prescription)">发药</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 药品管理页面 -->
      <div v-if="currentTab === 'inventory'" class="inventory-section">
        <div class="inventory-header">
          <h3>药品库存管理</h3>
          <div class="header-actions">
            <button @click="loadDrugs" class="refresh-btn">
              刷新数据
            </button>
            <button v-if="isAdmin" @click="showAddDrugModal = true" class="add-btn">
              添加药品
            </button>
          </div>
        </div>
        
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索药品名称..."
            @input="handleSearch"
          >
        </div>

        <table>
          <thead>
            <tr>
              <th>药品名称</th>
              <th>规格</th>
              <th>剂型</th>
              <th>单价(元)</th>
              <th>库存数量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="drug in filteredDrugs" :key="drug.DrugID">
              <td>{{ drug.DrugName }}</td>
              <td>{{ drug.Specification }}</td>
              <td>{{ drug.DosageForm }}</td>
              <td>{{ drug.Price.toFixed(2) }}</td>
              <td>
                <span :class="{ 'low-stock': drug.StockQuantity < 100 }">
                  {{ drug.StockQuantity }}
                </span>
              </td>
              <td>
                <button @click="openUpdateStockModal(drug)" class="update-btn">更新库存</button>
                <button v-if="isAdmin" @click="openEditDrugModal(drug)" class="edit-btn">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 发药弹窗 -->
    <div v-if="showDispenseDialog" class="modal">
      <div class="modal-content">
        <h3>发药详情</h3>
        <div class="patient-info">
          <p>患者姓名：{{ selectedPrescription?.PatientName }}</p>
          <p>科室：{{ selectedPrescription?.Department }}</p>
          <p>医生：{{ selectedPrescription?.DoctorName }}</p>
          <p>诊断：{{ selectedPrescription?.Diagnosis }}</p>
        </div>

        <div class="prescription-details">
          <h4>处方药品</h4>
          <table>
            <thead>
              <tr>
                <th>药品名称</th>
                <th>规格</th>
                <th>数量</th>
                <th>用法</th>
                <th>频次</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="drug in prescriptionDrugs" :key="drug.PrescriptionDrugID">
                <td>{{ drug.DrugName }}</td>
                <td>{{ drug.Specification }}</td>
                <td>{{ drug.Quantity }}</td>
                <td>{{ drug.Usage }}</td>
                <td>{{ drug.Frequency }}</td>
                <td>
                  <span :class="drug.dispensed ? 'status-done' : 'status-pending'">
                    {{ drug.dispensed ? '已发药' : '待发药' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-buttons">
          <button @click="handleDispense" :disabled="allDrugsDispensed">确认发药</button>
          <button @click="showDispenseDialog = false">取消</button>
        </div>
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
            <label>单价(元)</label>
            <input type="number" step="0.01" v-model="drugForm.price" required>
          </div>
          <div class="form-group">
            <label>初始库存</label>
            <input type="number" v-model="drugForm.stockQuantity" required>
          </div>
          <div class="modal-buttons">
            <button type="submit">确认</button>
            <button type="button" @click="showAddDrugModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 更新库存弹窗 -->
    <div v-if="showUpdateStockModal" class="modal">
      <div class="modal-content">
        <h3>更新库存</h3>
        <div class="drug-info">
          <p>药品名称：{{ selectedDrug?.DrugName }}</p>
          <p>当前库存：{{ selectedDrug?.StockQuantity }}</p>
        </div>
        <form @submit.prevent="handleUpdateStock">
          <div class="form-group">
            <label>变更数量（正数为入库，负数为出库）</label>
            <input 
              type="number" 
              v-model="stockChangeAmount" 
              required
              :min="-selectedDrug?.StockQuantity"
            >
          </div>
          <div class="modal-buttons">
            <button type="submit">确认</button>
            <button type="button" @click="showUpdateStockModal = false">取消</button>
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
  name: 'PharmacyPage',
  components: {
    PageHeader
  },
  data() {
    return {
      currentTab: 'dispense',
      pendingPrescriptions: [],
      selectedPrescription: null,
      showDispenseDialog: false,
      prescriptionDrugs: [],
      drugs: [],
      searchQuery: '',
      showAddDrugModal: false,
      showEditDrugModal: false,
      showUpdateStockModal: false,
      selectedDrug: null,
      stockChangeAmount: 0,
      drugForm: {
        name: '',
        specification: '',
        dosageForm: '',
        price: '',
        stockQuantity: ''
      },
      loading: false,
      error: null
    };
  },
  computed: {
    allDrugsDispensed() {
      return this.prescriptionDrugs.every(drug => drug.dispensed);
    },
    filteredDrugs() {
      if (!this.searchQuery) return this.drugs;
      const query = this.searchQuery.toLowerCase();
      return this.drugs.filter(drug => 
        drug.DrugName.toLowerCase().includes(query)
      );
    },
    isAdmin() {
      return localStorage.getItem('userRole') === 'admin';
    }
  },
  async created() {
    await this.loadPendingPrescriptions();
    await this.loadDrugs();
  },
  methods: {
    async loadPendingPrescriptions() {
      try {
        this.loading = true;
        const response = await axios.get('/api/pharmacy/prescriptions/pending');
        this.pendingPrescriptions = response.data.prescriptions;
      } catch (error) {
        console.error('获取待发药处方列表失败:', error);
        this.error = '获取处方列表失败';
      } finally {
        this.loading = false;
      }
    },
    async showDispenseModal(prescription) {
      this.selectedPrescription = prescription;
      this.showDispenseDialog = true;
      
      try {
        const response = await axios.get(`/api/pharmacy/prescriptions/${prescription.PrescriptionID}/drugs`);
        this.prescriptionDrugs = response.data.drugs.map(drug => ({
          ...drug,
          dispensed: false
        }));
      } catch (error) {
        console.error('获取处方药品失败:', error);
        alert('获取处方药品失败');
      }
    },
    async handleDispense() {
      try {
        await axios.post(`/api/pharmacy/prescriptions/${this.selectedPrescription.PrescriptionID}/dispense`);
        
        this.showDispenseDialog = false;
        await this.loadPendingPrescriptions();
        alert('发药成功');
      } catch (error) {
        console.error('发药失败:', error);
        alert(error.response?.data?.message || '发药失败');
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    async loadDrugs() {
      try {
        this.loading = true;
        const response = await axios.get('/api/pharmacy/drugs');
        this.drugs = response.data.drugs;
      } catch (error) {
        console.error('获取药品列表失败:', error);
        this.error = '获取药品列表失败';
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      // 搜索功能已通过计算属性实现
    },
    openUpdateStockModal(drug) {
      this.selectedDrug = drug;
      this.stockChangeAmount = 0;
      this.showUpdateStockModal = true;
    },
    openEditDrugModal(drug) {
      this.selectedDrug = drug;
      this.drugForm = {
        name: drug.DrugName,
        specification: drug.Specification,
        dosageForm: drug.DosageForm,
        price: drug.Price.toString(),
        stockQuantity: drug.StockQuantity.toString()
      };
      this.showEditDrugModal = true;
    },
    async handleUpdateStock() {
      try {
        await axios.put(`/api/pharmacy/drugs/${this.selectedDrug.DrugID}/stock`, {
          amount: this.stockChangeAmount
        });
        
        await this.loadDrugs();
        this.showUpdateStockModal = false;
        alert('库存更新成功');
      } catch (error) {
        console.error('更新库存失败:', error);
        alert(error.response?.data?.message || '更新库存失败');
      }
    },
    async handleAddDrug() {
      try {
        await axios.post('/api/pharmacy/drugs', {
          name: this.drugForm.name,
          specification: this.drugForm.specification,
          dosageForm: this.drugForm.dosageForm,
          price: parseFloat(this.drugForm.price),
          stockQuantity: parseInt(this.drugForm.stockQuantity)
        });
        
        await this.loadDrugs();
        this.showAddDrugModal = false;
        this.drugForm = {
          name: '',
          specification: '',
          dosageForm: '',
          price: '',
          stockQuantity: ''
        };
        alert('添加药品成功');
      } catch (error) {
        console.error('添加药品失败:', error);
        alert(error.response?.data?.message || '添加药品失败');
      }
    }
  }
};
</script>

<style scoped>
.pharmacy-page {
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

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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

.status-pending {
  color: #f57c00;
}

.status-done {
  color: #4caf50;
}

.modal-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.tabs {
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  margin-right: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
}

.tabs button.active {
  color: #4CAF50;
  border-bottom: 2px solid #4CAF50;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.low-stock {
  color: #f44336;
  font-weight: bold;
}

.update-btn {
  margin-right: 0.5rem;
  background-color: #2196F3;
}

.edit-btn {
  background-color: #FF9800;
}

.add-btn {
  background-color: #4CAF50;
}

.drug-info {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn {
  background-color: #2196F3;
}

.refresh-btn:hover {
  background-color: #1976D2;
}
</style>

  