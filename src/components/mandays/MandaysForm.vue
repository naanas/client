<script setup lang="ts">
    import { useTimesheet } from '../../composables/useTimesheet';
    
    const {
      employee, regularTasks, overtimeTasks,
      assigneeList, isSyncing, isRefreshing, syncData, fetchAssignees,
      enhanceDescription, enhancingId, isWeekend, autoFillLink,
      addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
    } = useTimesheet();
    
    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:bg-slate-600 dark:placeholder-slate-500";
    const labelClass = "text-[10px] text-slate-400 font-bold ml-1 dark:text-slate-500 uppercase";
    </script>
    
    <template>
      <div class="space-y-8 animate-fade-in pb-20">
        
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 rounded-lg">📄</div>
            <div>
                <h3 class="text-xs font-bold text-blue-700 dark:text-blue-300">Mandays Report</h3>
                <p class="text-[10px] text-blue-600 dark:text-blue-400">Laporan aktivitas vertikal (Classic Format).</p>
            </div>
        </div>
    
        <div class="space-y-4">
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b dark:border-slate-700 pb-1">Data Karyawan</h3>
            <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                <div class="space-y-1">
                    <div class="flex justify-between items-center">
                        <label :class="labelClass">Nama Assignee</label>
                        <div class="flex gap-2">
                            <button @click="syncData" :disabled="isSyncing" class="text-[9px] font-bold text-green-600 hover:underline disabled:opacity-50">🔄 Sync DB</button>
                            <button @click="fetchAssignees" :disabled="isRefreshing" class="text-[9px] text-blue-500 hover:underline">Refresh</button>
                        </div>
                    </div>
                    <select v-model="employee.name" :class="inputClass"><option value="" disabled>-- Pilih Nama --</option><option v-for="name in assigneeList" :key="name" :value="name">{{ name }}</option></select>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div><label :class="labelClass">NIK</label><input v-model="employee.no" type="text" :class="inputClass" /></div>
                    <div><label :class="labelClass">Squad</label><input v-model="employee.squad" type="text" :class="inputClass" /></div>
                    <div><label :class="labelClass">Dept Head</label><input v-model="employee.deptHead" type="text" :class="inputClass" /></div>
                    <div><label :class="labelClass">Supervisor</label><input v-model="employee.supervisor" type="text" :class="inputClass" /></div>
                </div>
            </div>
        </div>
    
        <div class="space-y-4">
            <div class="flex justify-between items-center border-b dark:border-slate-700 pb-1">
                <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">A. Daily Activity</h3>
                <button @click="addRegularRow" class="text-[10px] bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 font-bold transition">+ Task</button>
            </div>
            
            <div v-if="regularTasks.length === 0" class="text-center py-6 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed">Belum ada task.</div>
            
            <div v-for="(task, index) in regularTasks" :key="index" class="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative shadow-sm">
                <button @click="removeRegularRow(index)" class="absolute -top-2 -right-2 bg-white dark:bg-slate-700 text-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow border border-slate-200 hover:bg-red-50">×</button>
                <div class="space-y-2">
                    <div class="flex gap-2">
                        <input v-model="task.date" type="date" :class="[inputClass, 'w-1/3', isWeekend(task.date) ? 'text-red-500 font-bold' : '']" />
                        <input v-model="task.ticketNumber" @blur="autoFillLink(task)" type="text" placeholder="Jira Ticket (No Only)" :class="inputClass" class="w-1/3" />
                        <input v-model="task.ticketLink" type="text" placeholder="Link Jira" :class="inputClass" class="w-1/3" />
                    </div>
                    <div class="relative">
                        <textarea v-model="task.description" rows="2" placeholder="Deskripsi pekerjaan..." :class="[inputClass, 'pr-8']"></textarea>
                        
                        <button @click="enhanceDescription(index, 'regular')" class="absolute top-2 right-2 p-1 rounded-md transition-all hover:bg-purple-100" title="Perbaiki Bahasa (AI)">
                            <svg v-if="enhancingId === `regular-${index}`" class="animate-spin h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span v-else class="text-purple-500 text-xs">✨</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
        <div class="space-y-4">
            <div class="flex justify-between items-center border-b dark:border-slate-700 pb-1">
                <h3 class="text-xs font-bold text-slate-400 uppercase">B. Overtime</h3>
                <button @click="addOvertimeRow" class="text-[10px] bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 font-bold transition">+ OT</button>
            </div>
            <div v-for="(task, index) in overtimeTasks" :key="index" class="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative shadow-sm">
                <button @click="removeOvertimeRow(index)" class="absolute -top-2 -right-2 bg-white dark:bg-slate-700 text-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow border border-slate-200 hover:bg-red-50">×</button>
                <div class="space-y-2">
                    <div class="flex gap-2">
                        <input v-model="task.date" type="date" :class="inputClass" class="w-1/3" />
                        <input v-model="task.duration" type="number" step="0.5" placeholder="Jam" :class="inputClass" class="w-20 text-center" />
                        <input v-model="task.ticketLink" type="text" placeholder="Link Jira" :class="inputClass" class="flex-1" />
                    </div>
                    <div class="relative">
                        <input v-model="task.description" type="text" placeholder="Keterangan Lembur" :class="inputClass" />
                        <button @click="enhanceDescription(index, 'overtime')" class="absolute top-1.5 right-2 text-purple-500">
                             <svg v-if="enhancingId === `overtime-${index}`" class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             <span v-else class="text-[10px]">✨</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    
      </div>
    </template>
    
    <style scoped>
    .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    </style>