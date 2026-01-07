<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  const employeeName = ref('Annas Putra Anuraga');
  const periodStart = ref('');
  const periodEnd = ref('');
  const htmlContent = ref(''); 
  const isLoading = ref(false);
  
  // Auto Set Tanggal (Cutoff tgl 26)
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
  });
  
  // LOAD PREVIEW
  const loadPreview = async () => {
    isLoading.value = true;
    htmlContent.value = '';
    try {
      const response = await axios.post('http://localhost:3000/api/preview-html', {
        employee: { name: employeeName.value, periodStart: periodStart.value, periodEnd: periodEnd.value }
      });
      htmlContent.value = response.data;
    } catch (error) {
      alert('Gagal load preview');
    } finally {
      isLoading.value = false;
    }
  };
  
  // FUNGSI PRINT TO PDF
  const printToPdf = () => {
    // Browser akan membuka dialog print. User tinggal pilih "Save as PDF"
    window.print();
  };
  </script>
  
  <template>
    <div class="min-h-screen bg-white p-8 font-sans flex flex-col items-center">
      
      <div class="w-full max-w-[297mm] bg-white p-4 rounded shadow mb-6 flex gap-4 items-end no-print sticky top-4 z-50">
        <div>
          <label class="block text-xs font-bold text-gray-500">Nama</label>
          <input v-model="employeeName" class="border p-2 rounded w-64" />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500">Dari</label>
          <input v-model="periodStart" type="date" class="border p-2 rounded" />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500">Sampai</label>
          <input v-model="periodEnd" type="date" class="border p-2 rounded" />
        </div>
        
        <button @click="loadPreview" :disabled="isLoading" class="bg-gray-800 text-white px-6 py-2 rounded font-bold hover:bg-gray-900 transition">
          {{ isLoading ? 'Loading...' : '🔍 Load Data' }}
        </button>
  
        <button v-if="htmlContent" @click="printToPdf" class="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition flex items-center gap-2">
          <span>📄</span> Save as PDF
        </button>
      </div>
  
      <div v-if="htmlContent" class="paper-preview bg-white shadow-2xl overflow-hidden">
          <div v-html="htmlContent"></div>
      </div>
      
      <div v-else class="text-center text-white mt-20 no-print">
        <p>Klik "Load Data" untuk melihat preview Timesheet.</p>
      </div>
  
    </div>
  </template>
  
  <style>
  /* STYLE KHUSUS PRINT PDF */
  @media print {
    /* Hilangkan background abu-abu browser & tombol control */
    body {
      background: white;
      margin: 0;
      padding: 0;
    }
    .no-print {
      display: none !important;
    }
    
    /* Paksa background color tercetak (penting buat header tabel) */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  
    /* Atur Halaman A4 Landscape */
    @page {
      size: A4 landscape;
      margin: 10mm; /* Margin kertas */
    }
  
    /* Hilangkan shadow kertas preview */
    .paper-preview {
      box-shadow: none !important;
      margin: 0 !important;
      width: 100% !important;
    }
  }
  
  /* Style Preview di Layar Komputer */
  .paper-preview {
    width: 297mm; /* Lebar A4 Landscape */
    min-height: 210mm;
    padding: 0; /* Padding diatur di dalam HTML backend */
    box-sizing: border-box;
  }
  </style>