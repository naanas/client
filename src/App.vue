<script setup lang="ts">
  import { useTimesheet } from './composables/useTimesheet';

  // Panggil Logic dari Composable
  const {
    employee, regularTasks, overtimeTasks,
    isDarkMode, isLoading, htmlContent, scale, enhancingId,
    enhanceDescription, isWeekend, autoFillLink, toggleDarkMode,
    addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
    loadPreview, printFromIframe
  } = useTimesheet();

  // Style Variables (Tetap di sini karena berkaitan dengan tampilan)
  const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:bg-slate-600 dark:placeholder-slate-500";
  const labelClass = "text-[10px] text-slate-400 font-bold ml-1 dark:text-slate-500";
</script>
  
<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-slate-100 dark:bg-slate-900 font-sans md:overflow-hidden overflow-auto transition-colors duration-300">
      
    <aside class="w-full md:w-96 bg-white dark:bg-slate-800 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col z-20 shadow-xl flex-shrink-0 relative transition-colors duration-300">
        
      <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-30 md:static transition-colors">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-slate-900 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
            <h1 class="font-bold text-slate-800 dark:text-white text-lg leading-tight">Timesheet</h1>
            <p class="text-xs text-slate-400 font-medium">Auto-Save & AI Ready ✨</p>
            </div>
        </div>
        <button @click="toggleDarkMode" class="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>
      </div>
  
      <div class="flex-1 p-6 space-y-8 md:overflow-y-auto">
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b dark:border-slate-700 pb-1">Informasi Karyawan</h3>
          <div class="space-y-2">
            <input v-model="employee.name" type="text" placeholder="Nama Karyawan" :class="inputClass" />
            <input v-model="employee.no" type="text" placeholder="NIK" :class="inputClass" />
            <input v-model="employee.clientSite" type="text" placeholder="Client Site" :class="inputClass" />
            <input v-model="employee.workUnit" type="text" placeholder="Work Unit" :class="inputClass" />
            <div class="grid grid-cols-2 gap-2">
                <input v-model="employee.squad" type="text" placeholder="Squad" :class="inputClass" />
                <input v-model="employee.month" type="text" placeholder="Month (Auto)" :class="inputClass + ' bg-blue-50 text-blue-700 font-semibold dark:bg-slate-700 dark:text-blue-400'" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b dark:border-slate-700 pb-1">Approval</h3>
          <div class="space-y-2">
            <input v-model="employee.deptHead" type="text" placeholder="Dept Head Name" :class="inputClass" />
            <input v-model="employee.supervisor" type="text" placeholder="Supervisor Name" :class="inputClass" />
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b dark:border-slate-700 pb-1">Periode Timesheet</h3>
          <div class="grid grid-cols-2 gap-2">
            <div><label :class="labelClass">Mulai</label><input v-model="employee.periodStart" type="date" :class="inputClass" /></div>
            <div><label :class="labelClass">Selesai</label><input v-model="employee.periodEnd" type="date" :class="inputClass" /></div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center border-b dark:border-slate-700 pb-1">
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">A. Regular (Harian)</h3>
            <button @click="addRegularRow" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-slate-600 font-bold transition">+ Tambah</button>
          </div>
          
          <div v-if="regularTasks.length === 0" class="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed dark:border-slate-700">
            Belum ada data regular.
          </div>

          <div v-else class="space-y-4">
            <div v-for="(task, index) in regularTasks" :key="index" 
                class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative group hover:border-blue-300 dark:hover:border-blue-500 transition-colors shadow-sm"
                :class="{'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/10': isWeekend(task.date)}"
            >
              <button @click="removeRegularRow(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div class="space-y-2">
                <div>
                    <div class="flex justify-between"><label v-if="isWeekend(task.date)" class="text-[9px] text-red-500 font-bold mb-1">⚠️ Weekend</label></div>
                    <input v-model="task.date" type="date" :class="[inputClass, 'w-full md:w-36', isWeekend(task.date) ? 'text-red-600 font-semibold dark:text-red-400' : '']" />
                </div>

                <div class="relative">
                    <textarea v-model="task.description" rows="2" placeholder="Deskripsi (ex: meeting bahas api)" :class="inputClass + ' resize-none pr-8'"></textarea>
                    <button @click="enhanceDescription(index, 'regular')" class="absolute top-2 right-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition" title="Perbaiki bahasa dengan AI" :disabled="enhancingId === `regular-${index}`">
                        <svg v-if="enhancingId === `regular-${index}`" class="animate-spin h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/></svg>
                    </button>
                </div>

                <div class="grid grid-cols-2 gap-2">
                   <div><label :class="labelClass">No. Tiket (BATB)</label><input v-model="task.ticketNumber" @input="autoFillLink(task)" type="text" placeholder="BATB-XXXX" :class="inputClass" /></div>
                   <div><label :class="labelClass">Link JIRA</label><input v-model="task.ticketLink" type="text" placeholder="Auto-generated..." :class="inputClass" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center border-b dark:border-slate-700 pb-1">
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">B. Overtime (Lembur)</h3>
            <button @click="addOvertimeRow" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-slate-600 font-bold transition">+ Tambah</button>
          </div>
          
          <div v-if="overtimeTasks.length === 0" class="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed dark:border-slate-700">
            Belum ada data lembur.
          </div>

          <div v-else class="space-y-4">
            <div v-for="(task, index) in overtimeTasks" :key="index" 
                class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative group hover:border-blue-300 dark:hover:border-blue-500 transition-colors shadow-sm"
                :class="{'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/10': isWeekend(task.date)}"
            >
              <button @click="removeOvertimeRow(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div class="space-y-2">
                <div class="flex gap-2">
                    <div class="w-2/3">
                        <label v-if="isWeekend(task.date)" class="text-[9px] text-red-500 font-bold mb-1 ml-1">⚠️ Weekend</label>
                        <label v-else :class="labelClass">Tanggal</label>
                        <input v-model="task.date" type="date" :class="[inputClass, isWeekend(task.date) ? 'text-red-600 font-semibold dark:text-red-400' : '']" />
                    </div>
                    <div class="w-1/3"><label :class="labelClass">Jam</label><input v-model="task.duration" type="number" step="0.5" :class="inputClass + ' text-center'" placeholder="Jam" /></div>
                </div>
                
                <div class="relative">
                    <textarea v-model="task.description" rows="2" placeholder="Deskripsi Lembur" :class="inputClass + ' resize-none pr-8'"></textarea>
                    <button @click="enhanceDescription(index, 'overtime')" class="absolute top-2 right-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition" title="Perbaiki bahasa dengan AI" :disabled="enhancingId === `overtime-${index}`">
                        <svg v-if="enhancingId === `overtime-${index}`" class="animate-spin h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/></svg>
                    </button>
                </div>
                
                <div><label :class="labelClass">Link JIRA</label><input v-model="task.ticketLink" type="text" placeholder="https://..." :class="inputClass" /></div>
                <input v-model="task.remarks" type="text" placeholder="No. Surat Tugas" :class="inputClass" />
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div class="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 z-30 md:static transition-colors">
        <button @click="loadPreview" :disabled="isLoading" class="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 shadow-lg">
          <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span v-else>Generate Preview</span>
        </button>
      </div>
    </aside>
  
    <main class="flex-1 flex flex-col bg-slate-100/50 dark:bg-slate-900 min-w-0 md:h-screen transition-colors">
      <header class="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 sticky top-0 transition-colors">
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-slate-600 dark:text-slate-300 hidden md:inline">Document Preview</span>
          <span class="text-sm font-semibold text-slate-600 dark:text-slate-300 md:hidden">Preview</span>
          <span class="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded text-[10px] font-bold">ZOOM: {{ Math.round(scale * 100) }}%</span>
        </div>
        <button @click="printFromIframe" :disabled="!htmlContent" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50">
           Save PDF
        </button>
      </header>
  
      <div ref="previewContainer" class="flex-1 overflow-hidden p-4 md:p-8 flex justify-center items-start bg-slate-200/50 dark:bg-slate-950/50 min-h-[500px] transition-colors">
        <div v-if="htmlContent" class="relative shadow-2xl transition-transform duration-300 ease-out origin-top" :style="{ transform: `scale(${scale})` }">
          <iframe id="preview-frame" :srcdoc="htmlContent" title="PDF Preview" class="bg-white block" style="width: 1123px; height: 794px; border: none;"></iframe>
        </div>
        <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 opacity-60 text-center">
           <p class="text-sm">Isi form di samping / atas.<br>Gunakan Magic ✨ untuk deskripsi.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
  body { margin: 0; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  .dark ::-webkit-scrollbar-thumb { background: #475569; }
  .dark ::-webkit-scrollbar-thumb:hover { background: #64748b; }
</style>