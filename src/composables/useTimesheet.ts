import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import axios from 'axios';

// --- CONSTANTS ---
const STORAGE_KEY = 'timesheet_data_v1';
const THEME_KEY = 'timesheet_theme';
const JIRA_BASE_URL = 'https://pegadaian.atlassian.net/browse/';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useTimesheet() {
  // --- STATE ---
  const isAppLoading = ref(true);
  const isDarkMode = ref(false);
  const isLoading = ref(false);
  const htmlContent = ref('');
  
  // STATE ZOOM BARU (Lebih Simpel)
  const scale = ref(0.6); // Default agak kecil biar muat
  const previewContainer = ref<HTMLDivElement | null>(null);
  
  const enhancingId = ref<string | null>(null);

  const employee = ref({
    name: 'Annas Putra Anuraga',
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

  const regularTasks = ref([{ date: '', description: '', ticketNumber: '', ticketLink: '' }]);
  const overtimeTasks = ref([{ date: '', description: '', duration: 1, ticketLink: '', remarks: '' }]);

  // --- ACTIONS ---

  // ZOOM ACTIONS (Simple Math)
  const zoomIn = () => {
    if (scale.value < 2.0) scale.value = Number((scale.value + 0.1).toFixed(1));
  };
  
  const zoomOut = () => {
    if (scale.value > 0.3) scale.value = Number((scale.value - 0.1).toFixed(1));
  };

  const fitScreen = () => {
     if (!previewContainer.value) return;
     const PAPER_WIDTH = 1123;
     const availableWidth = previewContainer.value.clientWidth - 40; // padding
     scale.value = Number(Math.min(1, availableWidth / PAPER_WIDTH).toFixed(2));
  };

  // ... (SISA LOGIC AI, HELPERS, THEME, DATA PERSISTENCE TETAP SAMA SEPERTI SEBELUMNYA) ...
  // ... (Copy Paste logic enhanceDescription, isWeekend, autoFillLink, dll dari file sebelumnya) ...
  
  const enhanceDescription = async (index: number, type: 'regular' | 'overtime') => {
    const targetArray = type === 'regular' ? regularTasks.value : overtimeTasks.value;
    const task = targetArray[index];
    if (!task) return; 
    const originalText = task.description;
    if (!originalText || originalText.length < 3) {
      alert("Tulis deskripsi singkat dulu."); return;
    }
    const id = `${type}-${index}`;
    enhancingId.value = id;
    try {
      const response = await axios.post(`${API_URL}/api/enhance-description`, { text: originalText });
      task.description = response.data.text;
    } catch (error) { console.error(error); alert("Gagal memanggil AI."); } 
    finally { enhancingId.value = null; }
  };

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

  const getMonthName = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  };

  const updateMonthField = () => {
    const start = getMonthName(employee.value.periodStart);
    const end = getMonthName(employee.value.periodEnd);
    employee.value.month = start === end ? start : `${start} TO ${end}`;
  };

  const applyTheme = () => {
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
    applyTheme();
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
      await nextTick();
      fitScreen(); // Auto fit saat pertama load
    } catch (error) {
      alert('Gagal load preview.');
    } finally {
      isLoading.value = false;
    }
  };

  const printFromIframe = () => {
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  const saveData = () => {
    const data = { employee: employee.value, regularTasks: regularTasks.value, overtimeTasks: overtimeTasks.value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const setDefaultDates = () => {
    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth();
    const y = today.getFullYear();
    let start, end;
    if (d >= 26) { start = new Date(y, m, 26); end = new Date(y, m + 1, 25); } 
    else { start = new Date(y, m - 1, 26); end = new Date(y, m, 25); }
    employee.value.periodStart = start.toISOString().split('T')[0] || '';
    employee.value.periodEnd = end.toISOString().split('T')[0] || '';
    updateMonthField();
  };

  const loadData = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    isDarkMode.value = savedTheme === 'dark';
    applyTheme();
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.employee) employee.value = parsed.employee;
        if (parsed.regularTasks) regularTasks.value = parsed.regularTasks;
        if (parsed.overtimeTasks) overtimeTasks.value = parsed.overtimeTasks;
      } catch (e) { console.error(e); }
    } else { setDefaultDates(); }
  };

  const addRegularRow = () => regularTasks.value.push({ date: '', description: '', ticketNumber: '', ticketLink: '' });
  const removeRegularRow = (index: number) => regularTasks.value.splice(index, 1);
  const addOvertimeRow = () => overtimeTasks.value.push({ date: '', description: '', duration: 1, ticketLink: '', remarks: '' });
  const removeOvertimeRow = (index: number) => overtimeTasks.value.splice(index, 1);

  onMounted(() => {
    loadData();
    window.addEventListener('resize', fitScreen);
    setTimeout(fitScreen, 500);
    setTimeout(() => { isAppLoading.value = false; }, 1000);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', fitScreen);
  });

  watch([employee, regularTasks, overtimeTasks], () => { saveData(); updateMonthField(); }, { deep: true });

  return {
    employee, regularTasks, overtimeTasks,
    isDarkMode, isLoading, htmlContent, 
    // Return Zoom Tools Baru
    scale, zoomIn, zoomOut, fitScreen, 
    previewContainer, enhancingId, isAppLoading,
    enhanceDescription, isWeekend, autoFillLink, toggleDarkMode,
    addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
    loadPreview, printFromIframe
  };
}