<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useTimesheet } from '../composables/useTimesheet';
    import { useAuth } from '../composables/useAuth';
    
    // Components
    import MandaysForm from '../components/mandays/MandaysForm.vue';
    import TimesheetForm from '../components/timesheet/TimesheetForm.vue';
    import EmailModal from '../components/EmailModal.vue';
    import HistoryList from '../components/HistoryList.vue'; 
    import AdminSettings from '../components/AdminSettings.vue'; 
    
    type Tab = 'home' | 'timesheet' | 'mandays' | 'history' | 'admin';
    const activeTab = ref<Tab>('home');
    
    const router = useRouter();
    const route = useRoute();
    
    const { user, userRole, handleLogout } = useAuth();
    
    const {
      isDarkMode, toggleDarkMode, isAppLoading,
      htmlContent, scale, zoomIn, zoomOut, fitScreen, previewContainer,
      loadPreview, isLoading,
      openPaymentModal, isPaymentLoading 
    } = useTimesheet();
    
    const isAdmin = computed(() => user.value && userRole.value === 'admin');

    const logoutAndRedirect = async () => {
        await handleLogout();
        router.replace('/auth');
    };

    onMounted(() => {
        if (route.query.tab === 'history') activeTab.value = 'history';
        if (previewContainer.value) console.log("Canvas Ready");
    });

    // JUDUL DINAMIS (Light vs Dark)
    const headerTitle = computed(() => {
        switch(activeTab.value) {
            case 'home': return isDarkMode.value ? '🏰 Sanctum Dashboard' : '🏠 Home Dashboard';
            case 'history': return isDarkMode.value ? '📜 Ancient Records' : '📜 Riwayat Transaksi';
            case 'admin': return isDarkMode.value ? '⚙️ Overlord Controls' : '⚙️ Pengaturan Admin';
            case 'timesheet': return isDarkMode.value ? '⏱️ Timesheet Ritual' : '⏱️ Timesheet Preview';
            case 'mandays': return isDarkMode.value ? '📄 Mandays Manifestation' : '📄 Mandays Preview';
            default: return '';
        }
    });
</script>
    
