import { ref, watch, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useAuth } from './useAuth'; 

// --- GLOBAL STATE (SINGLETON) ---
const STORAGE_KEY = 'timesheet_data_v1';
const THEME_KEY = 'timesheet_theme';
const JIRA_BASE_URL = 'https://pegadaian.atlassian.net/browse/';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// UI State
const isAppLoading = ref(true);
const isDarkMode = ref(false);
const isLoading = ref(false);
const isSyncing = ref(false);
const isRefreshing = ref(false);
const isAssigneeLoading = ref(false);
const isPaymentLoading = ref(false);

// Modal Payment State
const isEmailModalOpen = ref(false);
const emailRecipient = ref('');
const pendingExportType = ref<'timesheet' | 'mandays'>('timesheet');

// --- NEW: State Pilihan Kategori Bayar ---
const selectedPaymentCategory = ref<'qris' | 'va' | 'retail'>('qris'); 

// Pricing State (Includes Specific Fees)
const pricing = ref({
    timesheet_price: 20000,
    mandays_price: 25000,
    fee_qris: 1000,   // Fee QRIS
    fee_va: 4500,     // Fee Virtual Account
    fee_retail: 6500  // Fee Retail
});

// Preview State
const htmlContent = ref('');
const scale = ref(0.6);
const previewContainer = ref<HTMLDivElement | null>(null);
const enhancingId = ref<string | null>(null);
const assigneeList = ref<string[]>([]);

// Data Employee
const employee = ref({
  name: '', reportName: '', no: 'POJ42050260',
  clientSite: 'Divisi Pengembangan Aplikasi TI - PT Pegadaian',
  workUnit: 'Dept. IT Business Analyst',
  deptHead: 'Andhar Setiawan', supervisor: 'Lailatul Fitriana R',
  squad: 'Squad IT PLATFORM', periodStart: '', periodEnd: '', month: ''
});

// Tasks Data
const regularTasks = ref<any[]>([]);
const overtimeTasks = ref<any[]>([]);

