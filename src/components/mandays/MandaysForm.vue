<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useTimesheet } from '../../composables/useTimesheet';

const {
  employee, regularTasks, overtimeTasks,
  assigneeList, isSyncing, isAssigneeLoading,
  syncData, fetchAssignees,
  enhanceDescription, enhancingId, isWeekend, autoFillLink,
  addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
  downloadExcel, isDarkMode // Ambil isDarkMode
} = useTimesheet();

// Dynamic Input Style based on Mode
const inputClass = computed(() => isDarkMode.value 
  ? "w-full px-2 py-2 bg-neutral-900/50 border-b border-red-900/30 text-stone-300 focus:border-red-600 focus:bg-neutral-900 focus:outline-none transition-all placeholder:text-stone-700 font-serif rounded-t-sm"
  : "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
);

// Dynamic Label Style
const labelClass = computed(() => isDarkMode.value
  ? "text-[10px] text-red-800 font-bold ml-1 uppercase tracking-[0.2em] font-cinzel"
  : "text-[10px] text-slate-400 font-bold ml-1 uppercase"
);

onMounted(() => {
    fetchAssignees();
});
</script>

<template>
  <div class="pb-20 space-y-8 animate-fade-in">
    
    <div :class="['flex flex-col items-center justify-between gap-4 p-4 border rounded-xl transition-colors', 
        isDarkMode ? 'bg-neutral-900 border-red-900/30' : 'bg-blue-50 border-blue-100']">
        
        <div class="flex items-center w-full gap-3 md:w-auto">
            <div :class="['p-2 rounded-lg text-lg', isDarkMode ? 'bg-black text-red-600 border border-red-900' : 'bg-blue-100 text-blue-600']">
                {{ isDarkMode ? '💀' : '📄' }}
            </div>
            <div>
                <h3 :class="['text-xs font-bold', isDarkMode ? 'text-red-500 font-cinzel tracking-widest' : 'text-blue-700']">
                    {{ isDarkMode ? 'MANDAYS MANIFESTATION' : 'Mandays Report' }}
                </h3>
                <p :class="['text-[10px]', isDarkMode ? 'text-stone-500 font-serif italic' : 'text-blue-600']">
                    {{ isDarkMode ? 'Record the vertical sacrifices.' : 'Laporan aktivitas vertikal (Classic Format).' }}
                </p>
            </div>
        </div>

        <div class="flex items-center w-full gap-2 md:w-auto">
            <button 
                @click="downloadExcel('mandays')" 
                :class="['flex items-center justify-center flex-1 gap-2 px-3 py-2 text-xs font-bold text-white transition rounded-lg shadow md:flex-none', 
                   isDarkMode ? 'bg-stone-900 hover:bg-stone-800 border border-stone-700 font-cinzel tracking-wider' : 'bg-green-600 hover:bg-green-700']"
                title="Download Format Excel (.xlsx)"
            >
                <span>📊</span> {{ isDarkMode ? 'RAW DATA' : 'Excel' }}
            </button>
        </div>
    </div>

    <div class="space-y-4">
        <h3 :class="['pb-1 text-xs font-bold tracking-wider uppercase border-b', isDarkMode ? 'text-stone-500 border-red-900/30 font-cinzel' : 'text-slate-400 border-slate-200']">
            {{ isDarkMode ? 'VESSEL IDENTITY' : 'Data Karyawan' }}
        </h3>
        
        <div :class="['p-4 space-y-4 border rounded-lg transition-colors', isDarkMode ? 'bg-black/40 border-red-900/20' : 'bg-white border-slate-200']">
            
            <div class="space-y-1">
                <div class="flex items-center justify-between">
                    <label :class="labelClass">{{ isDarkMode ? 'Vessel Name' : 'Nama Assignee' }}</label>
                    <div class="flex items-center gap-2">
                        <button @click="syncData" :disabled="isSyncing" 
                            :class="['text-[9px] font-bold flex items-center gap-1 hover:underline disabled:opacity-50', isDarkMode ? 'text-indigo-400' : 'text-green-600']">
                            <span v-if="isSyncing" class="animate-spin">⏳</span>
                            <span v-else>🔄</span>
                            {{ isDarkMode ? 'INVOKE DB' : 'Sync DB' }}
                        </button>
                        <span :class="isDarkMode ? 'text-stone-700' : 'text-slate-300'">|</span>
                        <button @click="fetchAssignees" :disabled="isAssigneeLoading" 
                            :class="['text-[9px] flex items-center gap-1 hover:underline', isDarkMode ? 'text-red-500' : 'text-blue-500']">
                            <svg v-if="isAssigneeLoading" class="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            {{ isAssigneeLoading ? 'Loading...' : (isDarkMode ? 'REFRESH SOULS' : 'Refresh') }}
                        </button>
                    </div>
                </div>
                
                <div class="relative">
                    <select v-model="employee.name" :disabled="isAssigneeLoading" :class="[inputClass, isAssigneeLoading ? 'opacity-50' : '']">
                        <option value="" disabled>-- {{ isDarkMode ? 'Select Soul' : 'Pilih Nama' }} --</option>
                        <option v-for="name in assigneeList" :key="name" :value="name">{{ name }}</option>
                    </select>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div><label :class="labelClass">{{ isDarkMode ? 'Identification (NIK)' : 'NIK' }}</label><input v-model="employee.no" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">{{ isDarkMode ? 'Legion (Squad)' : 'Squad' }}</label><input v-model="employee.squad" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">{{ isDarkMode ? 'Overlord (Dept Head)' : 'Dept Head' }}</label><input v-model="employee.deptHead" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">{{ isDarkMode ? 'Watcher (SPV)' : 'Supervisor' }}</label><input v-model="employee.supervisor" type="text" :class="inputClass" /></div>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <div :class="['flex items-center justify-between pb-1 border-b', isDarkMode ? 'border-red-900/30' : 'border-slate-200']">
            <h3 :class="['text-xs font-bold tracking-wider uppercase', isDarkMode ? 'text-stone-500 font-cinzel' : 'text-slate-400']">
                A. {{ isDarkMode ? 'Daily Rituals' : 'Daily Activity' }}
            </h3>
            <button @click="addRegularRow" 
                :class="['text-[10px] px-3 py-1.5 rounded font-bold transition', 
                isDarkMode ? 'bg-red-950 text-red-500 border border-red-900 hover:bg-red-900' : 'bg-blue-100 text-blue-700 hover:bg-blue-200']">
                {{ isDarkMode ? '+ INSCRIPTION' : '+ Task' }}
            </button>
        </div>
        
        <div v-if="regularTasks.length === 0" 
            :class="['py-6 text-xs text-center border border-dashed rounded-lg', 
            isDarkMode ? 'text-stone-600 border-red-900/20 bg-black/20 italic font-serif' : 'text-slate-400 bg-slate-50']">
            {{ isDarkMode ? 'The parchment is blank. Add a ritual.' : 'Belum ada task.' }}
        </div>
        
        <div v-for="(task, index) in regularTasks" :key="index" 
            :class="['relative p-3 transition border rounded-lg shadow-sm group', 
            isDarkMode ? 'bg-neutral-900/40 border-red-900/20 hover:border-red-700 hover:bg-black' : 'bg-white border-slate-200 hover:shadow-md']">
            
            <button @click="removeRegularRow(index)" 
                :class="['absolute flex items-center justify-center w-5 h-5 rounded-full shadow -top-2 -right-2 transition', 
                isDarkMode ? 'bg-black text-red-600 border border-red-900 hover:bg-red-900 hover:text-white' : 'text-red-500 bg-white border border-slate-200 hover:bg-red-50']">
                ×
            </button>

            <div class="space-y-3">
                <div class="flex gap-3">
                    <input v-model="task.date" type="date" 
                        :class="[inputClass, 'w-1/3', isWeekend(task.date) ? (isDarkMode ? 'text-red-500 font-bold bg-red-900/10' : 'text-red-500 font-bold bg-red-50') : '']" />
                    
                    <input v-model="task.ticketNumber" @blur="autoFillLink(task)" type="text" :placeholder="isDarkMode ? 'Sigil (ID)' : 'Jira Ticket'" :class="[inputClass, 'w-1/3 uppercase font-mono']" />
                    
                    <input v-model="task.ticketLink" type="text" :placeholder="isDarkMode ? 'Sigil Link' : 'Link Jira'" :class="[inputClass, 'w-1/3']" />
                </div>
                
                <div class="relative">
                    <textarea v-model="task.description" rows="2" :placeholder="isDarkMode ? 'Chant the description...' : 'Deskripsi pekerjaan...'" :class="[inputClass, 'pr-8']"></textarea>
                    
                    <button @click="enhanceDescription(index, 'regular')" 
                        :class="['absolute p-1 transition-all rounded-md top-2 right-2', isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-purple-100']" title="AI Enhance">
                        <svg v-if="enhancingId === `regular-${index}`" class="w-4 h-4 text-purple-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span v-else :class="['text-xs', isDarkMode ? 'text-red-500' : 'text-purple-500']">✨</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <div :class="['flex items-center justify-between pb-1 border-b', isDarkMode ? 'border-blue-900/30' : 'border-slate-200']">
            <h3 :class="['text-xs font-bold uppercase', isDarkMode ? 'text-stone-500 font-cinzel' : 'text-slate-400']">
                B. {{ isDarkMode ? 'Nocturnal Sacrifices' : 'Overtime' }}
            </h3>
            <button @click="addOvertimeRow" 
                :class="['text-[10px] px-3 py-1.5 rounded font-bold transition', 
                isDarkMode ? 'bg-blue-950 text-blue-500 border border-blue-900 hover:bg-blue-900' : 'bg-blue-100 text-blue-700 hover:bg-blue-200']">
                {{ isDarkMode ? '+ SACRIFICE' : '+ OT' }}
            </button>
        </div>

        <div v-for="(task, index) in overtimeTasks" :key="index" 
            :class="['relative p-3 border rounded-lg shadow-sm', 
            isDarkMode ? 'bg-neutral-900/40 border-blue-900/20' : 'bg-white border-slate-200']">
            
            <button @click="removeOvertimeRow(index)" 
                :class="['absolute flex items-center justify-center w-5 h-5 rounded-full shadow -top-2 -right-2 transition', 
                isDarkMode ? 'bg-black text-red-600 border border-red-900 hover:bg-red-900 hover:text-white' : 'text-red-500 bg-white border border-slate-200 hover:bg-red-50']">
                ×
            </button>

            <div class="space-y-3">
                <div class="flex gap-2">
                    <input v-model="task.date" type="date" :class="[inputClass, 'w-1/3']" />
                    <input v-model="task.duration" type="number" step="0.5" :placeholder="isDarkMode ? 'Hrs' : 'Jam'" :class="[inputClass, 'w-20 text-center']" />
                    <input v-model="task.ticketLink" type="text" :placeholder="isDarkMode ? 'Sigil Link' : 'Link Jira'" :class="[inputClass, 'flex-1']" />
                </div>
                <div class="relative">
                    <input v-model="task.description" type="text" :placeholder="isDarkMode ? 'Sacrifice details...' : 'Keterangan Lembur'" :class="inputClass" />
                    <button @click="enhanceDescription(index, 'overtime')" :class="['absolute top-2 right-2', isDarkMode ? 'text-blue-500' : 'text-purple-500']">
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