import { ref, watch, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

// --- GLOBAL STATE (Data tersimpan di memori meski pindah tab) ---
const STORAGE_KEY = 'timesheet_data_v1';
const THEME_KEY = 'timesheet_theme';
const JIRA_BASE_URL = 'https://pegadaian.atlassian.net/browse/';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// App UI State
const isAppLoading = ref(true);
const isDarkMode = ref(false);
const isLoading = ref(false);     // Loading saat Generate Preview
const isSyncing = ref(false);     // Loading saat Sync DB
const isRefreshing = ref(false);  // Loading saat Refresh List Nama
const enhancingId = ref<string | null>(null); // Loading AI

// Preview State
const htmlContent = ref('');
const scale = ref(0.6);
const previewContainer = ref<HTMLDivElement | null>(null);

// Data Karyawan & Tasks
const assigneeList = ref<string[]>([]);
const employee = ref({
  name: '', 
  reportName: '', 
  no: 'POJ42050260',
  clientSite: 'Divisi Pengembangan Aplikasi TI - PT Pegadaian',
  workUnit: 'Dept. IT Business Analyst',
  deptHead: 'Andhar Setiawan',
  supervisor: 'Lailatul Fitriana R',
  squad: 'Squad IT PLATFORM',
  periodStart: '',
  periodEnd: '',
  month: '' 
});

const regularTasks = ref<any[]>([]);
const overtimeTasks = ref<any[]>([]);

export function useTimesheet() {

  // --- ACTIONS ---

  const syncData = async () => {
    if (isSyncing.value) return;
    isSyncing.value = true;
    try {
        const { data } = await axios.post(`${API_URL}/api/sync`);
        if (data.status === 'updated') alert(`✅ Sukses! ${data.count} data baru.`);
        else alert('info: Data database sudah paling update.');
        await fetchAssignees();
    } catch (e: any) {
        console.error(e);
        alert('❌ Gagal Sync Data.');
    } finally {
        isSyncing.value = false;
    }
  };

  const fetchAssignees = async () => {
    isRefreshing.value = true;
    try {
        const { data } = await axios.get(`${API_URL}/api/assignees`);
        assigneeList.value = data;
    } catch (error) {
        console.error("Gagal load assignee:", error);
    } finally {
        setTimeout(() => { isRefreshing.value = false; }, 500);
    }
  };

  const enhanceDescription = async (index: number, type: 'regular' | 'overtime') => {
    const targetArray = type === 'regular' ? regularTasks.value : overtimeTasks.value;
    const task = targetArray[index];
    if (!task || !task.description) return alert("Isi deskripsi dulu");

    enhancingId.value = `${type}-${index}`;
    try {
      const response = await axios.post(`${API_URL}/api/enhance-description`, { text: task.description });
      task.description = response.data.text;
    } catch (error) { 
      alert("AI Error"); 
    } finally { 
      enhancingId.value = null; 
    }
  };

  const loadPreview = async () => {
    isLoading.value = true;
    htmlContent.value = ''; 
    try {
      const response = await axios.post(`${API_URL}/api/preview-html`, {
        employee: employee.value,
        tasks: regularTasks.value,
        overtimeTasks: overtimeTasks.value
      });
      htmlContent.value = response.data;
    } catch (error) {
      alert('Gagal load preview.');
    } finally {
      isLoading.value = false;
    }
  };

  // --- UTILS & HELPERS ---

  const autoFillLink = (task: any) => {
    if (task.ticketNumber && !task.ticketLink) {
        const ticketClean = task.ticketNumber.trim().toUpperCase();
        task.ticketNumber = ticketClean; 
        task.ticketLink = `${JIRA_BASE_URL}${ticketClean}`;
    }
  };

  const isWeekend = (dateStr: string) => {
    if (!dateStr) return false;
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6; 
  };

  const updateTheme = () => {
    const html = document.documentElement;
    if (isDarkMode.value) {
        html.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
    } else {
        html.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
    }
  };

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    updateTheme();
  };

  const fitScreen = () => { 
    if (previewContainer.value) {
       const containerWidth = previewContainer.value.clientWidth;
       // Kertas A4 landscape ~1123px width
       const newScale = (containerWidth - 60) / 1123; 
       scale.value = Math.max(0.3, Math.min(newScale, 1.5));
    }
  };

  const printFromIframe = () => {
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  const addRegularRow = () => regularTasks.value.push({ date: '', description: '', ticketNumber: '', ticketLink: '' });
  const removeRegularRow = (index: number) => regularTasks.value.splice(index, 1);
  const addOvertimeRow = () => overtimeTasks.value.push({ date: '', description: '', duration: 1, ticketLink: '', remarks: '' });
  const removeOvertimeRow = (index: number) => overtimeTasks.value.splice(index, 1);

  // --- PERSISTENCE & INIT ---

  const saveData = () => {
    const data = { employee: employee.value, regularTasks: regularTasks.value, overtimeTasks: overtimeTasks.value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const loadData = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    isDarkMode.value = savedTheme === 'dark';
    updateTheme();

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.employee) employee.value = parsed.employee;
        if (parsed.regularTasks) regularTasks.value = parsed.regularTasks;
        if (parsed.overtimeTasks) overtimeTasks.value = parsed.overtimeTasks;
      } catch (e) {}
    }
  };

  // Watchers & Lifecycle
  watch(() => employee.value.name, (newVal) => {
    if (newVal) employee.value.reportName = newVal;
  });
  
  watch([employee, regularTasks, overtimeTasks], () => saveData(), { deep: true });

  onMounted(() => {
    loadData();
    fetchAssignees();
    window.addEventListener('resize', fitScreen);
    setTimeout(() => { isAppLoading.value = false; }, 1000);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', fitScreen);
  });

  return {
    // State
    employee, regularTasks, overtimeTasks, assigneeList,
    isAppLoading, isDarkMode, isLoading, isSyncing, isRefreshing, enhancingId,
    htmlContent, scale, previewContainer,
    
    // Actions
    syncData, fetchAssignees, enhanceDescription, loadPreview,
    autoFillLink, isWeekend, toggleDarkMode, fitScreen, printFromIframe,
    addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
    zoomIn: () => { if(scale.value < 2.0) scale.value += 0.1; },
    zoomOut: () => { if(scale.value > 0.3) scale.value -= 0.1; }
  };
}