<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useTimesheet } from '../composables/useTimesheet';
    import { useAuth } from '../composables/useAuth';
    import MandaysForm from '../components/mandays/MandaysForm.vue';
    import TimesheetForm from '../components/timesheet/TimesheetForm.vue';
    // Import Modal Baru
    import EmailModal from '../components/EmailModal.vue'; 
    
    type Tab = 'home' | 'timesheet' | 'mandays';
    const activeTab = ref<Tab>('home');
    
    const router = useRouter();
    const { user, handleLogout } = useAuth();
    
    const {
      isDarkMode, toggleDarkMode, isAppLoading,
      htmlContent, scale, zoomIn, zoomOut, fitScreen, previewContainer,
      loadPreview, printFromIframe, isLoading
    } = useTimesheet();
    
    const logoutAndRedirect = async () => {
        await handleLogout();
        router.replace('/auth');
    };

    onMounted(() => {
        if (previewContainer.value) console.log("Canvas Ready");
    });
</script>
    
<template>
    <div class="relative flex flex-col min-h-screen overflow-auto font-sans transition-colors duration-300 md:flex-row bg-slate-100 dark:bg-slate-900 md:overflow-hidden">
    
    <EmailModal />

    <Transition name="fade">
        <div v-if="isAppLoading" class="fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-300 bg-white dark:bg-slate-900">
            <div class="w-8 h-8 mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
            <p class="text-xs font-medium text-slate-400">Menyiapkan Workspace...</p>
        </div>
    </Transition>

    <aside class="relative z-20 flex flex-col flex-shrink-0 w-full transition-colors duration-300 bg-white border-b shadow-xl md:w-96 dark:bg-slate-800 md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
        <div class="sticky top-0 z-30 p-6 transition-colors bg-white border-b border-slate-100 dark:border-slate-700 dark:bg-slate-800 md:static">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-10 h-10 text-xl font-bold text-white rounded-lg shadow-lg bg-slate-900 dark:bg-blue-600">P</div>
                    <div>
                        <h1 class="text-lg font-bold text-slate-800 dark:text-white">Pegadaian Tools</h1>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px]">{{ user?.email }}</span>
                        </div>
                    </div>
                </div>
                <button @click="logoutAndRedirect" class="p-2 transition rounded-lg text-slate-400 hover:text-red-500" title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
            </div>

            <div class="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-700">
                <button @click="activeTab='home'" :class="['py-2 text-[10px] font-bold rounded-md transition-all', activeTab==='home'?'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm':'text-slate-400 hover:text-slate-600']">HOME</button>
                <button @click="activeTab='timesheet'" :class="['py-2 text-[10px] font-bold rounded-md transition-all', activeTab==='timesheet'?'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm':'text-slate-400 hover:text-slate-600']">TIMESHEET</button>
                <button @click="activeTab='mandays'" :class="['py-2 text-[10px] font-bold rounded-md transition-all', activeTab==='mandays'?'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm':'text-slate-400 hover:text-slate-600']">MANDAYS</button>
            </div>
            
            <div class="flex justify-end mt-4">
                <button @click="toggleDarkMode" class="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{{ isDarkMode ? '☀️ LIGHT MODE' : '🌙 DARK MODE' }}</button>
            </div>
        </div>

        <div class="flex-1 p-6 space-y-8 md:overflow-y-auto">
            <div v-if="activeTab === 'home'" class="mt-10 text-center text-slate-400">
                <div class="mb-4 text-4xl">🏠</div>
                <p class="text-sm">Selamat datang di<br>Internal Tools Dashboard</p>
            </div>
            <MandaysForm v-if="activeTab === 'mandays'" />
            <TimesheetForm v-if="activeTab === 'timesheet'" />
        </div>

        <div class="sticky bottom-0 z-30 p-4 bg-white border-t dark:bg-slate-800 border-slate-200 dark:border-slate-700 md:static">
            <button v-if="activeTab === 'mandays'" @click="loadPreview('mandays')" :disabled="isLoading" class="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-white transition-all shadow-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl active:scale-95 disabled:opacity-70">
                <svg v-if="isLoading" class="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span v-else>Preview PDF (Lokal)</span>
            </button>
            <button v-if="activeTab === 'timesheet'" @click="loadPreview('timesheet')" :disabled="isLoading" class="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-white transition-all bg-green-600 shadow-lg hover:bg-green-700 rounded-xl active:scale-95 disabled:opacity-70">
                <svg v-if="isLoading" class="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span v-else>Preview PDF (Lokal)</span>
            </button>
                <div v-if="activeTab === 'home'" class="text-center text-[10px] text-slate-400">PT Pegadaian © 2026</div>
        </div>
    </aside>

    <main class="flex flex-col flex-1 min-w-0 transition-colors bg-slate-100/50 dark:bg-slate-900 md:h-screen">
        <header class="sticky top-0 z-10 flex items-center justify-between h-16 px-4 transition-colors bg-white border-b shadow-sm dark:bg-slate-800 border-slate-200 dark:border-slate-700 md:px-6">
            <div class="font-bold text-slate-700 dark:text-slate-200">
                <span v-if="activeTab === 'home'">🏠 Home Dashboard</span>
                <span v-if="activeTab === 'timesheet'">⏱️ Timesheet Preview</span>
                <span v-if="activeTab === 'mandays'">📄 Mandays Preview</span>
            </div>
            <div v-if="activeTab !== 'home'" class="flex items-center gap-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-700">
                <button @click="zoomOut" class="flex items-center justify-center w-6 h-6 font-bold bg-white rounded dark:bg-slate-600 text-slate-600 dark:text-slate-200">-</button>
                <input type="range" min="0.3" max="1.5" step="0.1" v-model.number="scale" class="w-20 h-2 rounded-lg appearance-none cursor-pointer md:w-32 bg-slate-200">
                <button @click="zoomIn" class="flex items-center justify-center w-6 h-6 font-bold bg-white rounded dark:bg-slate-600 text-slate-600 dark:text-slate-200">+</button>
                <button @click="fitScreen" class="hidden md:block px-2 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 rounded ml-1 hover:bg-blue-100">FIT</button>
            </div>
            <button v-if="activeTab !== 'home'" @click="printFromIframe" :disabled="!htmlContent" class="px-4 py-2 text-xs font-bold text-white transition-all bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 md:text-sm active:scale-95 disabled:opacity-50">
                Save / Print
            </button>
        </header>
        
        <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 flex justify-center items-start bg-slate-200/50 dark:bg-slate-950/50 min-h-[500px] relative">
            <div v-if="activeTab !== 'home'" ref="previewContainer">
                <div v-if="htmlContent" class="transition-transform duration-200 bg-white shadow-2xl origin-top-center" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '1123px', height: '794px', flexShrink: 0 }">
                    <iframe id="preview-frame" :srcdoc="htmlContent" class="block w-full h-full border-none"></iframe>
                </div>
                <div v-else class="flex flex-col items-center justify-center h-full mt-20 text-center text-slate-400 dark:text-slate-600 opacity-60">
                    <p class="text-sm">Silakan isi data di form kiri & klik Preview.</p>
                </div>
            </div>

            <div v-if="activeTab === 'home'" class="flex flex-col items-center justify-center w-full h-full text-slate-400">
                <h2 class="text-2xl font-bold text-slate-600 dark:text-slate-300">Selamat Datang, {{ user?.email }}</h2>
                <div class="grid grid-cols-2 gap-4 mt-8">
                    <button @click="activeTab='timesheet'" class="p-6 transition bg-white shadow dark:bg-slate-800 rounded-xl hover:shadow-lg">
                        <div class="mb-2 text-3xl">⏱️</div>
                        <div class="font-bold text-slate-700 dark:text-white">Timesheet</div>
                    </button>
                    <button @click="activeTab='mandays'" class="p-6 transition bg-white shadow dark:bg-slate-800 rounded-xl hover:shadow-lg">
                        <div class="mb-2 text-3xl">📄</div>
                        <div class="font-bold text-slate-700 dark:text-white">Mandays</div>
                    </button>
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