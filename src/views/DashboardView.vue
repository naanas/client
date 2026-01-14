<script setup lang="ts">
    import { ref, onMounted, computed, watch } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useTimesheet } from '../composables/useTimesheet';
    import { useAuth } from '../composables/useAuth';
    import { supabase } from '../config/supabaseClient'; // Import from shared config
    
    // Components
    import Sidebar from '../components/dashboard/Sidebar.vue';
    import DashboardHeader from '../components/dashboard/DashboardHeader.vue';
    import AnalyticsWidget from '../components/dashboard/AnalyticsWidget.vue';
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

    // Fix unused variable warning
    void previewContainer;
    
    const isAdmin = computed(() => user.value && userRole.value === 'admin');

    // Analytics Data
    const transactions = ref<any[]>([]);
    
    async function fetchAnalytics() {
        if (!user.value) return;
        const { data } = await supabase.from('transactions').select('*').eq('user_id', user.value.id);
        if (data) transactions.value = data;
    }

    watch(activeTab, (newTab) => {
        if (newTab === 'home') fetchAnalytics();
    });

    onMounted(() => {
        if (route.query.tab === 'history') activeTab.value = 'history';
        if (user.value) fetchAnalytics();
    });

    // Header Title
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

    // Mobile Sidebar Logic
    const isSidebarOpen = ref(false);
    const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value;
    const closeSidebar = () => isSidebarOpen.value = false;

    // Mobile Responsive Logic (Ref for Conditional Rendering)
    const isMobile = ref(false);
    const checkMobile = () => { isMobile.value = window.innerWidth < 768; };
    
    onMounted(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        if (route.query.tab === 'history') activeTab.value = 'history';
        if (user.value) fetchAnalytics();
    });
</script>
    
