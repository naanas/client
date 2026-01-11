<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import dayjs from 'dayjs';
import { useTimesheet } from '../../composables/useTimesheet';

const {
  employee, regularTasks, overtimeTasks,
  assigneeList, isSyncing, isAssigneeLoading,
  syncData, fetchAssignees,
  isWeekend, addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
  downloadExcel, isDarkMode 
} = useTimesheet();

// --- DYNAMIC STYLES ---
const inputClass = computed(() => isDarkMode.value
  ? "w-full px-2 py-2 bg-neutral-900/50 border-b border-red-900/30 text-stone-300 focus:border-red-600 focus:bg-neutral-900 focus:outline-none transition-all placeholder:text-stone-700 font-serif rounded-t-sm text-sm"
  : "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-slate-400 shadow-sm appearance-none"
);

const labelClass = computed(() => isDarkMode.value
  ? "text-[10px] text-red-800 font-bold ml-1 uppercase tracking-[0.2em] font-cinzel block mb-1"
  : "text-xs font-bold text-slate-500 ml-1 uppercase block mb-1.5 tracking-wide"
);

// --- LOGIC PERIODE ---
const months = [
    { val: 0, label: 'Januari' }, { val: 1, label: 'Februari' }, { val: 2, label: 'Maret' },
    { val: 3, label: 'April' }, { val: 4, label: 'Mei' }, { val: 5, label: 'Juni' },
    { val: 6, label: 'Juli' }, { val: 7, label: 'Agustus' }, { val: 8, label: 'September' },
    { val: 9, label: 'Oktober' }, { val: 10, label: 'November' }, { val: 11, label: 'Desember' }
];

const selectedMonth = ref(dayjs().month()); 
const selectedYear = ref(dayjs().year());
const currentYear = dayjs().year();
const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

const updatePeriodDates = () => {
    const targetEndDate = dayjs().year(selectedYear.value).month(selectedMonth.value).date(25);
    const targetStartDate = targetEndDate.subtract(1, 'month').date(26);

    employee.value.periodEnd = targetEndDate.format('YYYY-MM-DD');
    employee.value.periodStart = targetStartDate.format('YYYY-MM-DD');
    
    const mStart = targetStartDate.format('MMMM').toUpperCase();
    const mEnd = targetEndDate.format('MMMM').toUpperCase();
    employee.value.month = mStart === mEnd ? mStart : `${mStart} TO ${mEnd}`;
};

watch([selectedMonth, selectedYear], updatePeriodDates);
onMounted(() => {
    updatePeriodDates();
    fetchAssignees(); 
});

// Helper Status
const updateDescription = (task: any) => {
    if (task.status === 'AL') task.description = '[AL] Cuti Tahunan';
    else if (task.status === 'S') task.description = '[S] Sakit';
    else if (task.status === 'H') task.description = '[H] Libur Nasional';
    else if (task.status === 'U') task.description = '[U] Unpaid Leave';
    else if (task.status === 'WH') task.description = ''; 
};
</script>

