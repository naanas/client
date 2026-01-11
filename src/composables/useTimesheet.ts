import { ref, watch, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const STORAGE_KEY = 'timesheet_data_v1';
const THEME_KEY = 'timesheet_theme';
const JIRA_BASE_URL = 'https://pegadaian.atlassian.net/browse/';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const isAppLoading = ref(true);
const isDarkMode = ref(false);
const isLoading = ref(false);
const isSyncing = ref(false);
const isRefreshing = ref(false);
const isAssigneeLoading = ref(false);
const isPaymentLoading = ref(false); // State Loading Payment

const htmlContent = ref('');
const scale = ref(0.6);
const previewContainer = ref<HTMLDivElement | null>(null);
const enhancingId = ref<string | null>(null);
const assigneeList = ref<string[]>([]);

const employee = ref({
  name: '', reportName: '', no: 'POJ42050260',
  clientSite: 'Divisi Pengembangan Aplikasi TI - PT Pegadaian',
  workUnit: 'Dept. IT Business Analyst',
  deptHead: 'Andhar Setiawan', supervisor: 'Lailatul Fitriana R',
  squad: 'Squad IT PLATFORM', periodStart: '', periodEnd: '', month: ''
});

const regularTasks = ref<any[]>([]);
const overtimeTasks = ref<any[]>([]);

export function useTimesheet() {
  
  watch(() => employee.value.name, (newVal) => {
    if (newVal) employee.value.reportName = newVal;
  });

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

  // --- LOGIC XENDIT PAYMENT ---
  const payAndExportPdf = async (type: 'timesheet' | 'mandays') => {
      const email = prompt("Masukkan email untuk menerima file PDF:");
      if (!email) return;

      isPaymentLoading.value = true;
      try {
          const { data } = await axios.post(`${API_URL}/api/payment/create`, {
              type,
              employee: employee.value,
              tasks: regularTasks.value,
              overtimeTasks: overtimeTasks.value,
              email: email
          });

          if (data.invoiceUrl) {
              // Redirect User ke Halaman Bayar Xendit
              window.location.href = data.invoiceUrl;
          }
      } catch (err) {
          alert("Gagal membuat pembayaran. Cek koneksi backend.");
          console.error(err);
      } finally {
          isPaymentLoading.value = false;
      }
  };

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

  const saveData = () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ employee: employee.value, regularTasks: regularTasks.value, overtimeTasks: overtimeTasks.value }));
  const loadData = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if(savedTheme === 'dark') { isDarkMode.value = true; document.documentElement.classList.add('dark'); }
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) { const p = JSON.parse(s); if(p.employee) employee.value = p.employee; if(p.regularTasks) regularTasks.value=p.regularTasks; if(p.overtimeTasks) overtimeTasks.value=p.overtimeTasks; }
  };

  onMounted(() => { loadData(); fetchAssignees(); window.addEventListener('resize', fitScreen); setTimeout(() => isAppLoading.value = false, 1000); });
  onUnmounted(() => window.removeEventListener('resize', fitScreen));
  watch([employee, regularTasks, overtimeTasks], saveData, { deep: true });

  return {
    employee, regularTasks, overtimeTasks, assigneeList, 
    isDarkMode, isLoading, isSyncing, isRefreshing, isAssigneeLoading, isPaymentLoading,
    isAppLoading, htmlContent, scale, previewContainer, enhancingId,
    syncData, fetchAssignees, enhanceDescription, loadPreview, 
    downloadExcel,   
    payAndExportPdf, // Fungsi Baru
    autoFillLink, isWeekend, toggleDarkMode, fitScreen, printFromIframe,
    zoomIn: () => scale.value < 2 ? scale.value += 0.1 : null,
    zoomOut: () => scale.value > 0.3 ? scale.value -= 0.1 : null,
    addRegularRow: () => regularTasks.value.push({ date: '', description: '', ticketNumber: '', ticketLink: '' }),
    removeRegularRow: (i: number) => regularTasks.value.splice(i, 1),
    addOvertimeRow: () => overtimeTasks.value.push({ date: '', description: '', duration: 1, ticketLink: '', remarks: '' }),
    removeOvertimeRow: (i: number) => overtimeTasks.value.splice(i, 1),
  };
}