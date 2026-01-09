<script setup lang="ts">
    import { useTimesheet } from '../../composables/useTimesheet';
    
    const {
      employee, regularTasks, overtimeTasks, assigneeList,
      isSyncing, isRefreshing, enhancingId,
      syncData, fetchAssignees, enhanceDescription, 
      isWeekend, autoFillLink,
      addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
    } = useTimesheet();
    
    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:bg-slate-600 dark:placeholder-slate-500";
    const labelClass = "text-[10px] text-slate-400 font-bold ml-1 dark:text-slate-500";
    </script>
    
    <template>
      <div class="space-y-8 pb-20"> <div class="space-y-4">
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b dark:border-slate-700 pb-1">Informasi Karyawan</h3>
            <div class="space-y-2">
                
                <div class="space-y-1">
                    <div class="flex justify-between items-center">
                        <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500">NAMA ASSIGNEE (Dari DB)</label>
                        <div class="flex gap-2">
                            <button @click="syncData" :disabled="isSyncing" class="text-[9px] font-bold flex items-center gap-1 text-green-600 disabled:opacity-50 hover:text-green-700 transition-colors">
                                <span v-if="isSyncing" class="animate-spin">⏳</span>
                                <span v-else>⬇ Sync DB</span>
                            </button>
                            <button @click="fetchAssignees" :disabled="isRefreshing" class="text-[9px] text-blue-500 hover:underline">
                                {{ isRefreshing ? 'Loading...' : 'Refresh' }}
                            </button>
                        </div>
                    </div>
                    <div class="relative">
                        <select v-model="employee.name" :class="inputClass + ' appearance-none cursor-pointer'">
                            <option value="" disabled>-- Pilih Assignee --</option>
                            <option v-for="name in assigneeList" :key="name" :value="name">{{ name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
    
                <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Nama Lengkap (Di PDF)</label>
                    <input v-model="employee.reportName" type="text" placeholder="Nama + Gelar..." :class="inputClass + ' border-blue-200 font-semibold'" />
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
                <button @click="addRegularRow" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 dark:bg-slate-700 dark:text-blue-400 font-bold">+ Tambah</button>
            </div>
            
            <div v-if="regularTasks.length === 0" class="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed dark:border-slate-700">
                Tidak ada input manual.
            </div>
            <div v-else class="space-y-4">
                <div v-for="(task, index) in regularTasks" :key="index" class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative group" :class="{'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/10': isWeekend(task.date)}">
                    <button @click="removeRegularRow(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition">×</button>
                    <div class="space-y-2">
                        <div><label v-if="isWeekend(task.date)" class="text-[9px] text-red-500 font-bold mb-1">⚠️ Weekend</label><input v-model="task.date" type="date" :class="[inputClass, 'w-full', isWeekend(task.date) ? 'text-red-600 font-bold' : '']" /></div>
                        
                        <div class="relative">
                            <textarea v-model="task.description" rows="2" placeholder="Deskripsi" :class="[inputClass, 'resize-none pr-8', enhancingId === `regular-${index}` ? 'animate-pulse border-purple-400' : '']"></textarea>
                            <button @click="enhanceDescription(index, 'regular')" class="absolute top-2 right-2 text-slate-400 hover:text-purple-600 transition" :disabled="enhancingId === `regular-${index}`">✨</button>
                        </div>
    
                        <div class="grid grid-cols-2 gap-2">
                            <input v-model="task.ticketNumber" @input="autoFillLink(task)" type="text" placeholder="No. Tiket" :class="inputClass" />
                            <input v-model="task.ticketLink" type="text" placeholder="Link JIRA" :class="inputClass" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <div class="space-y-4">
            <div class="flex justify-between items-center border-b dark:border-slate-700 pb-1">
                <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">B. Overtime</h3>
                <button @click="addOvertimeRow" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 dark:bg-slate-700 dark:text-blue-400 font-bold">+ Tambah</button>
            </div>
            
            <div v-if="overtimeTasks.length === 0" class="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed dark:border-slate-700">
                Belum ada data lembur.
            </div>
            <div v-else class="space-y-4">
                <div v-for="(task, index) in overtimeTasks" :key="index" class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative group" :class="{'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-900/10': isWeekend(task.date)}">
                    <button @click="removeOvertimeRow(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition">×</button>
                    <div class="space-y-2">
                        <div class="flex gap-2">
                            <div class="w-2/3"><input v-model="task.date" type="date" :class="[inputClass, isWeekend(task.date) ? 'text-red-600 font-bold' : '']" /></div>
                            <div class="w-1/3"><input v-model="task.duration" type="number" step="0.5" placeholder="Jam" :class="inputClass + ' text-center'" /></div>
                        </div>
                        
                        <div class="relative">
                            <textarea v-model="task.description" rows="2" placeholder="Deskripsi Lembur" :class="[inputClass, 'resize-none pr-8', enhancingId === `overtime-${index}` ? 'animate-pulse border-purple-400' : '']"></textarea>
                            <button @click="enhanceDescription(index, 'overtime')" class="absolute top-2 right-2 text-slate-400 hover:text-purple-600 transition" :disabled="enhancingId === `overtime-${index}`">✨</button>
                        </div>
    
                        <input v-model="task.remarks" type="text" placeholder="No. Surat Tugas" :class="inputClass" />
                    </div>
                </div>
            </div>
        </div>
    
      </div>
    </template>