<template>
  <div class="pb-20 space-y-8 animate-fade-in">
    
    <div :class="['flex flex-col items-center justify-between gap-4 p-5 border rounded-xl transition-all shadow-sm', 
        isDarkMode ? 'bg-neutral-900 border-red-900/30' : 'bg-green-50 border-green-100']">
        
        <div class="flex items-center w-full gap-4 md:w-auto">
            <div :class="['p-3 rounded-xl text-xl shadow-sm', isDarkMode ? 'bg-black text-red-600 border border-red-900' : 'bg-white text-green-600']">
                {{ isDarkMode ? '⏳' : '📅' }}
            </div>
            <div>
                <h3 :class="['text-sm font-bold', isDarkMode ? 'text-red-500 font-cinzel tracking-widest' : 'text-green-800']">
                    {{ isDarkMode ? 'CHRONICLES OF TIME' : 'Timesheet Management' }}
                </h3>
                <p :class="['text-xs', isDarkMode ? 'text-stone-500 font-serif italic' : 'text-green-700']">
                    {{ isDarkMode ? 'Mark the days of servitude.' : 'Pastikan Status Harian (WH/AL/S) sesuai.' }}
                </p>
            </div>
        </div>

        <div class="flex items-center w-full gap-2 md:w-auto">
            <button 
                @click="downloadExcel('timesheet')" 
                :class="['flex items-center justify-center flex-1 gap-2 px-4 py-2.5 text-xs font-bold text-white transition rounded-lg shadow-md md:flex-none active:scale-95', 
                   isDarkMode ? 'bg-stone-900 hover:bg-stone-800 border border-stone-700 font-cinzel tracking-wider' : 'bg-green-600 hover:bg-green-700']"
                title="Download Format Excel (.xlsx)"
            >
                <span>📊</span> {{ isDarkMode ? 'RAW DATA' : 'Download Excel' }}
            </button>
        </div>
    </div>

    <div class="space-y-4">
        <h3 :class="['pb-2 text-xs font-bold tracking-wider uppercase border-b', isDarkMode ? 'text-stone-500 border-red-900/30 font-cinzel' : 'text-slate-400 border-slate-200']">
            {{ isDarkMode ? 'CYCLE DURATION' : 'Periode Laporan' }}
        </h3>
        
        <div :class="['p-6 border rounded-xl shadow-sm transition-colors', isDarkMode ? 'bg-black/40 border-red-900/20' : 'bg-white border-slate-200']">
            <div class="grid grid-cols-2 gap-6 mb-4">
                <div class="flex flex-col">
                    <label :class="labelClass">{{ isDarkMode ? 'Month (Cut-off 25th)' : 'Bulan (Cut-off tgl 25)' }}</label>
                    <div class="relative w-full">
                        <select v-model="selectedMonth" :class="[inputClass, isDarkMode ? 'font-bold text-red-500' : 'font-bold text-green-700', 'pr-8']">
                            <option v-for="m in months" :key="m.val" :value="m.val">{{ m.label }}</option>
                        </select>
                        <div v-if="!isDarkMode" class="absolute inset-y-0 flex items-center text-xs pointer-events-none right-3 text-slate-500">▼</div>
                    </div>
                </div>
                
                <div class="flex flex-col">
                    <label :class="labelClass">{{ isDarkMode ? 'Year' : 'Tahun' }}</label>
                    <div class="relative w-full">
                        <select v-model="selectedYear" :class="[inputClass, isDarkMode ? 'font-bold text-red-500' : 'font-bold text-green-700', 'pr-8']">
                            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                        </select>
                        <div v-if="!isDarkMode" class="absolute inset-y-0 flex items-center text-xs pointer-events-none right-3 text-slate-500">▼</div>
                    </div>
                </div>
            </div>

            <div :class="['text-center text-xs py-2 rounded border border-dashed', 
                isDarkMode ? 'text-stone-500 border-red-900/20 bg-neutral-900/50 font-serif italic' : 'text-slate-500 border-slate-200 bg-slate-50']">
                {{ isDarkMode ? 'Ritual Range:' : 'Range Periode:' }} 
                <span class="mx-1 font-bold">{{ dayjs(employee.periodStart).format('DD MMM YYYY') }}</span> 
                s/d 
                <span class="mx-1 font-bold">{{ dayjs(employee.periodEnd).format('DD MMM YYYY') }}</span>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <h3 :class="['pb-2 text-xs font-bold tracking-wider uppercase border-b', isDarkMode ? 'text-stone-500 border-red-900/30 font-cinzel' : 'text-slate-400 border-slate-200']">
            {{ isDarkMode ? 'VESSEL IDENTITY' : 'Data Karyawan' }}
        </h3>
        
        <div :class="['p-6 space-y-6 border rounded-xl shadow-sm transition-colors', isDarkMode ? 'bg-black/40 border-red-900/20' : 'bg-white border-slate-200']">
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <label :class="labelClass">{{ isDarkMode ? 'Vessel Name' : 'Nama Assignee' }}</label>
                    <div class="flex items-center gap-3">
                        <button @click="syncData" :disabled="isSyncing" 
                            :class="['text-xs font-bold flex items-center gap-1.5 hover:underline disabled:opacity-50', isDarkMode ? 'text-indigo-400' : 'text-green-600 bg-green-50 px-2 py-1 rounded']">
                            <span v-if="isSyncing" class="animate-spin">⏳</span>
                            <span v-else>🔄</span>
                            {{ isDarkMode ? 'INVOKE DB' : 'Sync DB' }}
                        </button>
                        <span :class="isDarkMode ? 'text-stone-700' : 'text-slate-300'">|</span>
                        <button @click="fetchAssignees" :disabled="isAssigneeLoading" 
                            :class="['text-xs flex items-center gap-1 hover:underline', isDarkMode ? 'text-red-500' : 'text-blue-500 hover:text-blue-700']">
                            <svg v-if="isAssigneeLoading" class="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            {{ isAssigneeLoading ? 'Loading...' : (isDarkMode ? 'REFRESH SOULS' : 'Refresh') }}
                        </button>
                    </div>
                </div>
                
                <div class="relative">
                    <select v-model="employee.name" :disabled="isAssigneeLoading" :class="[inputClass, isAssigneeLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer']">
                        <option value="" disabled>-- {{ isDarkMode ? 'Select Soul' : 'Pilih Nama' }} --</option>
                        <option v-for="name in assigneeList" :key="name" :value="name">{{ name }}</option>
                    </select>
                    <div v-if="!isDarkMode" class="absolute inset-y-0 flex items-center text-xs pointer-events-none right-3 text-slate-500">▼</div>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div><label :class="labelClass">{{ isDarkMode ? 'Identification (NIK)' : 'NIK / Employee No' }}</label><input v-model="employee.no" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">{{ isDarkMode ? 'Legion (Squad)' : 'Nama Squad' }}</label><input v-model="employee.squad" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">{{ isDarkMode ? 'Coven (Unit)' : 'Unit Kerja (Work Unit)' }}</label><input v-model="employee.workUnit" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">{{ isDarkMode ? 'Altar (Site)' : 'Lokasi Kerja (Site)' }}</label><input v-model="employee.clientSite" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">{{ isDarkMode ? 'Overlord (Dept Head)' : 'Dept. Head' }}</label><input v-model="employee.deptHead" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">{{ isDarkMode ? 'Watcher (SPV)' : 'Supervisor' }}</label><input v-model="employee.supervisor" type="text" :class="inputClass" /></div>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <div :class="['flex items-center justify-between pb-2 border-b', isDarkMode ? 'border-red-900/30' : 'border-slate-200']">
            <h3 :class="['text-xs font-bold tracking-wider uppercase', isDarkMode ? 'text-stone-500 font-cinzel' : 'text-slate-500']">
                A. {{ isDarkMode ? 'Daily Rituals' : 'Daily Activity Log' }}
            </h3>
            <button @click="addRegularRow" 
                :class="['text-xs px-3 py-1.5 rounded-md font-bold transition shadow-sm', 
                isDarkMode ? 'bg-red-950 text-red-500 border border-red-900 hover:bg-red-900' : 'bg-green-100 text-green-700 hover:bg-green-200']">
                {{ isDarkMode ? '+ INSCRIPTION' : '+ Input Tanggal' }}
            </button>
        </div>
        
        <div v-if="regularTasks.length === 0" 
            :class="['py-8 text-sm text-center border-2 border-dashed rounded-xl', 
            isDarkMode ? 'text-stone-600 border-red-900/20 bg-black/20 italic font-serif' : 'text-slate-400 bg-slate-50 border-slate-200']">
            {{ isDarkMode ? 'The void is empty. Begin the ritual.' : 'Belum ada data activity. Klik tombol "+ Input Tanggal".' }}
        </div>
        
        <div v-for="(task, index) in regularTasks" :key="index" 
            :class="['relative p-4 transition border rounded-xl shadow-sm hover:shadow-md', 
            isDarkMode ? 'bg-neutral-900/40 border-red-900/20 hover:border-red-700 hover:bg-black' : 'bg-white border-slate-200']">
            
            <button @click="removeRegularRow(index)" 
                :class="['absolute flex items-center justify-center w-6 h-6 rounded-full shadow -top-3 -right-2 transition', 
                isDarkMode ? 'bg-black text-red-600 border border-red-900 hover:bg-red-900 hover:text-white' : 'text-red-500 bg-white border border-slate-200 hover:bg-red-50']">
                ×
            </button>

            <div class="space-y-4">
                <div class="flex gap-4">
                    <div class="w-1/2">
                        <label :class="['text-[10px] font-bold block mb-1.5 uppercase', isDarkMode ? 'text-stone-500' : 'text-slate-400']">
                            {{ isDarkMode ? 'Date' : 'Tanggal' }}
                        </label>
                        <input v-model="task.date" type="date" 
                            :class="[inputClass, isWeekend(task.date) ? (isDarkMode ? 'text-red-500 font-bold bg-red-900/10' : 'text-red-500 font-bold bg-red-50') : '']" />
                    </div>
                    
                    <div class="w-1/2">
                        <label :class="['text-[10px] font-bold block mb-1.5 uppercase', isDarkMode ? 'text-stone-500' : 'text-slate-400']">
                            {{ isDarkMode ? 'State' : 'Status Kehadiran' }}
                        </label>
                        <div class="relative">
                            <select v-model="task.status" @change="updateDescription(task)" :class="inputClass">
                                <option value="WH">✅ {{ isDarkMode ? 'Present' : 'Hadir (Work)' }}</option>
                                <option value="AL">🏖️ {{ isDarkMode ? 'Absent (Leave)' : 'Cuti Tahunan (AL)' }}</option>
                                <option value="S">💊 {{ isDarkMode ? 'Afflicted (Sick)' : 'Sakit (S)' }}</option>
                                <option value="H">🔴 {{ isDarkMode ? 'Holiday' : 'Libur Nasional (H)' }}</option>
                                <option value="U">💸 {{ isDarkMode ? 'Unpaid' : 'Unpaid Leave (U)' }}</option>
                            </select>
                            <div v-if="!isDarkMode" class="absolute inset-y-0 flex items-center text-xs pointer-events-none right-3 text-slate-500">▼</div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <label :class="['text-[10px] font-bold block mb-1.5 uppercase', isDarkMode ? 'text-stone-500' : 'text-slate-400']">
                        {{ isDarkMode ? 'Incantation / Detail' : 'Activity Description' }}
                    </label>
                    <input v-model="task.description" type="text" 
                        :placeholder="isDarkMode ? 'Describe the deed...' : 'Detail aktivitas pekerjaan...'" 
                        :class="inputClass" />
                </div>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <div :class="['flex items-center justify-between pb-2 border-b', isDarkMode ? 'border-red-900/30' : 'border-slate-200']">
            <h3 :class="['text-xs font-bold uppercase', isDarkMode ? 'text-stone-500 font-cinzel' : 'text-slate-500']">
                B. {{ isDarkMode ? 'Nocturnal Sacrifices' : 'Overtime (Lembur)' }}
            </h3>
            <button @click="addOvertimeRow" 
                :class="['text-xs px-3 py-1.5 rounded-md font-bold transition shadow-sm', 
                isDarkMode ? 'bg-red-950 text-red-500 border border-red-900 hover:bg-red-900' : 'bg-green-100 text-green-700 hover:bg-green-200']">
                {{ isDarkMode ? '+ SACRIFICE' : '+ Lembur' }}
            </button>
        </div>

        <div v-if="overtimeTasks.length === 0" :class="['py-4 text-xs text-center italic', isDarkMode ? 'text-stone-700' : 'text-slate-400']">
            {{ isDarkMode ? 'No sacrifices needed.' : 'Tidak ada data lembur.' }}
        </div>

        <div v-for="(task, index) in overtimeTasks" :key="index" 
            :class="['relative p-4 border rounded-xl shadow-sm transition-all', 
            isDarkMode ? 'bg-neutral-900/40 border-red-900/20' : 'bg-white border-slate-200']">
            
            <button @click="removeOvertimeRow(index)" 
                :class="['absolute flex items-center justify-center w-6 h-6 rounded-full shadow -top-3 -right-2 transition', 
                isDarkMode ? 'bg-black text-red-600 border border-red-900 hover:bg-red-900 hover:text-white' : 'text-red-500 bg-white border border-slate-200 hover:bg-red-50']">
                ×
            </button>

            <div class="flex flex-wrap gap-4 md:flex-nowrap">
                <div class="w-full md:w-1/4">
                     <label :class="['text-[10px] font-bold block mb-1 uppercase', isDarkMode ? 'text-stone-500' : 'text-slate-400']">Tanggal</label>
                     <input v-model="task.date" type="date" :class="inputClass" />
                </div>
                <div class="w-24">
                     <label :class="['text-[10px] font-bold block mb-1 uppercase', isDarkMode ? 'text-stone-500' : 'text-slate-400']">Durasi</label>
                     <input v-model="task.duration" type="number" step="0.5" :placeholder="isDarkMode ? 'Hrs' : 'Jam'" :class="[inputClass, 'text-center']" />
                </div>
                <div class="flex-1">
                     <label :class="['text-[10px] font-bold block mb-1 uppercase', isDarkMode ? 'text-stone-500' : 'text-slate-400']">Keterangan</label>
                     <input v-model="task.description" type="text" :placeholder="isDarkMode ? 'Details' : 'Ket. Lembur'" :class="inputClass" />
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