// src/composables/useTimesheet.ts
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import axios from 'axios';

// --- CONSTANTS ---
const STORAGE_KEY = 'timesheet_data_v1';
const THEME_KEY = 'timesheet_theme';
const JIRA_BASE_URL = 'https://pegadaian.atlassian.net/browse/';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useTimesheet() {
  // --- STATE ---
  const isDarkMode = ref(false);
  const isLoading = ref(false);
  const htmlContent = ref('');
  const scale = ref(1);
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

  // --- ACTIONS & LOGIC ---

  // 1. AI Logic (FIXED: TypeScript Error solved here)
  const enhanceDescription = async (index: number, type: 'regular' | 'overtime') => {
    const targetArray = type === 'regular' ? regularTasks.value : overtimeTasks.value;
    
    // FIX: Validasi object task terlebih dahulu sebelum akses property
    const task = targetArray[index];
    if (!task) return; 

    const originalText = task.description;

    if (!originalText || originalText.length < 3) {
      alert("Tulis deskripsi singkat dulu, contoh: 'meeting bahas api'");
      return;
    }

    const id = `${type}-${index}`;
    enhancingId.value = id;

    try {
      const response = await axios.post(`${API_URL}/api/enhance-description`, {
        text: originalText
      });
      // FIX: Update task yang sudah divalidasi
      task.description = response.data.text;
    } catch (error) {
      console.error(error);
      alert("Gagal memanggil AI. Cek koneksi backend.");
    } finally {
      enhancingId.value = null;
    }
  };

  // 2. Helpers
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

  // 3. Theme Logic
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

  // 4. Preview Logic
  const calculateScale = () => {
    if (!previewContainer.value) return;
    const PAPER_WIDTH = 1123; 
    const PADDING = 32; 
    const availableWidth = previewContainer.value.clientWidth - PADDING;
    scale.value = Math.min(1, availableWidth / PAPER_WIDTH);
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
      calculateScale();
    } catch (error) {
      alert('Gagal load preview. Cek koneksi backend.');
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

  // 5. Data Persistence
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
    } else {
      setDefaultDates();
    }
  };

  // --- ROW MANAGEMENT ---
  const addRegularRow = () => regularTasks.value.push({ date: '', description: '', ticketNumber: '', ticketLink: '' });
  const removeRegularRow = (index: number) => regularTasks.value.splice(index, 1);
  const addOvertimeRow = () => overtimeTasks.value.push({ date: '', description: '', duration: 1, ticketLink: '', remarks: '' });
  const removeOvertimeRow = (index: number) => overtimeTasks.value.splice(index, 1);

  // --- LIFECYCLE ---
  onMounted(() => {
    loadData();
    window.addEventListener('resize', calculateScale);
    setTimeout(calculateScale, 500);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', calculateScale);
  });

  watch([employee, regularTasks, overtimeTasks], () => { saveData(); updateMonthField(); }, { deep: true });

  // Return semua yang dibutuhkan Template
  return {
    employee, regularTasks, overtimeTasks,
    isDarkMode, isLoading, htmlContent, scale, previewContainer, enhancingId,
    enhanceDescription, isWeekend, autoFillLink, toggleDarkMode,
    addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
    loadPreview, printFromIframe
  };
}