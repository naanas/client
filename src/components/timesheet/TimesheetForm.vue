<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import { useTimesheet } from '../../composables/useTimesheet';

const {
  employee, regularTasks, overtimeTasks,
  assigneeList, isSyncing, isAssigneeLoading,
  syncData, fetchAssignees,
  isWeekend, addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
  downloadExcel,     // Fitur Excel
  payAndExportPdf,   // Fitur Xendit
  isPaymentLoading   // Loading State Xendit
} = useTimesheet();

const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:focus:bg-slate-600 dark:placeholder-slate-500";
const labelClass = "text-[10px] text-slate-400 font-bold ml-1 dark:text-slate-500 uppercase";

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
    
    // Auto Label Month
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
    
    <div class="flex flex-col items-center justify-between gap-4 p-4 border border-green-100 bg-green-50 dark:bg-green-900/20 rounded-xl dark:border-green-800 md:flex-row">
        <div class="flex items-center w-full gap-3 md:w-auto">
            <div class="p-2 text-green-600 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">📅</div>
            <div>
                <h3 class="text-xs font-bold text-green-700 dark:text-green-300">Timesheet Data</h3>
                <p class="text-[10px] text-green-600 dark:text-green-400">Pastikan Status Harian (WH/AL/S) sesuai.</p>
            </div>
        </div>

        <div class="flex items-center w-full gap-2 md:w-auto">
            <button 
                @click="downloadExcel('timesheet')" 
                class="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-xs font-bold text-white transition bg-green-600 rounded-lg shadow md:flex-none hover:bg-green-700"
                title="Download Format Excel (.xlsx)"
            >
                <span>📊</span> Excel
            </button>

            <button 
                @click="payAndExportPdf('timesheet')"
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

    <div class="space-y-2">
        <h3 class="pb-1 text-xs font-bold tracking-wider uppercase border-b text-slate-400 dark:text-slate-500 dark:border-slate-700">Periode Laporan</h3>
        <div class="grid grid-cols-2 gap-4 p-4 bg-white border rounded-lg shadow-sm dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Bulan (Cut-off tgl 25)</label>
                <select v-model="selectedMonth" :class="inputClass + ' font-bold text-green-700 dark:text-green-400'">
                    <option v-for="m in months" :key="m.val" :value="m.val">{{ m.label }}</option>
                </select>
            </div>
            <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tahun</label>
                <select v-model="selectedYear" :class="inputClass + ' font-bold text-green-700 dark:text-green-400'">
                    <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                </select>
            </div>
            <div class="col-span-2 text-center text-[10px] text-slate-400">
                Range: <b>{{ dayjs(employee.periodStart).format('DD MMM YYYY') }}</b> s/d <b>{{ dayjs(employee.periodEnd).format('DD MMM YYYY') }}</b>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <h3 class="pb-1 text-xs font-bold tracking-wider uppercase border-b text-slate-400 dark:text-slate-500 dark:border-slate-700">Data Karyawan</h3>
        <div class="p-4 space-y-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            
            <div class="space-y-1">
                <div class="flex items-center justify-between">
                    <label :class="labelClass">Nama Assignee</label>
                    <div class="flex items-center gap-2">
                        <button @click="syncData" :disabled="isSyncing" class="text-[9px] font-bold flex items-center gap-1 text-green-600 disabled:opacity-50 hover:underline">
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
                        <svg class="w-4 h-4 text-green-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div><label :class="labelClass">NIK / Employee No</label><input v-model="employee.no" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">Squad</label><input v-model="employee.squad" type="text" :class="inputClass" /></div>
                
                <div><label :class="labelClass">Work Unit</label><input v-model="employee.workUnit" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">Client Site</label><input v-model="employee.clientSite" type="text" :class="inputClass" /></div>
                
                <div><label :class="labelClass">Dept. Head</label><input v-model="employee.deptHead" type="text" :class="inputClass" /></div>
                <div><label :class="labelClass">Supervisor</label><input v-model="employee.supervisor" type="text" :class="inputClass" /></div>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <div class="flex items-center justify-between pb-1 border-b dark:border-slate-700">
            <h3 class="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">A. Activity Log</h3>
            <button @click="addRegularRow" class="text-[10px] bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200 font-bold transition">+ Input Tanggal</button>
        </div>
        
        <div v-if="regularTasks.length === 0" class="py-6 text-xs text-center border border-dashed rounded-lg text-slate-400 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">Belum ada data activity.</div>
        
        <div v-for="(task, index) in regularTasks" :key="index" class="relative p-3 transition bg-white border rounded-lg shadow-sm dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md">
            <button @click="removeRegularRow(index)" class="absolute flex items-center justify-center w-5 h-5 text-red-500 bg-white border rounded-full shadow -top-2 -right-2 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-red-50">×</button>
            <div class="space-y-2">
                <div class="flex gap-2">
                    <div class="w-1/2">
                        <label class="text-[9px] font-bold text-slate-400">Tanggal</label>
                        <input v-model="task.date" type="date" :class="[inputClass, isWeekend(task.date) ? 'text-red-500 font-bold bg-red-50 dark:bg-red-900/10' : '']" />
                    </div>
                    <div class="w-1/2">
                        <label class="text-[9px] font-bold text-slate-400">Status</label>
                        <select v-model="task.status" @change="updateDescription(task)" :class="inputClass">
                            <option value="WH">✅ Hadir (Work)</option>
                            <option value="AL">🏖️ Cuti (AL)</option>
                            <option value="S">💊 Sakit (S)</option>
                            <option value="H">🔴 Libur (H)</option>
                            <option value="U">💸 Unpaid (U)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="text-[9px] font-bold text-slate-400">Activity / Description</label>
                    <input v-model="task.description" type="text" placeholder="Detail aktivitas..." :class="inputClass" />
                </div>
            </div>
        </div>
    </div>

    <div class="space-y-4">
        <div class="flex items-center justify-between pb-1 border-b dark:border-slate-700">
            <h3 class="text-xs font-bold uppercase text-slate-400">B. Overtime</h3>
            <button @click="addOvertimeRow" class="text-[10px] bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200 font-bold transition">+ Lembur</button>
        </div>
        <div v-for="(task, index) in overtimeTasks" :key="index" class="relative p-3 bg-white border rounded-lg shadow-sm dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <button @click="removeOvertimeRow(index)" class="absolute flex items-center justify-center w-5 h-5 text-red-500 bg-white border rounded-full shadow -top-2 -right-2 dark:bg-slate-700 border-slate-200 hover:bg-red-50">×</button>
            <div class="flex items-center gap-2">
                <input v-model="task.date" type="date" :class="inputClass" class="w-1/3" />
                <input v-model="task.duration" type="number" step="0.5" placeholder="Jam" :class="inputClass" class="w-20 text-center" />
                <input v-model="task.description" type="text" placeholder="Ket." :class="inputClass" class="flex-1" />
            </div>
        </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>