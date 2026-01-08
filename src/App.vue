<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import axios from 'axios';
  
  // --- STATE ---
  const employeeName = ref('Annas Putra Anuraga');
  const periodStart = ref('');
  const periodEnd = ref('');
  const htmlContent = ref(''); 
  const isLoading = ref(false);
  
  // State untuk Scaling
  const previewContainer = ref<HTMLDivElement | null>(null);
  const scale = ref(1);

  // --- LOGIC: Auto Scale (Fit to Screen) ---
  const calculateScale = () => {
    if (!previewContainer.value) return;
    
    // Lebar Kertas A4 Landscape dalam Pixel (approx 297mm @ 96dpi)
    const PAPER_WIDTH = 1123; 
    const PADDING = 64; // Padding container (32px kiri + 32px kanan)
    
    // Lebar Container yang tersedia
    const availableWidth = previewContainer.value.clientWidth - PADDING;
    
    // Hitung Scale: Jika container lebih kecil dari kertas, kecilkan kertasnya.
    // Jika container luas, biarkan scale maksimal 1 (tidak diperbesar berlebih).
    const newScale = Math.min(1, availableWidth / PAPER_WIDTH);
    
    scale.value = newScale;
  };

  // --- LOGIC: Auto Set Tanggal ---
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
    
    periodStart.value = start.toISOString().split('T')[0] || '';
    periodEnd.value = end.toISOString().split('T')[0] || '';

    // Pasang Listener Resize window
    window.addEventListener('resize', calculateScale);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', calculateScale);
  });
  
  // --- LOGIC: Load Preview ---
  const loadPreview = async () => {
    isLoading.value = true;
    htmlContent.value = '';
    
    try {
      const response = await axios.post('http://localhost:3000/api/preview-html', {
        employee: { name: employeeName.value, periodStart: periodStart.value, periodEnd: periodEnd.value }
      });
      htmlContent.value = response.data;
      
      // Tunggu DOM update, lalu hitung scale ulang
      await nextTick();
      calculateScale();
    } catch (error) {
      alert('Gagal load preview. Pastikan server backend jalan.');
    } finally {
      isLoading.value = false;
    }
  };
  
  // --- LOGIC: Print ---
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
      
    <aside class="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl relative flex-shrink-0">
        
      <div class="p-6 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div>
            <h1 class="font-bold text-slate-800 text-lg leading-tight">Timesheet</h1>
            <p class="text-xs text-slate-400 font-medium">Generator PDF</p>
          </div>
        </div>
      </div>
  
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Nama Karyawan</label>
            <input v-model="employeeName" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400" />
          </div>
  
          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Periode Mulai</label>
              <input v-model="periodStart" type="date" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Periode Selesai</label>
              <input v-model="periodEnd" type="date" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>
        </div>
      </div>
  
      <div class="p-4 bg-white border-t border-slate-200">
        <button @click="loadPreview" :disabled="isLoading" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg">
          <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-else class="flex items-center gap-2">Generate Preview</span>
        </button>
      </div>
    </aside>
  
  
    <main class="flex-1 flex flex-col relative min-w-0 bg-slate-100/50">
        
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0 flex-shrink-0">
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-slate-600">Document Preview</span>
          <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold tracking-wide">
            ZOOM: {{ Math.round(scale * 100) }}%
          </span>
        </div>
  
        <button @click="printFromIframe" :disabled="!htmlContent" class="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:grayscale">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Save as PDF
        </button>
      </header>
  
      <div ref="previewContainer" class="flex-1 overflow-hidden p-8 flex justify-center items-start bg-slate-200/50">
          
        <div v-if="htmlContent" 
             class="relative shadow-2xl transition-transform duration-300 ease-out origin-top"
             :style="{ transform: `scale(${scale})` }"
        >
          <iframe 
            id="preview-frame"
            :srcdoc="htmlContent"
            title="PDF Preview"
            class="bg-white block"
            style="width: 1123px; height: 794px; border: none;"
          ></iframe>
        </div>
  
        <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 opacity-60">
          <div class="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </div>
          <p class="text-sm font-medium">Preview akan muncul di sini</p>
        </div>
  
      </div>
    </main>
  
  </div>
</template>
  
<style>
  body { margin: 0; padding: 0; background-color: #f1f5f9; }
</style>