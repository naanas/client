<script setup lang="ts">
    import { useTimesheet } from '../composables/useTimesheet';
    import { useAuth } from '../composables/useAuth';
    import { onMounted } from 'vue';
    
    
    const { user, handleLogout } = useAuth();
    
    const {
      employee, regularTasks, overtimeTasks,
      isDarkMode, isLoading, htmlContent, 
      scale, zoomIn, zoomOut, fitScreen,
      previewContainer, // Variabel ini WAJIB ada disini karena dipakai di template (ref="previewContainer")
      enhancingId, isAppLoading,
      assigneeList, fetchAssignees, 
      isSyncing, isRefreshing, syncData, 
      enhanceDescription, isWeekend, autoFillLink, toggleDarkMode,
      addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
      loadPreview, printFromIframe
    } = useTimesheet();
    
    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:bg-slate-600 dark:placeholder-slate-500";
    const labelClass = "text-[10px] text-slate-400 font-bold ml-1 dark:text-slate-500";
    onMounted(() => {
    if (previewContainer.value) {
        console.log("Canvas Ready"); // Ini cuma trik biar dianggap "Used"
    }
});
</script>
    
    <template>
      <div class="flex flex-col md:flex-row min-h-screen bg-slate-100 dark:bg-slate-900 font-sans md:overflow-hidden overflow-auto transition-colors duration-300 relative">
            
        <Transition name="fade">
            <div v-if="isAppLoading" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
                <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p class="text-xs text-slate-400 font-medium">Menyiapkan Workspace...</p>
            </div>
        </Transition>
    
        <aside class="w-full md:w-96 bg-white dark:bg-slate-800 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col z-20 shadow-xl flex-shrink-0 relative transition-colors duration-300">
            
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-30 md:static transition-colors">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-slate-900 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg transition-colors">T</div>
                        <div>
                            <h1 class="font-bold text-slate-800 dark:text-white text-lg leading-tight">Timesheet</h1>
                            <div class="flex items-center gap-1.5 mt-0.5">
                                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px]">{{ user?.email }}</span>
                            </div>
                        </div>
                    </div>
                    <button @click="handleLogout" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Logout">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    </button>
                </div>
                
                <div class="flex justify-end">
                    <button @click="toggleDarkMode" class="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
                    {{ isDarkMode ? '☀️ LIGHT MODE' : '🌙 DARK MODE' }}
                    </button>
                </div>
            </div>
    
            <div class="flex-1 p-6 space-y-8 md:overflow-y-auto">
                
                <div class="space-y-4">
                    <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b dark:border-slate-700 pb-1">Informasi Karyawan</h3>
                    <div class="space-y-2">
                        
                        <div class="space-y-1">
                            <div class="flex justify-between items-center">
                                <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500">NAMA ASSIGNEE (Dari DB)</label>
                                
                                <div class="flex gap-2">
                                    <button 
                                        @click="syncData" 
                                        :disabled="isSyncing" 
                                        class="text-[9px] font-bold flex items-center gap-1 disabled:opacity-50 transition-all active:scale-95"
                                        :class="isSyncing ? 'text-green-500 cursor-wait' : 'text-green-600 hover:text-green-700'"
                                    >
                                        <svg v-if="isSyncing" class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span v-else>⬇</span>
                                        {{ isSyncing ? 'Syncing...' : 'Sync DB' }}
                                    </button>
                                    
                                    <button 
                                        @click="fetchAssignees" 
                                        :disabled="isRefreshing"
                                        class="text-[9px] text-blue-500 hover:underline flex items-center gap-1"
                                    >
                                        <svg v-if="isRefreshing" class="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                        {{ isRefreshing ? 'Loading...' : 'Refresh List' }}
                                    </button>
                                </div>
                            </div>
    
                            <div class="relative">
                                <select v-model="employee.name" :class="inputClass + ' appearance-none cursor-pointer'">
                                    <option value="" disabled>-- Pilih Assignee --</option>
                                    <option v-for="name in assigneeList" :key="name" :value="name">
                                        {{ name }}
                                    </option>
                                </select>
                                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
    
                        <div class="space-y-1">
                            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Nama Lengkap (Ditampilkan di PDF)</label>
                            <input 
                                v-model="employee.reportName" 
                                type="text" 
                                placeholder="Ketik Nama Lengkap & Gelar..." 
                                :class="inputClass + ' border-blue-200 focus:ring-blue-400 font-semibold text-slate-900 dark:text-white'" 
                            />
                        </div>
    
                        <input v-model="employee.no" type="text" placeholder="NIK" :class="inputClass" />
                        <input v-model="employee.clientSite" type="text" placeholder="Client Site" :class="inputClass" />
                        <input v-model="employee.workUnit" type="text" placeholder="Work Unit" :class="inputClass" />
                        <div class="grid grid-cols-2 gap-2">
                            <input v-model="employee.squad" type="text" placeholder="Squad" :class="inputClass" />
                            <input v-model="employee.month" type="text" placeholder="Month" :class="inputClass + ' bg-blue-50 text-blue-700 font-semibold dark:bg-slate-700 dark:text-blue-400'" />
                        </div>
                    </div>
                </div>
    
                <div class="space-y-4">
                    <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b dark:border-slate-700 pb-1">Approval</h3>
                    <div class="space-y-2">
                        <input v-model="employee.deptHead" type="text" placeholder="Dept Head" :class="inputClass" />
                        <input v-model="employee.supervisor" type="text" placeholder="Supervisor" :class="inputClass" />
                    </div>
                </div>
    
                <div class="space-y-4">
                    <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b dark:border-slate-700 pb-1">Periode</h3>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label :class="labelClass">Mulai</label><input v-model="employee.periodStart" type="date" :class="inputClass" /></div>
                        <div><label :class="labelClass">Selesai</label><input v-model="employee.periodEnd" type="date" :class="inputClass" /></div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="flex justify-between items-center border-b dark:border-slate-700 pb-1">
                        <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">A. Tambahan Manual</h3>
                        <button @click="addRegularRow" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-slate-600 font-bold">+ Tambah</button>
                    </div>
                    
                    <div v-if="regularTasks.length === 0" class="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed dark:border-slate-700">
                        Tidak ada input manual.
                    </div>
                    <div v-else class="space-y-4">
                        <div v-for="(task, index) in regularTasks" :key="index" class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative group" :class="{'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/10': isWeekend(task.date)}">
                            <button @click="removeRegularRow(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            <div class="space-y-2">
                                <div><label v-if="isWeekend(task.date)" class="text-[9px] text-red-500 font-bold mb-1">⚠️ Weekend</label><input v-model="task.date" type="date" :class="[inputClass, 'w-full md:w-36', isWeekend(task.date) ? 'text-red-600 font-semibold dark:text-red-400' : '']" /></div>
                                
                                <div class="relative">
                                    <textarea 
                                        v-model="task.description" 
                                        rows="2" 
                                        placeholder="Deskripsi" 
                                        :class="[
                                            inputClass, 
                                            'resize-none pr-8',
                                            enhancingId === `regular-${index}` ? 'animate-pulse border-purple-400 ring-1 ring-purple-400' : ''
                                        ]"
                                    ></textarea>
                                    
                                    <button @click="enhanceDescription(index, 'regular')" class="absolute top-2 right-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition p-1" :disabled="enhancingId === `regular-${index}`" title="Perbaiki Bahasa dengan AI">
                                        <svg v-if="enhancingId === `regular-${index}`" class="animate-spin h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/></svg>
                                    </button>
                                </div>
    
                                <div class="grid grid-cols-2 gap-2"><div><label :class="labelClass">No. Tiket</label><input v-model="task.ticketNumber" @input="autoFillLink(task)" type="text" :class="inputClass" /></div><div><label :class="labelClass">Link JIRA</label><input v-model="task.ticketLink" type="text" :class="inputClass" /></div></div>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div class="space-y-4">
                    <div class="flex justify-between items-center border-b dark:border-slate-700 pb-1">
                        <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">B. Overtime</h3>
                        <button @click="addOvertimeRow" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-slate-600 font-bold">+ Tambah</button>
                    </div>
                    
                    <div v-if="overtimeTasks.length === 0" class="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed dark:border-slate-700">
                        Belum ada data lembur.
                    </div>
                    <div v-else class="space-y-4">
                        <div v-for="(task, index) in overtimeTasks" :key="index" class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative group" :class="{'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/10': isWeekend(task.date)}">
                            <button @click="removeOvertimeRow(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            <div class="space-y-2">
                                <div class="flex gap-2"><div class="w-2/3"><label v-if="isWeekend(task.date)" class="text-[9px] text-red-500 font-bold mb-1 ml-1">⚠️ Weekend</label><input v-model="task.date" type="date" :class="[inputClass, isWeekend(task.date) ? 'text-red-600 font-semibold dark:text-red-400' : '']" /></div><div class="w-1/3"><input v-model="task.duration" type="number" step="0.5" :class="inputClass + ' text-center'" placeholder="Jam" /></div></div>
                                
                                <div class="relative">
                                    <textarea 
                                        v-model="task.description" 
                                        rows="2" 
                                        placeholder="Deskripsi Lembur" 
                                        :class="[
                                            inputClass, 
                                            'resize-none pr-8',
                                            enhancingId === `overtime-${index}` ? 'animate-pulse border-purple-400 ring-1 ring-purple-400' : ''
                                        ]"
                                    ></textarea>
                                    
                                    <button @click="enhanceDescription(index, 'overtime')" class="absolute top-2 right-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition p-1" :disabled="enhancingId === `overtime-${index}`" title="Perbaiki Bahasa dengan AI">
                                        <svg v-if="enhancingId === `overtime-${index}`" class="animate-spin h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/></svg>
                                    </button>
                                </div>
    
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
                <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button @click="zoomOut" class="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-200 shadow-sm hover:bg-slate-50 font-bold">-</button>
                    <input type="range" min="0.3" max="1.5" step="0.1" v-model.number="scale" class="w-20 md:w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600">
                    <button @click="zoomIn" class="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-200 shadow-sm hover:bg-slate-50 font-bold">+</button>
                    <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-8 text-center">{{ Math.round(scale * 100) }}%</span>
                    <button @click="fitScreen" class="hidden md:block px-2 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 rounded ml-1 hover:bg-blue-100">FIT</button>
                </div>
                <button @click="printFromIframe" :disabled="!htmlContent" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50">Save PDF</button>
            </header>
            
            <div ref="previewContainer" class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 flex justify-center items-start bg-slate-200/50 dark:bg-slate-950/50 min-h-[500px] transition-colors relative">
                <div v-if="htmlContent" class="bg-white shadow-2xl transition-transform duration-200 origin-top-center" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '1123px', height: '794px', flexShrink: 0 }">
                    <iframe id="preview-frame" :srcdoc="htmlContent" title="PDF Preview" class="block w-full h-full border-none"></iframe>
                </div>
                <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 opacity-60 text-center mt-20"><p class="text-sm">Isi form di samping / atas.<br>Gunakan Magic ✨ untuk deskripsi.</p></div>
            </div>
        </main>
      </div>
    </template>
    
    <style scoped>
    .fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
    .fade-enter-from, .fade-leave-to { opacity: 0; }
    </style>