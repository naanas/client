<script setup lang="ts">
import { onMounted } from 'vue';
import { useTimesheet } from '../../composables/useTimesheet';

const {
  employee, regularTasks, overtimeTasks,
  assigneeList, isSyncing, isAssigneeLoading,
  syncData, fetchAssignees,
  enhanceDescription, enhancingId, isWeekend, autoFillLink,
  addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
  downloadExcel,     // Fitur Excel
  payAndExportPdf,   // Fitur Xendit
  isPaymentLoading   // Loading State
} = useTimesheet();

const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:bg-slate-600 dark:placeholder-slate-500";
const labelClass = "text-[10px] text-slate-400 font-bold ml-1 dark:text-slate-500 uppercase";

onMounted(() => {
    fetchAssignees();
});
</script>

<template>
  <div class="pb-20 space-y-8 animate-fade-in">
    
    <div class="flex flex-col items-center justify-between gap-4 p-4 border border-blue-100 bg-blue-50 dark:bg-blue-900/20 rounded-xl dark:border-blue-800 md:flex-row">
        <div class="flex items-center w-full gap-3 md:w-auto">
            <div class="p-2 text-blue-600 bg-blue-100 rounded-lg dark:bg-blue-800 dark:text-blue-200">📄</div>
            <div>
                <h3 class="text-xs font-bold text-blue-700 dark:text-blue-300">Mandays Report</h3>
                <p class="text-[10px] text-blue-600 dark:text-blue-400">Laporan aktivitas vertikal (Classic Format).</p>
            </div>
        </div>

        <div class="flex items-center w-full gap-2 md:w-auto">
            <button 
                @click="downloadExcel('mandays')" 
                class="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-xs font-bold text-white transition bg-green-600 rounded-lg shadow md:flex-none hover:bg-green-700"
                title="Download Format Excel (.xlsx)"
            >
                <span>📊</span> Excel
            </button>
            
            <button 
                @click="payAndExportPdf('mandays')"
                :disabled="isPaymentLoading"
                class="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-xs font-bold text-white transition bg-purple-600 rounded-lg shadow md:flex-none hover:bg-purple-700 disabled:opacity-50"
                title="Bayar & Kirim PDF ke Email"
            >
                <span v-if="isPaymentLoading" class="animate-spin">⏳</span>
                <span v-else>💳</span>
                PDF (Email)
            </button>
        </div>
    </div>

    <div class="space-y-4">
        <h3 class="pb-1 text-xs font-bold tracking-wider uppercase border-b text-slate-400 dark:text-slate-500 dark:border-slate-700">Data Karyawan</h3>
        <div class="p-4 space-y-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div class="space-y-1">
                <div class="flex items-center justify-between">
                    <label :class="labelClass">Nama Assignee</label>
                    <div class="flex items-center gap-2">
                        <button @click="syncData" :disabled="isSyncing" class="text-[9px] font-bold text-green-600 hover:underline disabled:opacity-50 flex items-center gap-1">
                            <span v-if="isSyncing" class="animate-spin">⏳</span>
                            <span v-else>🔄</span>
                            Sync DB
                        </button>
                        <span class="text-slate-300">|</span>
                        <button @click="fetchAssignees" :disabled="isAssigneeLoading" class="text-[9px] text-blue-500 hover:underline flex items-center gap-1">
                            <svg v-if="isAssigneeLoading" class="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            {{ isAssigneeLoading ? 'Loading...' : 'Refresh' }}
                        </button>
                    </div>
                </div>
                
                <div class="relative">
                    <select v-model="employee.name" :disabled="isAssigneeLoading" :class="[inputClass, isAssigneeLoading ? 'bg-slate-100 text-slate-400' : '']">
                        <option value="" disabled>-- Pilih Nama --</option>
                        <option v-for="name in assigneeList" :key="name" :value="name">{{ name }}</option>
                    </select>
                    <div v-if="isAssigneeLoading" class="absolute inset-y-0 flex items-center pointer-events-none right-8">
                        <svg class="w-4 h-4 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                </div>
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
        <div class="flex items-center justify-between pb-1 border-b dark:border-slate-700">
            <h3 class="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">A. Daily Activity</h3>
            <button @click="addRegularRow" class="text-[10px] bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 font-bold transition">+ Task</button>
        </div>
        
        <div v-if="regularTasks.length === 0" class="py-6 text-xs text-center border border-dashed rounded-lg text-slate-400 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">Belum ada task.</div>
        
        <div v-for="(task, index) in regularTasks" :key="index" class="relative p-3 transition bg-white border rounded-lg shadow-sm dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md">
            <button @click="removeRegularRow(index)" class="absolute flex items-center justify-center w-5 h-5 text-red-500 bg-white border rounded-full shadow -top-2 -right-2 dark:bg-slate-700 border-slate-200 hover:bg-red-50">×</button>
            <div class="space-y-2">
                <div class="flex gap-2">
                    <input v-model="task.date" type="date" :class="[inputClass, 'w-1/3', isWeekend(task.date) ? 'text-red-500 font-bold bg-red-50 dark:bg-red-900/10' : '']" />
                    <input v-model="task.ticketNumber" @blur="autoFillLink(task)" type="text" placeholder="Jira Ticket (No Only)" :class="inputClass" class="w-1/3" />
                    <input v-model="task.ticketLink" type="text" placeholder="Link Jira" :class="inputClass" class="w-1/3" />
                </div>
                <div class="relative">
                    <textarea v-model="task.description" rows="2" placeholder="Deskripsi pekerjaan..." :class="[inputClass, 'pr-8']"></textarea>
                    
                    <button @click="enhanceDescription(index, 'regular')" class="absolute p-1 transition-all rounded-md top-2 right-2 hover:bg-purple-100" title="Perbaiki Bahasa (AI)">
                        <svg v-if="enhancingId === `regular-${index}`" class="w-4 h-4 text-purple-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span v-else class="text-xs text-purple-500">✨</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <div class="flex items-center justify-between pb-1 border-b dark:border-slate-700">
            <h3 class="text-xs font-bold uppercase text-slate-400">B. Overtime</h3>
            <button @click="addOvertimeRow" class="text-[10px] bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 font-bold transition">+ OT</button>
        </div>
        <div v-for="(task, index) in overtimeTasks" :key="index" class="relative p-3 bg-white border rounded-lg shadow-sm dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <button @click="removeOvertimeRow(index)" class="absolute flex items-center justify-center w-5 h-5 text-red-500 bg-white border rounded-full shadow -top-2 -right-2 dark:bg-slate-700 border-slate-200 hover:bg-red-50">×</button>
            <div class="space-y-2">
                <div class="flex gap-2">
                    <input v-model="task.date" type="date" :class="inputClass" class="w-1/3" />
                    <input v-model="task.duration" type="number" step="0.5" placeholder="Jam" :class="inputClass" class="w-20 text-center" />
                    <input v-model="task.ticketLink" type="text" placeholder="Link Jira" :class="inputClass" class="flex-1" />
                </div>
                <div class="relative">
                    <input v-model="task.description" type="text" placeholder="Keterangan Lembur" :class="inputClass" />
                    <button @click="enhanceDescription(index, 'overtime')" class="absolute top-1.5 right-2 text-purple-500">
                         <svg v-if="enhancingId === `overtime-${index}`" class="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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