export function useTimesheet() {
  
  watch(() => employee.value.name, (newVal) => {
    if (newVal) employee.value.reportName = newVal;
  });

  // --- API FUNCTIONS ---

  const syncData = async () => {
    if (isSyncing.value) return;
    isSyncing.value = true;
    try {
        const { data } = await axios.post(`${API_URL}/api/sync`);
        alert(data.status === 'updated' ? `✅ Sukses! ${data.count} data baru.` : 'Data sudah update.');
        await fetchAssignees();
    } catch (e) { alert('❌ Gagal Sync.'); } 
    finally { isSyncing.value = false; }
  };

  const fetchAssignees = async () => {
    isRefreshing.value = true;
    isAssigneeLoading.value = true;
    try { 
        const { data } = await axios.get(`${API_URL}/api/assignees`); 
        assigneeList.value = data; 
    } 
    catch (e) { console.error("Gagal load assignees", e); } 
    finally { setTimeout(() => { isRefreshing.value = false; isAssigneeLoading.value = false; }, 500); }
  };

  // Ambil Harga & Fee Lengkap dari Backend
  const fetchPricing = async () => {
    try {
        const { data } = await axios.get(`${API_URL}/api/pricing`);
        if (data.timesheet_price) pricing.value.timesheet_price = Number(data.timesheet_price);
        if (data.mandays_price) pricing.value.mandays_price = Number(data.mandays_price);
        
        // Map fees
        if (data.fee_qris) pricing.value.fee_qris = Number(data.fee_qris);
        if (data.fee_va) pricing.value.fee_va = Number(data.fee_va);
        if (data.fee_retail) pricing.value.fee_retail = Number(data.fee_retail);
    } catch (e) {
        console.error("Gagal load pricing, pakai default.", e);
    }
  };

  const enhanceDescription = async (index: number, type: 'regular' | 'overtime') => {
    const target = type === 'regular' ? regularTasks.value : overtimeTasks.value;
    if (!target[index]?.description) return;
    enhancingId.value = `${type}-${index}`;
    try {
      const res = await axios.post(`${API_URL}/api/enhance-description`, { text: target[index].description });
      target[index].description = res.data.text;
    } finally { enhancingId.value = null; }
  };

  const loadPreview = async (type: 'mandays' | 'timesheet' = 'mandays') => {
    isLoading.value = true;
    htmlContent.value = ''; 
    try {
      const response = await axios.post(`${API_URL}/api/preview-html`, {
        type, employee: employee.value, tasks: regularTasks.value, overtimeTasks: overtimeTasks.value
      });
      htmlContent.value = response.data;
    } catch (error) { alert("Gagal memuat preview."); } 
    finally { isLoading.value = false; }
  };

  const downloadExcel = async (type: 'mandays' | 'timesheet' = 'mandays') => {
    const label = type === 'timesheet' ? 'Timesheet' : 'Mandays';
    if (!confirm(`Download versi Excel ${label} (.xlsx)?`)) return;
    
    const endpoint = type === 'timesheet' ? `${API_URL}/api/generate-timesheet` : `${API_URL}/api/generate-mandays`;

    try {
        const response = await axios.post(endpoint, {
            employee: employee.value, tasks: regularTasks.value, overtimeTasks: overtimeTasks.value
        }, { responseType: 'blob' });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${label}_${employee.value.name || 'Export'}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) { alert(`Gagal download Excel ${label}.`); }
  };

  // --- PAYMENT LOGIC (XENDIT) ---
  
  // 1. Trigger Modal
  const openPaymentModal = (type: 'timesheet' | 'mandays') => {
      pendingExportType.value = type;
      isEmailModalOpen.value = true;
  };

  // 2. Process Transaction
  const processPayment = async () => {
      const { user } = useAuth(); // Ambil user login

      if (!emailRecipient.value) {
          alert("Email wajib diisi!");
          return;
      }

      isPaymentLoading.value = true;
      try {
          // Kirim data lengkap ke backend + Payment Category
          const { data } = await axios.post(`${API_URL}/api/payment/create`, {
              type: pendingExportType.value,
              employee: employee.value,
              tasks: regularTasks.value,
              overtimeTasks: overtimeTasks.value,
              email: emailRecipient.value,
              user_id: user.value?.id,
              paymentCategory: selectedPaymentCategory.value // <--- PENTING: Kirim kategori bayar
          });

          if (data.invoiceUrl) {
              window.location.href = data.invoiceUrl;
          }
      } catch (err) {
          alert("Gagal membuat pembayaran. Cek koneksi backend.");
          console.error(err);
          isPaymentLoading.value = false; 
      }
  };

  // --- UTILS ---
  const autoFillLink = (task: any) => {
    if (task.ticketNumber && !task.ticketLink) {
        task.ticketNumber = task.ticketNumber.trim().toUpperCase();
        task.ticketLink = `${JIRA_BASE_URL}${task.ticketNumber}`;
    }
  };

  const isWeekend = (d: string) => { if(!d)return false; const day = new Date(d).getDay(); return day===0||day===6; };
  
  const toggleDarkMode = () => { 
      isDarkMode.value = !isDarkMode.value; 
      document.documentElement.classList.toggle('dark', isDarkMode.value);
      localStorage.setItem(THEME_KEY, isDarkMode.value ? 'dark' : 'light');
  };

  const fitScreen = () => { if (previewContainer.value) scale.value = Math.max(0.3, Math.min((previewContainer.value.clientWidth - 60) / 1123, 1.5)); };
  const printFromIframe = () => { const iframe = document.getElementById('preview-frame') as HTMLIFrameElement; if (iframe?.contentWindow) { iframe.contentWindow.focus(); iframe.contentWindow.print(); } };

  // --- PERSISTENCE ---
  const saveData = () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ employee: employee.value, regularTasks: regularTasks.value, overtimeTasks: overtimeTasks.value }));
  
  const loadData = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if(savedTheme === 'dark') { isDarkMode.value = true; document.documentElement.classList.add('dark'); }
    
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) { 
        const p = JSON.parse(s); 
        if(p.employee) employee.value = p.employee; 
        if(p.regularTasks) regularTasks.value=p.regularTasks; 
        if(p.overtimeTasks) overtimeTasks.value=p.overtimeTasks; 
    }
  };

  // --- LIFECYCLE ---
  onMounted(() => { 
      loadData(); 
      fetchAssignees(); 
      fetchPricing(); 
      window.addEventListener('resize', fitScreen); 
      setTimeout(() => isAppLoading.value = false, 1000); 
  });
  
  onUnmounted(() => window.removeEventListener('resize', fitScreen));
  
  watch([employee, regularTasks, overtimeTasks], saveData, { deep: true });

  return {
    // State
    employee, regularTasks, overtimeTasks, assigneeList, pricing,
    isDarkMode, isLoading, isSyncing, isRefreshing, isAssigneeLoading, 
    isAppLoading, htmlContent, scale, previewContainer, enhancingId,
    
    // Payment State
    isPaymentLoading, isEmailModalOpen, emailRecipient, pendingExportType,
    selectedPaymentCategory, // Export ini agar bisa dipakai di Modal
    
    // Actions
    openPaymentModal, processPayment, fetchPricing,
    syncData, fetchAssignees, enhanceDescription, loadPreview, downloadExcel,
    
    // Utils
    autoFillLink, isWeekend, toggleDarkMode, fitScreen, printFromIframe,
    zoomIn: () => scale.value < 2 ? scale.value += 0.1 : null,
    zoomOut: () => scale.value > 0.3 ? scale.value -= 0.1 : null,
    addRegularRow: () => regularTasks.value.push({ date: '', description: '', ticketNumber: '', ticketLink: '' }),
    removeRegularRow: (i: number) => regularTasks.value.splice(i, 1),
    addOvertimeRow: () => overtimeTasks.value.push({ date: '', description: '', duration: 1, ticketLink: '', remarks: '' }),
    removeOvertimeRow: (i: number) => overtimeTasks.value.splice(i, 1),
  };
}