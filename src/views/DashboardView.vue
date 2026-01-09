<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useTimesheet } from '../composables/useTimesheet';
    import { useAuth } from '../composables/useAuth';
    import MandaysForm from '../components/mandays/MandaysForm.vue';
    import TimesheetForm from '../components/timesheet/TimesheetForm.vue';
    
    type Tab = 'home' | 'timesheet' | 'mandays';
    const activeTab = ref<Tab>('home');
    
    const { user, handleLogout } = useAuth();
    const {
      isDarkMode, toggleDarkMode, isAppLoading,
      htmlContent, scale, zoomIn, zoomOut, fitScreen, previewContainer,
      loadPreview, printFromIframe, isLoading
    } = useTimesheet();
    
    // --- FIX UNUSED VARIABLE ERROR ---
    onMounted(() => {
        // Trik agar TypeScript menganggap previewContainer "dipakai"
        if (previewContainer.value) console.log("Canvas Ready");
    });
    </script>
    
    <template>
      <div class="flex flex-col md:flex-row min-h-screen bg-slate-100 dark:bg-slate-900 font-sans md:overflow-hidden overflow-auto transition-colors duration-300 relative">
        
        <Transition name="fade"><div v-if="isAppLoading" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300"><div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div><p class="text-xs text-slate-400 font-medium">Menyiapkan Workspace...</p></div></Transition>
    
        <aside class="w-full md:w-96 bg-white dark:bg-slate-800 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col z-20 shadow-xl flex-shrink-0 relative transition-colors duration-300">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-30 md:static transition-colors">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3"><div class="w-10 h-10 bg-slate-900 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg font-bold text-xl">P</div><div><h1 class="font-bold text-slate-800 dark:text-white text-lg">Pegadaian Tools</h1><div class="flex items-center gap-1.5 mt-0.5"><span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px]">{{ user?.email }}</span></div></div></div>
                    <button @click="handleLogout" class="p-2 text-slate-400 hover:text-red-500 rounded-lg transition" title="Logout"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
                </div>
                <div class="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button @click="activeTab='home'" :class="['py-2 text-[10px] font-bold rounded-md transition-all', activeTab==='home'?'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm':'text-slate-400 hover:text-slate-600']">HOME</button>
                    <button @click="activeTab='timesheet'" :class="['py-2 text-[10px] font-bold rounded-md transition-all', activeTab==='timesheet'?'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm':'text-slate-400 hover:text-slate-600']">TIMESHEET</button>
                    <button @click="activeTab='mandays'" :class="['py-2 text-[10px] font-bold rounded-md transition-all', activeTab==='mandays'?'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm':'text-slate-400 hover:text-slate-600']">MANDAYS</button>
                </div>
                <div class="flex justify-end mt-4"><button @click="toggleDarkMode" class="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{{ isDarkMode ? '☀️ LIGHT MODE' : '🌙 DARK MODE' }}</button></div>
            </div>
    
            <div class="flex-1 p-6 space-y-8 md:overflow-y-auto">
                <div v-if="activeTab === 'home'" class="text-center text-slate-400 mt-10"><div class="text-4xl mb-4">🏠</div><p class="text-sm">Selamat datang di<br>Internal Tools Dashboard</p></div>
                <MandaysForm v-if="activeTab === 'mandays'" />
                <TimesheetForm v-if="activeTab === 'timesheet'" />
            </div>
    
            <div class="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 z-30 md:static">
                <button v-if="activeTab === 'mandays'" @click="loadPreview('mandays')" :disabled="isLoading" class="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-70"><svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span v-else>Generate Mandays PDF</span></button>
                <button v-if="activeTab === 'timesheet'" @click="loadPreview('timesheet')" :disabled="isLoading" class="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-70"><svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span v-else>Generate Timesheet PDF</span></button>
                 <div v-if="activeTab === 'home'" class="text-center text-[10px] text-slate-400">PT Pegadaian © 2026</div>
            </div>
        </aside>
    
        <main class="flex-1 flex flex-col bg-slate-100/50 dark:bg-slate-900 min-w-0 md:h-screen transition-colors">
            <header class="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 sticky top-0 transition-colors">
                <div class="font-bold text-slate-700 dark:text-slate-200">
                    <span v-if="activeTab === 'home'">🏠 Home Dashboard</span>
                    <span v-if="activeTab === 'timesheet'">⏱️ Timesheet Preview</span>
                    <span v-if="activeTab === 'mandays'">📄 Mandays Preview</span>
                </div>
                <div v-if="activeTab !== 'home'" class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button @click="zoomOut" class="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold">-</button>
                    <input type="range" min="0.3" max="1.5" step="0.1" v-model.number="scale" class="w-20 md:w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer">
                    <button @click="zoomIn" class="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold">+</button>
                    <button @click="fitScreen" class="hidden md:block px-2 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 rounded ml-1 hover:bg-blue-100">FIT</button>
                </div>
                <button v-if="activeTab !== 'home'" @click="printFromIframe" :disabled="!htmlContent" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50">Save PDF</button>
            </header>
            
            <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 flex justify-center items-start bg-slate-200/50 dark:bg-slate-950/50 min-h-[500px] relative">
                <div v-if="activeTab !== 'home'" ref="previewContainer">
                    <div v-if="htmlContent" class="bg-white shadow-2xl transition-transform duration-200 origin-top-center" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '1123px', height: '794px', flexShrink: 0 }">
                        <iframe id="preview-frame" :srcdoc="htmlContent" class="block w-full h-full border-none"></iframe>
                    </div>
                    <div v-else class="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 opacity-60 text-center mt-20"><p class="text-sm">Klik Generate PDF di menu samping.</p></div>
                </div>
                <div v-if="activeTab === 'home'" class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <h2 class="text-2xl font-bold text-slate-600 dark:text-slate-300">Selamat Datang, {{ user?.email }}</h2>
                    <div class="grid grid-cols-2 gap-4 mt-8">
                        <button @click="activeTab='timesheet'" class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow hover:shadow-lg transition"><div class="text-3xl mb-2">⏱️</div><div class="font-bold text-slate-700 dark:text-white">Timesheet</div></button>
                        <button @click="activeTab='mandays'" class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow hover:shadow-lg transition"><div class="text-3xl mb-2">📄</div><div class="font-bold text-slate-700 dark:text-white">Mandays</div></button>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </template>
    <style scoped>
    .fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
    .fade-enter-from, .fade-leave-to { opacity: 0; }
    </style>