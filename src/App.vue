<script setup lang="ts">
  import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
  import axios from 'axios';
  
  // --- STYLE VARIABLE ---
  const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400";

  // --- ENV VARIABLE ---
  // Mengambil URL dari .env
  const API_URL = import.meta.env.VITE_API_URL;

  // --- STATE DATA KARYAWAN ---
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

  // --- STATE TASKS ---
  const regularTasks = ref([
    { date: '', description: '', ticketNumber: '', ticketLink: '' }
  ]);

  const overtimeTasks = ref([
    { date: '', description: '', duration: 1, ticketLink: '', remarks: '' }
  ]);

  const htmlContent = ref(''); 
  const isLoading = ref(false);
  const previewContainer = ref<HTMLDivElement | null>(null);
  const scale = ref(1);

  // --- HELPERS ---
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

  const calculateScale = () => {
    if (!previewContainer.value) return;
    const PAPER_WIDTH = 1123; 
    const PADDING = 64; 
    const availableWidth = previewContainer.value.clientWidth - PADDING;
    scale.value = Math.min(1, availableWidth / PAPER_WIDTH);
  };

  // --- ACTIONS ---
  const addRegularRow = () => {
    regularTasks.value.push({ date: '', description: '', ticketNumber: '', ticketLink: '' });
  };
  const removeRegularRow = (index: number) => {
    regularTasks.value.splice(index, 1);
  };

  const addOvertimeRow = () => {
    overtimeTasks.value.push({ date: '', description: '', duration: 1, ticketLink: '', remarks: '' });
  };
  const removeOvertimeRow = (index: number) => {
    overtimeTasks.value.splice(index, 1);
  };

  // --- LIFECYCLE ---
  onMounted(() => {
    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth();
    const y = today.getFullYear();
    let start, end;
    
    if (d >= 26) {
      start = new Date(y, m, 26);
      end = new Date(y, m + 1, 25);
    } else {
      start = new Date(y, m - 1, 26);
      end = new Date(y, m, 25);
    }
    
    employee.value.periodStart = start.toISOString().split('T')[0] || '';
    employee.value.periodEnd = end.toISOString().split('T')[0] || '';
    
    updateMonthField();
    window.addEventListener('resize', calculateScale);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', calculateScale);
  });

  watch(() => [employee.value.periodStart, employee.value.periodEnd], () => {
    updateMonthField();
  });
  
  // --- LOAD PREVIEW ---
  const loadPreview = async () => {
    isLoading.value = true;
    htmlContent.value = ''; 
    
    try {
      // MENGGUNAKAN API_URL DARI ENV
      const response = await axios.post(`${API_URL}/api/preview-html`, {
        employee: employee.value,
        tasks: regularTasks.value,
        overtimeTasks: overtimeTasks.value
      });
      htmlContent.value = response.data;
      await nextTick();
      calculateScale();
    } catch (error) {
      alert('Gagal load preview. Pastikan server backend jalan.');
      console.error(error);
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
</script>
  
<template>
  <div class="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
    <aside class="w-96 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl relative flex-shrink-0">
        
      <div class="p-6 border-b border-slate-100 flex items-center gap-3">
        <div class="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <div>
          <h1 class="font-bold text-slate-800 text-lg leading-tight">Timesheet</h1>
          <p class="text-xs text-slate-400 font-medium">Input Data</p>
        </div>
      </div>
  
      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Informasi Karyawan</h3>
          <div class="space-y-2">
            <input v-model="employee.name" type="text" placeholder="Nama Karyawan" :class="inputClass" />
            <input v-model="employee.no" type="text" placeholder="NIK" :class="inputClass" />
            <input v-model="employee.clientSite" type="text" placeholder="Client Site" :class="inputClass" />
            <input v-model="employee.workUnit" type="text" placeholder="Work Unit" :class="inputClass" />
            <div class="grid grid-cols-2 gap-2">
                <input v-model="employee.squad" type="text" placeholder="Squad" :class="inputClass" />
                <input v-model="employee.month" type="text" placeholder="Month (Auto)" :class="inputClass + ' bg-blue-50 text-blue-700 font-semibold'" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Approval</h3>
          <div class="space-y-2">
            <input v-model="employee.deptHead" type="text" placeholder="Dept Head Name" :class="inputClass" />
            <input v-model="employee.supervisor" type="text" placeholder="Supervisor Name" :class="inputClass" />
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Periode Timesheet</h3>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[10px] text-slate-400 font-bold ml-1">Mulai</label>
              <input v-model="employee.periodStart" type="date" :class="inputClass" />
            </div>
            <div>
              <label class="text-[10px] text-slate-400 font-bold ml-1">Selesai</label>
              <input v-model="employee.periodEnd" type="date" :class="inputClass" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center border-b pb-1">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">A. Regular (Harian)</h3>
            <button @click="addRegularRow" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold transition">+ Tambah</button>
          </div>
          
          <div v-if="regularTasks.length === 0" class="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded border border-dashed">
            Belum ada data regular.
          </div>

          <div v-else class="space-y-4">
            <div v-for="(task, index) in regularTasks" :key="index" class="p-3 bg-slate-50 rounded-lg border border-slate-200 relative group hover:border-blue-300 transition-colors shadow-sm">
              <button @click="removeRegularRow(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div class="space-y-2">
                <input v-model="task.date" type="date" :class="inputClass + ' w-36'" title="Tanggal" />
                <textarea v-model="task.description" rows="2" placeholder="Deskripsi Pekerjaan" :class="inputClass + ' resize-none'"></textarea>
                <div class="grid grid-cols-2 gap-2">
                   <div>
                       <label class="text-[10px] text-slate-400 font-bold ml-1">No. Tiket (BATB)</label>
                       <input v-model="task.ticketNumber" type="text" placeholder="BATB-XXXX" :class="inputClass" />
                   </div>
                   <div>
                       <label class="text-[10px] text-slate-400 font-bold ml-1">Link JIRA</label>
                       <input v-model="task.ticketLink" type="text" placeholder="https://..." :class="inputClass" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center border-b pb-1">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">B. Overtime (Lembur)</h3>
            <button @click="addOvertimeRow" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold transition">+ Tambah</button>
          </div>
          
          <div v-if="overtimeTasks.length === 0" class="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded border border-dashed">
            Belum ada data lembur.
          </div>

          <div v-else class="space-y-4">
            <div v-for="(task, index) in overtimeTasks" :key="index" class="p-3 bg-slate-50 rounded-lg border border-slate-200 relative group hover:border-blue-300 transition-colors shadow-sm">
              <button @click="removeOvertimeRow(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div class="space-y-2">
                <div class="flex gap-2">
                    <div class="w-2/3">
                        <label class="text-[10px] text-slate-400 font-bold ml-1">Tanggal</label>
                        <input v-model="task.date" type="date" :class="inputClass" />
                    </div>
                    <div class="w-1/3">
                        <label class="text-[10px] text-slate-400 font-bold ml-1">Jam</label>
                        <input v-model="task.duration" type="number" step="0.5" :class="inputClass + ' text-center'" placeholder="Jam" />
                    </div>
                </div>
                
                <textarea v-model="task.description" rows="2" placeholder="Deskripsi Lembur" :class="inputClass + ' resize-none'"></textarea>
                
                <div>
                    <label class="text-[10px] text-slate-400 font-bold ml-1">Link JIRA</label>
                    <input v-model="task.ticketLink" type="text" placeholder="https://..." :class="inputClass" />
                </div>
                
                <input v-model="task.remarks" type="text" placeholder="No. Surat Tugas" :class="inputClass" />
              </div>
            </div>
          </div>
        </div>

      </div>
  
      <div class="p-4 bg-white border-t border-slate-200">
        <button @click="loadPreview" :disabled="isLoading" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 shadow-lg">
          <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span v-else>Generate Preview</span>
        </button>
      </div>
    </aside>
  
    <main class="flex-1 flex flex-col bg-slate-100/50 min-w-0">
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-slate-600">Document Preview</span>
          <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold">ZOOM: {{ Math.round(scale * 100) }}%</span>
        </div>
        <button @click="printFromIframe" :disabled="!htmlContent" class="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50">Save as PDF</button>
      </header>
  
      <div ref="previewContainer" class="flex-1 overflow-hidden p-8 flex justify-center items-start bg-slate-200/50">
        <div v-if="htmlContent" class="relative shadow-2xl transition-transform duration-300 ease-out origin-top" :style="{ transform: `scale(${scale})` }">
          <iframe id="preview-frame" :srcdoc="htmlContent" title="PDF Preview" class="bg-white block" style="width: 1123px; height: 794px; border: none;"></iframe>
        </div>
        <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
           <p>Siap Generate...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
  body { margin: 0; background-color: #f1f5f9; }
</style>