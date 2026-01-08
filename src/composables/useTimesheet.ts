import { ref, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';

const STORAGE_KEY = 'timesheet_data_v1';
const THEME_KEY = 'timesheet_theme';
const JIRA_BASE_URL = 'https://pegadaian.atlassian.net/browse/';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useTimesheet() {
  // App States
  const isAppLoading = ref(true);
  const isDarkMode = ref(false);
  const isLoading = ref(false); // Generate Preview
  const isSyncing = ref(false); // Sync DB
  const isRefreshing = ref(false); // Refresh List Nama <--- STATE BARU
  
  const htmlContent = ref('');
  const scale = ref(0.6);
  const previewContainer = ref<HTMLDivElement | null>(null);
  const enhancingId = ref<string | null>(null); // AI Loading State

  // Data States
  const assigneeList = ref<string[]>([]);
  const employee = ref({
    name: '', 
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

  // --- ACTIONS ---

  // 1. SYNC DATA (Google Sheet -> DB Supabase)
  const syncData = async () => {
    if (isSyncing.value) return; // Prevent double click
    isSyncing.value = true;
    try {
        const { data } = await axios.post(`${API_URL}/api/sync`);
        
        if (data.status === 'updated') {
            alert(`✅ Sukses! ${data.count} data baru berhasil disinkronisasi.`);
        } else {
            alert('info: Data database sudah paling update.');
        }
        
        // Auto refresh list setelah sync
        await fetchAssignees();

    } catch (e: any) {
        console.error("Sync Error:", e);
        alert('❌ Gagal Sync Data. Cek koneksi server.');
    } finally {
        isSyncing.value = false;
    }
  };

  // 2. FETCH ASSIGNEES (Dari DB Supabase)
  const fetchAssignees = async () => {
    isRefreshing.value = true; // Start Animation
    try {
        const { data } = await axios.get(`${API_URL}/api/assignees`);
        assigneeList.value = data;
    } catch (error) {
        console.error("Gagal load assignee:", error);
    } finally {
        // Kasih delay dikit biar animasinya kelihatan (UX)
        setTimeout(() => { isRefreshing.value = false; }, 500);
    }
  };

  // 3. AI ENHANCE
  const enhanceDescription = async (index: number, type: 'regular' | 'overtime') => {
    const targetArray = type === 'regular' ? regularTasks.value : overtimeTasks.value;
    const task = targetArray[index];
    if (!task || !task.description) return alert("Isi deskripsi dulu");

    enhancingId.value = `${type}-${index}`; // Start Animation
    try {
      const response = await axios.post(`${API_URL}/api/enhance-description`, { text: task.description });
      task.description = response.data.text;
    } catch (error) { alert("AI Error"); } 
    finally { enhancingId.value = null; } // Stop Animation
  };

  // 4. GENERATE PREVIEW
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

  // --- UTILS ---

  const isWeekend = (dateStr: string) => {
    if (!dateStr) return false;
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6; 
  };

  const autoFillLink = (task: any) => {
    if (task.ticketNumber && !task.ticketLink) {
        const ticketClean = task.ticketNumber.trim().toUpperCase();
        task.ticketNumber = ticketClean; 
        task.ticketLink = `${JIRA_BASE_URL}${ticketClean}`;
    }
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

  const zoomIn = () => { if(scale.value < 2.0) scale.value += 0.1; };
  const zoomOut = () => { if(scale.value > 0.3) scale.value -= 0.1; };
  
  const fitScreen = () => { 
    if (previewContainer.value) {
       const containerWidth = previewContainer.value.clientWidth;
       const paperWidth = 1123; 
       const newScale = (containerWidth - 60) / paperWidth; 
       scale.value = Math.max(0.3, Math.min(newScale, 1.5));
    } else {
       scale.value = 0.6; 
    }
  };

  const printFromIframe = () => {
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

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

  const addRegularRow = () => regularTasks.value.push({ date: '', description: '', ticketNumber: '', ticketLink: '' });
  const removeRegularRow = (index: number) => regularTasks.value.splice(index, 1);
  const addOvertimeRow = () => overtimeTasks.value.push({ date: '', description: '', duration: 1, ticketLink: '', remarks: '' });
  const removeOvertimeRow = (index: number) => overtimeTasks.value.splice(index, 1);

  onMounted(() => {
    loadData();
    fetchAssignees();
    window.addEventListener('resize', fitScreen);
    setTimeout(() => { isAppLoading.value = false; }, 1000);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', fitScreen);
  });

  watch([employee, regularTasks, overtimeTasks], () => saveData(), { deep: true });

  return {
    employee, regularTasks, overtimeTasks,
    isDarkMode, isLoading, htmlContent, 
    scale, zoomIn, zoomOut, fitScreen, 
    previewContainer, enhancingId, isAppLoading,
    assigneeList, fetchAssignees, 
    isSyncing, isRefreshing, syncData, // <--- EXPORT State Baru
    enhanceDescription, isWeekend, autoFillLink, toggleDarkMode,
    addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
    loadPreview, printFromIframe
  };
}