<template>
    <div :class="['relative flex flex-col min-h-screen overflow-auto transition-colors duration-300 md:flex-row md:overflow-hidden', isDarkMode ? 'bg-neutral-950 text-stone-300 font-serif selection:bg-red-900 selection:text-white' : 'bg-slate-100 font-sans text-slate-800']">
    
    <EmailModal />

    <Transition name="fade">
        <div v-if="isAppLoading" :class="['fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors', isDarkMode ? 'bg-black' : 'bg-slate-100']">
            <div v-if="isDarkMode" class="relative mb-6">
                <div class="w-16 h-16 border-4 rounded-full border-red-900/30 border-t-red-700 animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-2xl text-red-800 font-cinzel">†</div>
            </div>
            <p v-if="isDarkMode" class="text-xs font-bold text-red-700 tracking-[0.5em] animate-pulse font-cinzel">SUMMONING...</p>

            <div v-else class="flex flex-col items-center gap-2">
                <div class="w-8 h-8 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                <p class="text-xs font-bold text-slate-400">Memuat Aplikasi...</p>
            </div>
        </div>
    </Transition>

    <aside :class="['relative z-20 flex flex-col flex-shrink-0 w-full transition-colors border-b md:w-80 md:border-b-0 md:border-r shadow-xl', isDarkMode ? 'bg-neutral-900 border-red-900/20' : 'bg-white border-slate-200']">
        
        <div :class="['sticky top-0 z-30 p-6 border-b md:static transition-colors', isDarkMode ? 'bg-neutral-900 border-red-900/20' : 'bg-white border-slate-100']">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <div :class="['flex items-center justify-center w-10 h-10 text-xl font-bold rounded-lg shadow-lg transition-all', isDarkMode ? 'text-red-500 bg-black border border-red-900 font-cinzel' : 'text-white bg-blue-600']">
                        {{ isDarkMode ? '†' : 'P' }}
                    </div>
                    <div>
                        <h1 :class="['text-sm font-bold tracking-widest uppercase', isDarkMode ? 'text-stone-200 font-cinzel' : 'text-slate-800']">
                            {{ isDarkMode ? 'Grimoire Tools' : 'Pegadaian Tools' }}
                        </h1>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span :class="['w-1.5 h-1.5 rounded-full animate-pulse', isDarkMode ? 'bg-red-600 shadow-[0_0_5px_red]' : 'bg-green-500']"></span>
                            <span :class="['text-[10px] font-medium truncate max-w-[120px]', isDarkMode ? 'text-stone-500 font-mono' : 'text-slate-500']">{{ user?.email }}</span>
                            <span v-if="isAdmin" :class="['text-[8px] px-1 ml-1 font-bold rounded', isDarkMode ? 'bg-red-950 text-red-500 border border-red-900 tracking-widest' : 'bg-red-100 text-red-600']">ADMIN</span>
                        </div>
                    </div>
                </div>
                <button @click="logoutAndRedirect" :class="['p-2 transition rounded', isDarkMode ? 'hover:bg-red-950 text-stone-600 hover:text-red-500' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100']" title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
            </div>

            <div :class="['flex flex-col gap-2 p-2 rounded-xl transition-all', isDarkMode ? 'border border-red-900/10 bg-black/40' : 'bg-slate-50 border border-slate-100']">
                <div class="grid grid-cols-2 gap-2">
                    <button @click="activeTab='home'" 
                        :class="['py-2 text-[10px] font-bold rounded-lg transition-all', 
                        activeTab==='home' 
                            ? (isDarkMode ? 'bg-red-900/20 border border-red-800 text-red-400 font-cinzel shadow-[inset_0_0_10px_rgba(220,38,38,0.2)]' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200') 
                            : (isDarkMode ? 'text-stone-600 hover:text-stone-300 hover:bg-white/5 font-cinzel' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200')]">
                        HOME
                    </button>
                    <button @click="activeTab='history'" 
                        :class="['py-2 text-[10px] font-bold rounded-lg transition-all', 
                        activeTab==='history' 
                            ? (isDarkMode ? 'bg-red-900/20 border border-red-800 text-red-400 font-cinzel' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200') 
                            : (isDarkMode ? 'text-stone-600 hover:text-stone-300 hover:bg-white/5 font-cinzel' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200')]">
                        {{ isDarkMode ? 'RECORDS' : 'HISTORY' }}
                    </button>
                    <button @click="activeTab='timesheet'" 
                        :class="['py-2 text-[10px] font-bold rounded-lg transition-all', 
                        activeTab==='timesheet' 
                            ? (isDarkMode ? 'bg-red-900/20 border border-red-800 text-red-400 font-cinzel' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200') 
                            : (isDarkMode ? 'text-stone-600 hover:text-stone-300 hover:bg-white/5 font-cinzel' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200')]">
                        TIMESHEET
                    </button>
                    <button @click="activeTab='mandays'" 
                        :class="['py-2 text-[10px] font-bold rounded-lg transition-all', 
                        activeTab==='mandays' 
                            ? (isDarkMode ? 'bg-red-900/20 border border-red-800 text-red-400 font-cinzel' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200') 
                            : (isDarkMode ? 'text-stone-600 hover:text-stone-300 hover:bg-white/5 font-cinzel' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200')]">
                        MANDAYS
                    </button>
                </div>

                <button v-if="isAdmin" @click="activeTab='admin'" 
                    :class="['w-full py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-2', 
                    activeTab==='admin' 
                        ? (isDarkMode ? 'bg-red-950 text-red-500 border border-red-600 font-cinzel' : 'bg-red-500 text-white shadow-sm') 
                        : (isDarkMode ? 'bg-black/50 text-stone-600 border border-stone-800 hover:text-red-500 hover:border-red-900 font-cinzel' : 'bg-white text-red-500 hover:bg-red-50 shadow-sm')]">
                    {{ isDarkMode ? '⚙️ OVERLORD SETTINGS' : '⚙️ ADMIN SETTINGS' }}
                </button>
            </div>

            <div class="flex justify-end mt-4">
                <button @click="toggleDarkMode" :class="['text-[10px] font-bold transition', isDarkMode ? 'text-stone-600 hover:text-stone-300' : 'text-slate-400 hover:text-blue-600']">
                    {{ isDarkMode ? '☀ RESTORE LIGHT' : '🌙 INVOKE DARKNESS' }}
                </button>
            </div>
        </div>

        <div class="flex-1 p-6 space-y-8 md:overflow-y-auto custom-scrollbar">
            <div v-if="activeTab === 'home'" :class="['mt-20 text-center transition', isDarkMode ? 'text-stone-700 opacity-50' : 'text-slate-400']">
                <div :class="['mb-4 text-6xl', isDarkMode ? 'opacity-20 grayscale' : '']">
                    {{ isDarkMode ? '🏰' : '🏠' }}
                </div>
                <p v-if="isDarkMode" class="font-serif text-xs italic tracking-wider">"Welcome to the void,<br>Vessel."</p>
                <p v-else class="text-sm">Selamat datang di<br>Internal Tools Dashboard</p>
            </div>
            
            <div v-if="activeTab === 'history'" :class="['mt-20 text-center transition', isDarkMode ? 'text-stone-700 opacity-50' : 'text-slate-400']">
                <div :class="['mb-4 text-6xl', isDarkMode ? 'opacity-20 grayscale' : '']">📜</div>
                <p v-if="isDarkMode" class="font-serif text-xs italic tracking-wider">"The past is etched in blood."</p>
                <p v-else class="text-sm">Lihat riwayat transaksi<br>& status email.</p>
            </div>

            <MandaysForm v-if="activeTab === 'mandays'" />
            <TimesheetForm v-if="activeTab === 'timesheet'" />
            <div v-if="activeTab === 'admin' && isAdmin" class="mt-4"><AdminSettings /></div>
        </div>

        <div :class="['sticky bottom-0 z-30 p-4 border-t md:static transition-colors', isDarkMode ? 'bg-neutral-900 border-red-900/20' : 'bg-white border-slate-200']">
            <button v-if="activeTab === 'mandays' || activeTab === 'timesheet'" 
                @click="loadPreview(activeTab)" 
                :disabled="isLoading" 
                :class="['flex items-center justify-center w-full gap-2 py-3 text-xs font-bold transition-all border rounded-xl active:scale-95 disabled:opacity-50', 
                isDarkMode 
                    ? 'text-red-500 bg-red-950/30 border-red-900 hover:bg-red-900/50 hover:text-red-400 font-cinzel tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                    : 'text-white bg-slate-900 hover:bg-slate-800 shadow-lg']">
                <span v-if="isLoading" class="animate-pulse">{{ isDarkMode ? 'DIVINING...' : 'Generating...' }}</span>
                <span v-else>{{ isDarkMode ? 'UPDATE VISION' : 'Update Preview' }}</span>
            </button>
            
            <div v-if="activeTab === 'home' || activeTab === 'history' || activeTab === 'admin'" :class="['text-center text-[10px] mt-2', isDarkMode ? 'text-stone-700 font-cinzel tracking-[0.2em]' : 'text-slate-400']">
                {{ isDarkMode ? 'MbahSlamet© 666' : 'MbahSlamet© 2026' }}
            </div>
        </div>
    </aside>

    <main :class="['flex flex-col flex-1 min-w-0 transition-colors md:h-screen relative overflow-hidden', isDarkMode ? 'bg-black' : 'bg-slate-50/50']">
        
        <div v-if="isDarkMode" class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black pointer-events-none"></div>
        
        <header :class="['sticky top-0 z-10 flex items-center justify-between h-16 px-6 border-b shadow-sm backdrop-blur-md', isDarkMode ? 'bg-neutral-900/80 border-red-900/20' : 'bg-white/80 border-slate-200']">
            <div :class="['font-bold text-sm', isDarkMode ? 'text-stone-300 font-cinzel tracking-wider drop-shadow-md' : 'text-slate-700']">
                {{ headerTitle }}
            </div>
            
            <div v-if="activeTab === 'timesheet' || activeTab === 'mandays'" :class="['flex items-center gap-2 p-1 rounded-lg border', isDarkMode ? 'bg-black/50 border-red-900/20' : 'bg-slate-100 border-transparent']">
                <button @click="zoomOut" :class="['flex items-center justify-center w-6 h-6 font-bold transition rounded-md', isDarkMode ? 'text-stone-500 hover:text-stone-300 hover:bg-white/10' : 'bg-white text-slate-600 shadow-sm']">-</button>
                <input type="range" min="0.3" max="1.5" step="0.1" v-model.number="scale" :class="['w-20 h-1.5 rounded-lg appearance-none cursor-pointer', isDarkMode ? 'bg-red-900/50 accent-red-600' : 'bg-slate-300 accent-blue-600']">
                <button @click="zoomIn" :class="['flex items-center justify-center w-6 h-6 font-bold transition rounded-md', isDarkMode ? 'text-stone-500 hover:text-stone-300 hover:bg-white/10' : 'bg-white text-slate-600 shadow-sm']">+</button>
                <button @click="fitScreen" :class="['px-2 text-[9px] font-bold rounded ml-1', isDarkMode ? 'text-red-500 border border-red-900/30 hover:bg-red-900/20 font-cinzel' : 'text-blue-600 bg-white shadow-sm hover:bg-blue-50']">FIT</button>
            </div>
            
            <button 
                v-if="activeTab === 'timesheet' || activeTab === 'mandays'" 
                @click="openPaymentModal(activeTab)" 
                :disabled="isPaymentLoading"
                :class="['group relative flex items-center gap-2 px-5 py-2 text-xs font-bold transition-all rounded-lg active:scale-95 disabled:opacity-50 overflow-hidden', 
                isDarkMode 
                    ? 'text-stone-200 border bg-red-950 border-red-800 hover:border-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] font-cinzel tracking-widest' 
                    : 'text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30']"
            >
                <div v-if="isDarkMode" class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-600/20 to-transparent group-hover:animate-shimmer"></div>
                <span v-if="isPaymentLoading" class="animate-spin">⏳</span>
                <span v-else>{{ isDarkMode ? '📜' : '📧' }}</span>
                {{ isDarkMode ? 'MANIFEST PDF' : 'Email PDF' }}
            </button>
        </header>
        
        <div class="relative flex items-start justify-center flex-1 p-8 overflow-x-hidden overflow-y-auto custom-scrollbar">
            
            <div v-if="activeTab === 'timesheet' || activeTab === 'mandays'" ref="previewContainer" class="relative z-10">
                <div v-if="htmlContent" :class="['transition-transform duration-200 origin-top-center', isDarkMode ? 'bg-white shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-stone-800' : 'bg-white shadow-2xl']" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '1123px', height: '794px', flexShrink: 0 }">
                    <iframe id="preview-frame" :srcdoc="htmlContent" class="block w-full h-full border-none"></iframe>
                </div>
                <div v-else :class="['flex flex-col items-center justify-center h-full mt-32 text-center opacity-60', isDarkMode ? 'text-stone-700' : 'text-slate-400']">
                    <div :class="['text-6xl mb-4', isDarkMode ? 'grayscale opacity-20' : '']">{{ isDarkMode ? '🕯️' : '📄' }}</div>
                    <p class="font-serif text-sm italic">{{ isDarkMode ? '"The parchment is blank. Perform the ritual on the left."' : 'Silakan isi data di form kiri & klik Update Preview.' }}</p>
                </div>
            </div>

            <div v-if="activeTab === 'home'" :class="['flex flex-col items-center justify-center w-full h-full', isDarkMode ? 'text-stone-600' : 'text-slate-400']">
                <h2 :class="['text-2xl font-bold mb-8', isDarkMode ? 'text-stone-400 font-cinzel drop-shadow-lg' : 'text-slate-600']">
                    {{ isDarkMode ? `Sanctum of ${user?.email}` : `Selamat Datang, ${user?.email}` }}
                </h2>
                
                <div class="grid grid-cols-3 gap-6">
                    <button @click="activeTab='timesheet'" 
                        :class="['p-8 transition group rounded-xl', 
                        isDarkMode 
                            ? 'border bg-neutral-900 border-red-900/20 hover:border-red-600 hover:bg-red-950/10 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                            : 'bg-white shadow hover:shadow-lg text-slate-700']">
                        <div class="mb-4 text-4xl transition opacity-50 group-hover:opacity-100 group-hover:scale-110">⏱️</div>
                        <div :class="['font-bold', isDarkMode ? 'text-stone-400 group-hover:text-red-500 font-cinzel tracking-widest' : '']">Timesheet</div>
                    </button>

                    <button @click="activeTab='mandays'" 
                        :class="['p-8 transition group rounded-xl', 
                        isDarkMode 
                            ? 'border bg-neutral-900 border-red-900/20 hover:border-red-600 hover:bg-red-950/10 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                            : 'bg-white shadow hover:shadow-lg text-slate-700']">
                        <div class="mb-4 text-4xl transition opacity-50 group-hover:opacity-100 group-hover:scale-110">📄</div>
                        <div :class="['font-bold', isDarkMode ? 'text-stone-400 group-hover:text-red-500 font-cinzel tracking-widest' : '']">Mandays</div>
                    </button>

                    <button @click="activeTab='history'" 
                        :class="['p-8 transition group rounded-xl', 
                        isDarkMode 
                            ? 'border bg-neutral-900 border-red-900/20 hover:border-red-600 hover:bg-red-950/10 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                            : 'bg-white shadow hover:shadow-lg text-slate-700']">
                        <div class="mb-4 text-4xl transition opacity-50 group-hover:opacity-100 group-hover:scale-110">📜</div>
                        <div :class="['font-bold', isDarkMode ? 'text-stone-400 group-hover:text-red-500 font-cinzel tracking-widest' : '']">{{ isDarkMode ? 'Records' : 'History' }}</div>
                    </button>
                </div>
            </div>

            <div v-if="activeTab === 'history'" class="w-full max-w-5xl">
                <HistoryList />
            </div>

            <div v-if="activeTab === 'admin' && isAdmin" class="w-full max-w-3xl">
                <AdminSettings />
            </div>

        </div>
    </main>
    </div>
</template>

<style scoped>
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Custom Scrollbar for Dark Mode */
.dark ::-webkit-scrollbar { width: 6px; }
.dark ::-webkit-scrollbar-track { background: #000; }
.dark ::-webkit-scrollbar-thumb { background: #333; border: 1px solid #000; }
.dark ::-webkit-scrollbar-thumb:hover { background: #7f1d1d; }
</style>