<template>
    <div :class="['relative flex flex-col min-h-screen overflow-auto transition-colors duration-300 md:flex-row md:overflow-hidden', isDarkMode ? 'bg-neutral-950 text-stone-300 font-serif selection:bg-red-900 selection:text-white' : 'bg-slate-50 font-sans text-slate-800']">
    
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

    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isSidebarOpen" @click="closeSidebar" class="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"></div>

    <Sidebar 
        :activeTab="activeTab" 
        :isDarkMode="isDarkMode" 
        :user="user" 
        :isAdmin="isAdmin" 
        :isLoading="isLoading"
        :isOpen="isSidebarOpen"
        @update:activeTab="(t) => { activeTab = t as Tab; closeSidebar(); }"
        @toggleDarkMode="toggleDarkMode"
        @logout="handleLogout().then(() => router.replace('/auth'))"
        @loadPreview="(t) => loadPreview(t as 'timesheet' | 'mandays')"
        @close="closeSidebar"
    >
        <!-- DESKTOP: Forms in Sidebar Slot (Hidden on Mobile) -->
        <div v-if="!isMobile">
            <MandaysForm v-if="activeTab === 'mandays'" />
            <TimesheetForm v-if="activeTab === 'timesheet'" />
            <div v-if="activeTab === 'admin' && isAdmin" class="mt-4"><AdminSettings sidebarMode /></div>
        </div>
        <div v-else class="text-center opacity-50 p-4">
            <p class="text-xs italic">Forms moved to Main Content</p>
        </div>
    </Sidebar>

    <main :class="['flex flex-col flex-1 min-w-0 transition-colors md:h-screen relative overflow-hidden', isDarkMode ? 'bg-black' : 'bg-slate-50/50']">
        
        <div v-if="isDarkMode" class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black pointer-events-none"></div>
        <div v-else class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-100/40 via-purple-100/40 to-white pointer-events-none"></div>
        
        <DashboardHeader 
            :headerTitle="headerTitle"
            :activeTab="activeTab"
            :isDarkMode="isDarkMode"
            :scale="scale"
            :isPaymentLoading="isPaymentLoading"
            :user="user"
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @fitScreen="fitScreen"
            @update:scale="scale = $event"
            @openPaymentModal="(t) => openPaymentModal(t as 'timesheet' | 'mandays')"
            @toggleSidebar="toggleSidebar"
        />
        
        <div class="relative flex flex-col items-center justify-start flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto custom-scrollbar">
            
            <!-- MOBILE: Zoom Tools & Forms (Visible only on Mobile) -->
            <div v-if="isMobile && (activeTab === 'timesheet' || activeTab === 'mandays')" class="w-full mb-6 space-y-4">
                <!-- Mobile Forms -->
                <div :class="['p-4 rounded-xl border shadow-sm', isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-white border-slate-200']">
                    <h3 :class="['mb-4 text-sm font-bold uppercase tracking-widest', isDarkMode ? 'text-stone-500' : 'text-slate-400']">{{ activeTab }} Details</h3>
                    <MandaysForm v-if="activeTab === 'mandays'" />
                    <TimesheetForm v-if="activeTab === 'timesheet'" />

                    <!-- Mobile Update Preview Button -->
                    <button 
                        @click="loadPreview(activeTab)" 
                        :disabled="isLoading" 
                        :class="['mt-6 flex items-center justify-center w-full gap-2 py-3 text-xs font-bold transition-all border rounded-xl active:scale-95 disabled:opacity-50', 
                        isDarkMode 
                            ? 'text-red-500 bg-red-950/30 border-red-900 hover:bg-red-900/50 hover:text-red-400 font-cinzel tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                            : 'text-white bg-slate-900 hover:bg-slate-800 shadow-lg']">
                        <span v-if="isLoading" class="animate-pulse">{{ isDarkMode ? 'DIVINING...' : 'Generating...' }}</span>
                        <span v-else>{{ isDarkMode ? 'UPDATE VISION' : 'Update Preview' }}</span>
                    </button>
                </div>

                <!-- Mobile Zoom Tools (Now Below Form, Above Preview) -->
                <div :class="['flex items-center justify-between p-3 rounded-xl border shadow-sm', isDarkMode ? 'bg-stone-900 border-red-900/30' : 'bg-white border-slate-200']">
                    <span :class="['text-xs font-bold', isDarkMode ? 'text-red-400' : 'text-slate-500']">View Controls</span>
                    <div class="flex items-center gap-2">
                        <button @click.stop.prevent="zoomOut" :class="['w-8 h-8 font-bold flex items-center justify-center rounded-lg transition', isDarkMode ? 'bg-black text-stone-400 border border-stone-800' : 'bg-slate-100 text-slate-600']">-</button>
                        <button @click.stop.prevent="fitScreen" :class="['px-3 py-1.5 text-xs font-bold rounded-lg', isDarkMode ? 'bg-red-950 text-red-500 border border-red-900' : 'bg-blue-100 text-blue-600']">FIT</button>
                        <button @click.stop.prevent="zoomIn" :class="['w-8 h-8 font-bold flex items-center justify-center rounded-lg transition', isDarkMode ? 'bg-black text-stone-400 border border-stone-800' : 'bg-slate-100 text-slate-600']">+</button>
                    </div>
                </div>

                <!-- Mobile Payment/PDF Button -->
                <button 
                    @click="openPaymentModal(activeTab as 'timesheet' | 'mandays')" 
                    :disabled="isPaymentLoading"
                    :class="['group relative flex w-full justify-center items-center gap-2 px-5 py-3 text-xs font-bold transition-all rounded-xl active:scale-95 disabled:opacity-50 overflow-hidden', 
                    isDarkMode 
                        ? 'text-stone-200 border bg-red-950 border-red-800 hover:border-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] font-cinzel tracking-widest' 
                        : 'text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30']"
                >
                    <div v-if="isDarkMode" class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-600/20 to-transparent group-hover:animate-shimmer"></div>
                    <span v-if="isPaymentLoading" class="animate-spin">⏳</span>
                    <span v-else>{{ isDarkMode ? '📜' : '📧' }}</span>
                    {{ isDarkMode ? 'MANIFEST PDF' : 'Email PDF' }}
                </button>
            </div>

            <!-- PREVIEW AREA -->
            <div v-if="activeTab === 'timesheet' || activeTab === 'mandays'" ref="previewContainer" class="relative z-10 transition-all duration-500 ease-out w-full flex justify-center">
                <div v-if="htmlContent" :class="['transition-transform duration-200 origin-top-center', isDarkMode ? 'bg-white shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-stone-800' : 'bg-white shadow-2xl ring-1 ring-black/5 rounded-sm']" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '1123px', height: '794px', flexShrink: 0 }">
                    <iframe id="preview-frame" :srcdoc="htmlContent" class="block w-full h-full border-none"></iframe>
                </div>
                <div v-else :class="['flex flex-col items-center justify-center h-full mt-32 text-center opacity-60', isDarkMode ? 'text-stone-700' : 'text-slate-400']">
                    <div :class="['text-6xl mb-4', isDarkMode ? 'grayscale opacity-20' : '']">{{ isDarkMode ? '🕯️' : '📄' }}</div>
                    <p class="font-serif text-sm italic">{{ isDarkMode ? '"The parchment is blank. Perform the ritual on the left."' : 'Silakan isi data di form kiri & klik Update Preview.' }}</p>
                </div>
            </div>

            <!-- HOME / DASHBOARD -->
            <div v-if="activeTab === 'home'" :class="['flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto', isDarkMode ? 'text-stone-600' : 'text-slate-400']">
                <div class="w-full mb-12 text-center">
                    <h2 :class="['text-3xl font-bold mb-2', isDarkMode ? 'text-stone-400 font-cinzel drop-shadow-lg' : 'text-slate-700']">
                        {{ isDarkMode ? `Sanctum of ${user?.email?.split('@')[0]}` : `Halo, ${user?.email?.split('@')[0]}` }}
                    </h2>
                    <p :class="['text-sm', isDarkMode ? 'text-stone-600 italic font-serif' : 'text-slate-500']">
                        {{ isDarkMode ? 'Your dark deeds are recorded below.' : 'Selamat datang kembali di dashboard Anda.' }}
                    </p>
                </div>

                <!-- ANALYTICS WIDGET -->
                <div class="w-full mb-12">
                    <AnalyticsWidget :transactions="transactions" :isDarkMode="isDarkMode" />
                </div>
                
                <h3 :class="['text-xs font-bold uppercase tracking-widest mb-6 w-full text-left ml-2', isDarkMode ? 'text-red-900/50' : 'text-slate-400']">Quick Actions</h3>

                <div class="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                    <button @click="activeTab='timesheet'" 
                        :class="['p-8 transition group rounded-2xl relative overflow-hidden', 
                        isDarkMode 
                            ? 'border bg-neutral-900 border-red-900/20 hover:border-red-600 hover:bg-red-950/10 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                            : 'bg-white shadow-lg hover:shadow-xl hover:-translate-y-1 glass-card']">
                        <div class="absolute top-0 right-0 p-4 opacity-10">
                             <span class="text-6xl">⏱️</span>
                        </div>
                        <div class="mb-4 text-4xl transition opacity-50 group-hover:opacity-100 group-hover:scale-110">⏱️</div>
                        <div :class="['font-bold text-lg', isDarkMode ? 'text-stone-400 group-hover:text-red-500 font-cinzel tracking-widest' : 'text-slate-700 group-hover:text-blue-600']">Create Timesheet</div>
                        <p class="mt-2 text-xs opacity-60">Generate Laporan Lembur Bulanan.</p>
                    </button>

                    <button @click="activeTab='mandays'" 
                        :class="['p-8 transition group rounded-2xl relative overflow-hidden', 
                        isDarkMode 
                            ? 'border bg-neutral-900 border-red-900/20 hover:border-red-600 hover:bg-red-950/10 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                            : 'bg-white shadow-lg hover:shadow-xl hover:-translate-y-1 glass-card']">
                        <div class="absolute top-0 right-0 p-4 opacity-10">
                             <span class="text-6xl">📄</span>
                        </div>
                        <div class="mb-4 text-4xl transition opacity-50 group-hover:opacity-100 group-hover:scale-110">📄</div>
                        <div :class="['font-bold text-lg', isDarkMode ? 'text-stone-400 group-hover:text-red-500 font-cinzel tracking-widest' : 'text-slate-700 group-hover:text-blue-600']">Create Mandays</div>
                        <p class="mt-2 text-xs opacity-60">Generate Laporan Harian Proyek.</p>
                    </button>

                    <button @click="activeTab='history'" 
                        :class="['p-8 transition group rounded-2xl relative overflow-hidden', 
                        isDarkMode 
                            ? 'border bg-neutral-900 border-red-900/20 hover:border-red-600 hover:bg-red-950/10 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                            : 'bg-white shadow-lg hover:shadow-xl hover:-translate-y-1 glass-card']">
                        <div class="absolute top-0 right-0 p-4 opacity-10">
                             <span class="text-6xl">📜</span>
                        </div>
                        <div class="mb-4 text-4xl transition opacity-50 group-hover:opacity-100 group-hover:scale-110">📜</div>
                        <div :class="['font-bold text-lg', isDarkMode ? 'text-stone-400 group-hover:text-red-500 font-cinzel tracking-widest' : 'text-slate-700 group-hover:text-blue-600']">{{ isDarkMode ? 'Grimoire Records' : 'View History' }}</div>
                        <p class="mt-2 text-xs opacity-60">Lihat status pembayaran & unduh ulang.</p>
                    </button>
                </div>
            </div>

            <!-- HISTORY LIST -->
            <div v-if="activeTab === 'history'" class="w-full max-w-5xl">
                <HistoryList />
            </div>

            <!-- ADMIN SETTINGS -->
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
</style>