<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import dayjs from 'dayjs';
import { useTimesheet } from '../../composables/useTimesheet';

const {
  employee, regularTasks, overtimeTasks,
  assigneeList, isSyncing, isAssigneeLoading,
  syncData, fetchAssignees,
  isWeekend, addRegularRow, removeRegularRow, addOvertimeRow, removeOvertimeRow,
  downloadExcel, isDarkMode, enhanceDescription, enhancingId, getPreviewHtml
} = useTimesheet();

const isModalOpen = ref(false);

const handlePreview = async () => {
    try {
        const html = await getPreviewHtml('timesheet');
        // Open preview in new window
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(html);
            win.document.close();
        }
    } catch (e) {
        alert("Failed to generate preview");
    }
};

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
  <div class="animate-fade-in relative">
    
    <!-- MAIN TRIGGER BUTTON -->
    <div v-if="!isModalOpen" class="flex flex-col items-center justify-center py-20 gap-6">
        <div :class="['p-6 rounded-full shadow-2xl transition-transform hover:scale-110 duration-500 cursor-pointer group', 
            isDarkMode ? 'bg-black border-2 border-red-900 shadow-red-900/50' : 'bg-white border-2 border-emerald-100 shadow-emerald-200']"
            @click="isModalOpen = true">
            <span class="text-6xl group-hover:rotate-12 transition-transform block">{{ isDarkMode ? '📜' : '📝' }}</span>
        </div>
        <h2 :class="['text-3xl font-black uppercase tracking-widest text-center', isDarkMode ? 'text-red-600 font-cinzel drop-shadow-md' : 'text-emerald-700 font-sans']">
            {{ isDarkMode ? 'Begin The Ritual' : 'Input Timesheet' }}
        </h2>
        <p :class="['text-sm max-w-md text-center', isDarkMode ? 'text-stone-500 font-serif italic' : 'text-slate-500']">
            {{ isDarkMode ? 'Open the grimoire and inscribe your deeds for the Overlords.' : 'Klik tombol di atas untuk mengisi laporan timesheet bulanan anda.' }}
        </p>
        <button @click="isModalOpen = true" 
            :class="['px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95', 
            isDarkMode ? 'bg-red-900 text-white hover:bg-red-800 border border-red-950 font-cinzel tracking-widest' : 'bg-emerald-600 text-white hover:bg-emerald-700']">
            {{ isDarkMode ? 'OPEN GRIMOIRE' : 'START FILLING' }}
        </button>
    </div>

    <!-- MODAL OVERLAY -->
    <Teleport to="body">
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div :class="['w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative flex flex-col', 
                isDarkMode ? 'bg-neutral-950 border border-red-900/50 shadow-red-900/20' : 'bg-slate-50 border border-slate-200 shadow-xl']">

            
            <!-- MODAL HEADER -->
            <div :class="['sticky top-0 z-10 flex items-center justify-between p-6 border-b backdrop-blur-md', 
                isDarkMode ? 'bg-neutral-950/90 border-red-900/30' : 'bg-white/90 border-slate-200']">
                <div>
                    <h3 :class="['text-xl font-black uppercase tracking-wider', isDarkMode ? 'text-red-600 font-cinzel' : 'text-slate-800']">
                        {{ isDarkMode ? 'The Chronicles' : 'Timesheet Form' }}
                    </h3>
                    <p :class="['text-[10px]', isDarkMode ? 'text-stone-500 italic' : 'text-slate-400']">
                        {{ isDarkMode ? 'Fulfill your oath.' : 'Fill clearly and correctly.' }}
                    </p>
                </div>
                <button @click="isModalOpen = false" 
                    :class="['w-8 h-8 flex items-center justify-center rounded-full transition-colors', 
                    isDarkMode ? 'bg-red-900/20 text-red-500 hover:bg-red-900 hover:text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300']">
                    ✕
                </button>
            </div>

            <!-- MODAL BODY (FORM CONTENT) -->
            <div class="p-6 space-y-8">
                
                <!-- PERIOD SECTION -->
                <div class="space-y-4 relative">
                     <div class="flex items-center justify-between">
                        <h3 :class="['text-xs font-black tracking-[0.2em] uppercase', isDarkMode ? 'text-red-900 font-cinzel' : 'text-slate-400 font-sans']">
                            {{ isDarkMode ? 'I. Cycle Duration' : 'Periode Laporan' }}
                        </h3>
                        <div :class="['h-[1px] flex-1 ml-4', isDarkMode ? 'bg-gradient-to-r from-red-900/50 to-transparent' : 'bg-slate-200']"></div>
                    </div>
                    
                    <div :class="['p-6 border rounded-2xl shadow-sm transition-all duration-300', isDarkMode ? 'bg-black/40 border-red-900/30' : 'bg-white border-slate-100']">
                        <div class="grid grid-cols-2 gap-8 mb-6">
                            <!-- Month Selection -->
                            <div class="group/input">
                                <label :class="labelClass">{{ isDarkMode ? 'Month (Cut-off 25th)' : 'Bulan (Cut-off tgl 25)' }}</label>
                                <div class="relative w-full transition-transform duration-300 group-hover/input:translate-x-1">
                                    <select v-model="selectedMonth" :class="[inputClass, isDarkMode ? 'font-bold text-red-500' : 'font-bold text-slate-700', 'pr-10']">
                                        <option v-for="m in months" :key="m.val" :value="m.val">{{ m.label }}</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs opacity-50">▼</div>
                                </div>
                            </div>
                            
                            <!-- Year Selection -->
                            <div class="group/input">
                                <label :class="labelClass">{{ isDarkMode ? 'Year' : 'Tahun' }}</label>
                                <div class="relative w-full transition-transform duration-300 group-hover/input:translate-x-1">
                                    <select v-model="selectedYear" :class="[inputClass, isDarkMode ? 'font-bold text-red-500' : 'font-bold text-slate-700', 'pr-10']">
                                        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs opacity-50">▼</div>
                                </div>
                            </div>
                        </div>

                        <div :class="['flex items-center justify-center gap-3 text-xs py-3 rounded-lg border border-dashed transition-all', 
                            isDarkMode ? 'text-stone-500 border-red-900/30 bg-red-950/10 font-serif italic' : 'text-slate-500 border-slate-300 bg-slate-50/50']">
                            <span>{{ isDarkMode ? 'Ritual Range:' : 'Range Periode:' }}</span>
                            <span :class="['px-2 py-0.5 rounded text-[10px] font-bold tracking-wider', isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-slate-200 text-slate-700']">
                                {{ dayjs(employee.periodStart).format('DD MMM YYYY') }}
                            </span> 
                            <span class="opacity-50">→</span>
                            <span :class="['px-2 py-0.5 rounded text-[10px] font-bold tracking-wider', isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-slate-200 text-slate-700']">
                                {{ dayjs(employee.periodEnd).format('DD MMM YYYY') }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- IDENTITY SECTION -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 :class="['text-xs font-black tracking-[0.2em] uppercase', isDarkMode ? 'text-red-900 font-cinzel' : 'text-slate-400 font-sans']">
                            {{ isDarkMode ? 'II. Vessel Identity' : 'Data Karyawan' }}
                        </h3>
                        <div :class="['h-[1px] flex-1 ml-4', isDarkMode ? 'bg-gradient-to-r from-red-900/50 to-transparent' : 'bg-slate-200']"></div>
                    </div>
                    
                    <div :class="['p-6 space-y-6 border rounded-2xl shadow-sm transition-all', isDarkMode ? 'bg-black/40 border-red-900/30' : 'bg-white border-slate-100']">
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <label :class="labelClass">{{ isDarkMode ? 'Vessel Name' : 'Nama Assignee' }}</label>
                                <div class="flex items-center gap-2 bg-neutral-900/0 rounded-lg p-1">
                                    <button @click="syncData" :disabled="isSyncing" 
                                        :class="['text-[10px] font-bold flex items-center gap-2 px-3 py-1.5 rounded-md transition-all', 
                                        isDarkMode ? 'text-indigo-400 hover:bg-indigo-900/30' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100']">
                                        <span v-if="isSyncing" class="animate-spin">⏳</span>
                                        <span v-else>🔄</span>
                                        {{ isDarkMode ? 'INVOKE FROM DB' : 'Sync DB' }}
                                    </button>
                                    <div class="w-[1px] h-4 bg-stone-800"></div>
                                    <button @click="fetchAssignees" :disabled="isAssigneeLoading" 
                                        :class="['text-[10px] flex items-center gap-2 px-3 py-1.5 rounded-md transition-all font-bold', 
                                        isDarkMode ? 'text-red-500 hover:bg-red-900/30' : 'text-blue-500 hover:bg-blue-50']">
                                        <svg v-if="isAssigneeLoading" class="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        {{ isAssigneeLoading ? 'SUMMONING...' : (isDarkMode ? 'REFRESH SOULS' : 'Refresh') }}
                                    </button>
                                </div>
                            </div>
                            
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <span :class="isDarkMode ? 'text-red-900' : 'text-slate-400'">👤</span>
                                </div>
                                <select v-model="employee.name" :disabled="isAssigneeLoading" :class="[inputClass, 'pl-10 h-12', isAssigneeLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer']">
                                    <option value="" disabled>-- {{ isDarkMode ? 'Select Vessel' : 'Pilih Nama' }} --</option>
                                    <option v-for="name in assigneeList" :key="name" :value="name">{{ name }}</option>
                                </select>
                                <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs opacity-50">▼</div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label :class="labelClass">{{ isDarkMode ? 'Identification (NIK)' : 'NIK / Employee No' }}</label>
                                <input v-model="employee.no" type="text" :class="[inputClass, 'h-10']" />
                            </div>
                            <div>
                                <label :class="labelClass">{{ isDarkMode ? 'Legion (Squad)' : 'Nama Squad' }}</label>
                                <input v-model="employee.squad" type="text" :class="[inputClass, 'h-10']" />
                            </div>
                            <div>
                                <label :class="labelClass">{{ isDarkMode ? 'Coven (Unit)' : 'Unit Kerja (Work Unit)' }}</label>
                                <input v-model="employee.workUnit" type="text" :class="[inputClass, 'h-10']" />
                            </div>
                            <div>
                                <label :class="labelClass">{{ isDarkMode ? 'Altar (Site)' : 'Lokasi Kerja (Site)' }}</label>
                                <input v-model="employee.clientSite" type="text" :class="[inputClass, 'h-10']" />
                            </div>
                            <div>
                                <label :class="labelClass">{{ isDarkMode ? 'Overlord (Dept Head)' : 'Dept. Head' }}</label>
                                <input v-model="employee.deptHead" type="text" :class="[inputClass, 'h-10']" />
                            </div>
                            <div>
                                <label :class="labelClass">{{ isDarkMode ? 'Watcher (SPV)' : 'Supervisor' }}</label>
                                <input v-model="employee.supervisor" type="text" :class="[inputClass, 'h-10']" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DAILY RITUALS (REGULAR TASKS) -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between pb-2 border-b border-transparent">
                         <div class="flex items-center gap-4">
                            <h3 :class="['text-xs font-black tracking-[0.2em] uppercase', isDarkMode ? 'text-red-900 font-cinzel' : 'text-slate-400 font-sans']">
                                {{ isDarkMode ? 'III. Daily Rituals' : 'A. Daily Activity Log' }}
                            </h3>
                             <span v-if="regularTasks.length > 0" :class="['text-[10px] px-2 py-0.5 rounded-full font-mono', isDarkMode ? 'bg-red-900/20 text-red-500' : 'bg-slate-100 text-slate-500']">{{ regularTasks.length }}</span>
                         </div>

                        <button @click="addRegularRow" 
                            :class="['text-xs px-5 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95 flex items-center gap-2', 
                            isDarkMode ? 'bg-red-950 text-red-500 border border-red-900/50 hover:bg-red-900 hover:text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-200']">
                            <span>+</span> {{ isDarkMode ? 'INSCRIPTION' : 'Add Activity' }}
                        </button>
                    </div>
                    
                    <TransitionGroup name="list" tag="div" class="space-y-4">
                         <div v-if="regularTasks.length === 0" key="empty"
                            :class="['py-12 text-sm text-center border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3', 
                            isDarkMode ? 'text-stone-600 border-red-900/10 bg-black/20 italic font-serif' : 'text-slate-400 bg-slate-50/50 border-slate-200']">
                            <span class="text-4xl opacity-20">{{ isDarkMode ? '📜' : '📝' }}</span>
                            <p>{{ isDarkMode ? 'The void is empty. Begin the ritual.' : 'Belum ada data activity.' }}</p>
                        </div>
                        
                        <div v-for="(task, index) in regularTasks" :key="index" 
                            :class="['relative p-6 transition-all duration-300 border rounded-2xl shadow-sm hover:shadow-lg group', 
                            isDarkMode ? 'bg-neutral-900/30 border-red-900/20 hover:border-red-800/50 hover:bg-black' : 'bg-white border-slate-100']">
                            
                            <button @click="removeRegularRow(index)" 
                                :class="['absolute flex items-center justify-center w-8 h-8 rounded-full shadow-lg -top-3 -right-3 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 z-10', 
                                isDarkMode ? 'bg-black text-red-600 border border-red-900 hover:bg-red-600 hover:text-white hover:rotate-90' : 'text-red-500 bg-white border border-slate-200 hover:bg-red-50']">
                                ×
                            </button>

                            <div class="space-y-5">
                                <div class="flex gap-6">
                                    <div class="w-1/3 space-y-1">
                                        <label :class="labelClass">
                                            {{ isDarkMode ? 'Date' : 'Tanggal' }}
                                        </label>
                                        <input v-model="task.date" type="date" 
                                            :class="[inputClass, 'font-mono tracking-wider', isWeekend(task.date) ? (isDarkMode ? 'text-red-500 font-bold bg-red-900/10 border-red-900/50' : 'text-red-500 font-bold bg-red-50 border-red-200') : '']" />
                                    </div>
                                    
                                    <div class="w-2/3 space-y-1">
                                        <label :class="labelClass">
                                            {{ isDarkMode ? 'State' : 'Status' }}
                                        </label>
                                        <div class="relative">
                                            <select v-model="task.status" @change="updateDescription(task)" :class="inputClass">
                                                <option value="WH">✅ {{ isDarkMode ? 'Present' : 'Hadir (Work)' }}</option>
                                                <option value="AL">🏖️ {{ isDarkMode ? 'Absent (Leave)' : 'Cuti Tahunan (AL)' }}</option>
                                                <option value="S">💊 {{ isDarkMode ? 'Afflicted (Sick)' : 'Sakit (S)' }}</option>
                                                <option value="H">🔴 {{ isDarkMode ? 'Holiday' : 'Libur Nasional (H)' }}</option>
                                                <option value="U">💸 {{ isDarkMode ? 'Unpaid' : 'Unpaid Leave (U)' }}</option>
                                            </select>
                                            <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs opacity-50">▼</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="space-y-1 relative group/desc">
                                    <label :class="labelClass">
                                        {{ isDarkMode ? 'Incantation / Detail' : 'Activity Description' }}
                                    </label>
                                    <div class="relative">
                                        <input v-model="task.description" type="text" 
                                            :placeholder="isDarkMode ? 'Describe the deed...' : 'Detail aktivitas pekerjaan...'" 
                                            :class="[inputClass, 'pr-12 transition-all group-focus-within/desc:ring-1', isDarkMode ? 'group-focus-within/desc:ring-red-900' : 'group-focus-within/desc:ring-emerald-500']" />
                                        
                                        <button @click="enhanceDescription(index, 'regular')" 
                                            :class="['absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-lg transition-all active:scale-90', 
                                            isDarkMode ? 'hover:bg-red-900/30 text-red-500' : 'hover:bg-purple-100 text-purple-500']" 
                                            title="AI Enhance">
                                            <svg v-if="enhancingId === `regular-${index}`" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span v-else class="text-sm filter drop-shadow hover:drop-shadow-lg transition-all">✨</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>

                <!-- OVERTIME SECTION -->
                <div class="space-y-4 pt-4 border-t border-dashed" :class="isDarkMode ? 'border-red-900/30' : 'border-slate-200'">
                    <div class="flex items-center justify-between pb-2">
                        <h3 :class="['text-xs font-black tracking-[0.2em] uppercase', isDarkMode ? 'text-red-900 font-cinzel' : 'text-slate-400 font-sans']">
                            {{ isDarkMode ? 'IV. Nocturnal Sacrifices' : 'B. Overtime (Lembur)' }}
                        </h3>
                        <button @click="addOvertimeRow" 
                            :class="['text-xs px-4 py-2 rounded-lg font-bold transition shadow-sm flex items-center gap-2', 
                            isDarkMode ? 'bg-red-950 text-red-500 border border-red-900/50 hover:bg-red-900 hover:text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200']">
                            <span>+</span> {{ isDarkMode ? 'SACRIFICE' : 'Lembur' }}
                        </button>
                    </div>

                    <TransitionGroup name="list" tag="div" class="space-y-4">
                         <div v-if="overtimeTasks.length === 0" key="empty-ot" :class="['py-6 text-xs text-center italic opacity-60', isDarkMode ? 'text-stone-700' : 'text-slate-400']">
                            {{ isDarkMode ? 'No sacrifices needed.' : 'Tidak ada data lembur.' }}
                        </div>

                        <div v-for="(task, index) in overtimeTasks" :key="index" 
                            :class="['relative p-6 border rounded-2xl shadow-sm transition-all', 
                            isDarkMode ? 'bg-neutral-900/30 border-red-900/20 hover:border-red-600/40' : 'bg-white border-slate-100 hover:shadow-md']">
                            
                            <button @click="removeOvertimeRow(index)" 
                                :class="['absolute flex items-center justify-center w-6 h-6 rounded-full shadow -top-3 -right-3 transition-all opacity-0 group-hover:opacity-100 hover:scale-110', 
                                isDarkMode ? 'bg-black text-red-600 border border-red-900 hover:bg-red-900 hover:text-white' : 'text-red-500 bg-white border border-slate-200 hover:bg-red-50']">
                                ×
                            </button>

                            <div class="flex flex-wrap gap-4 md:flex-nowrap items-end">
                                <div class="w-full md:w-1/4 space-y-1">
                                    <label :class="['text-[10px] font-bold block mb-1 uppercase', isDarkMode ? 'text-stone-500' : 'text-slate-400']">Tanggal</label>
                                    <input v-model="task.date" type="date" :class="[inputClass, 'font-mono']" />
                                </div>
                                <div class="w-24 space-y-1">
                                    <label :class="['text-[10px] font-bold block mb-1 uppercase', isDarkMode ? 'text-stone-500' : 'text-slate-400']">Durasi</label>
                                    <input v-model="task.duration" type="number" step="0.5" :placeholder="isDarkMode ? 'Brn' : 'Jam'" :class="[inputClass, 'text-center font-mono']" />
                                </div>
                                <div class="flex-1 space-y-1">
                                    <label :class="['text-[10px] font-bold block mb-1 uppercase', isDarkMode ? 'text-stone-500' : 'text-slate-400']">Keterangan</label>
                                    <div class="relative">
                                        <input v-model="task.description" type="text" :placeholder="isDarkMode ? 'Details' : 'Ket. Lembur'" :class="[inputClass, 'pr-10']" />
                                        <button @click="enhanceDescription(index, 'overtime')" 
                                            :class="['absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-md transition-all', isDarkMode ? 'hover:bg-red-900/30 text-red-500' : 'hover:bg-purple-100 text-purple-500']" 
                                            title="AI Enhance">
                                            <svg v-if="enhancingId === `overtime-${index}`" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span v-else class="text-xs">✨</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>

            </div>

             <!-- MODAL FOOTER -->
            <div :class="['sticky bottom-0 z-10 flex items-center justify-end gap-3 p-4 border-t backdrop-blur-md', 
                isDarkMode ? 'bg-neutral-950/90 border-red-900/30' : 'bg-white/90 border-slate-200']">
                
                <button @click="handlePreview"
                    :class="['px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md', 
                    isDarkMode ? 'text-red-500 border border-red-900 hover:bg-red-900/20' : 'text-slate-600 border border-slate-300 hover:bg-slate-100']">
                    {{ isDarkMode ? '👁️ FORESEE' : 'Preview' }}
                </button>

                <button @click="downloadExcel('timesheet')" 
                    :class="['px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg active:scale-95', 
                    isDarkMode ? 'bg-red-900 hover:bg-red-800 border-red-950 tracking-widest font-cinzel' : 'bg-emerald-600 hover:bg-emerald-700']">
                    {{ isDarkMode ? 'GENERATE' : 'Download Excel' }}
                </button>
            </div>

        </div>
    </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>