<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
    activeTab: string;
    isDarkMode: boolean;
    user: any;
    isAdmin: boolean;
    isLoading?: boolean;
    isOpen: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:activeTab', tab: string): void;
    (e: 'toggleDarkMode'): void;
    (e: 'logout'): void;
    (e: 'loadPreview', tab: string): void;
    (e: 'close'): void;
}>();
</script>

<template>
    <aside :class="['fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 md:translate-x-0 md:static md:w-80 md:flex flex-col flex-shrink-0 border-b md:border-b-0 md:border-r shadow-xl', 
        isDarkMode ? 'bg-neutral-900 border-red-900/20' : 'bg-white border-slate-200',
        isOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
        <div :class="['sticky top-0 z-30 p-6 border-b md:static transition-colors', isDarkMode ? 'bg-neutral-900 border-red-900/20' : 'bg-white border-slate-100']">
            <div class="flex items-center justify-between mb-8">
                <!-- Mobile: Title + Close -->
                <div class="flex items-center justify-between w-full md:w-auto md:justify-start gap-3">
                    <div class="flex items-center gap-3">
                        <div :class="['flex items-center justify-center w-10 h-10 text-xl font-bold rounded-lg shadow-lg transition-all', isDarkMode ? 'text-red-500 bg-black border border-red-900 font-cinzel' : 'text-white bg-blue-600']">
                            {{ isDarkMode ? '†' : 'P' }}
                        </div>
                        <div>
                            <h1 :class="['text-sm font-bold tracking-widest uppercase', isDarkMode ? 'text-stone-200 font-cinzel' : 'text-slate-800']">
                                {{ isDarkMode ? 'Grimoire' : 'Pegadaian' }}
                            </h1>
                            <div class="flex items-center gap-1.5 mt-1">
                                <span :class="['w-1.5 h-1.5 rounded-full animate-pulse', isDarkMode ? 'bg-red-600 shadow-[0_0_5px_red]' : 'bg-green-500']"></span>
                                <span :class="['text-[10px] font-medium truncate max-w-[80px]', isDarkMode ? 'text-stone-500 font-mono' : 'text-slate-500']">{{ user?.email?.split('@')[0] }}</span>
                            </div>
                        </div>
                    </div>
                
                    <!-- Mobile Close Button (Inside Header) -->
                    <button v-if="isOpen" @click="emit('close')" class="md:hidden p-2 text-slate-400 hover:text-red-500">
                        ✕
                    </button>
                </div>

                <!-- Desktop Logout (Hidden on Mobile) -->
                <button @click="emit('logout')" :class="['hidden md:block p-2 transition rounded', isDarkMode ? 'hover:bg-red-950 text-stone-600 hover:text-red-500' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100']" title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
            </div>

            <div :class="['flex flex-col gap-2 p-2 rounded-xl transition-all', isDarkMode ? 'border border-red-900/10 bg-black/40' : 'bg-slate-50 border border-slate-100']">
                <div class="grid grid-cols-2 gap-2">
                    <button @click="emit('update:activeTab', 'home')" 
                        :class="['py-2 text-[10px] font-bold rounded-lg transition-all', 
                        activeTab==='home' 
                            ? (isDarkMode ? 'bg-red-900/20 border border-red-800 text-red-400 font-cinzel shadow-[inset_0_0_10px_rgba(220,38,38,0.2)]' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200') 
                            : (isDarkMode ? 'text-stone-600 hover:text-stone-300 hover:bg-white/5 font-cinzel' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200')]">
                        HOME
                    </button>
                    <button @click="emit('update:activeTab', 'history')" 
                        :class="['py-2 text-[10px] font-bold rounded-lg transition-all', 
                        activeTab==='history' 
                            ? (isDarkMode ? 'bg-red-900/20 border border-red-800 text-red-400 font-cinzel' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200') 
                            : (isDarkMode ? 'text-stone-600 hover:text-stone-300 hover:bg-white/5 font-cinzel' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200')]">
                        {{ isDarkMode ? 'RECORDS' : 'HISTORY' }}
                    </button>
                    <button @click="emit('update:activeTab', 'timesheet')" 
                        :class="['py-2 text-[10px] font-bold rounded-lg transition-all', 
                        activeTab==='timesheet' 
                            ? (isDarkMode ? 'bg-red-900/20 border border-red-800 text-red-400 font-cinzel' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200') 
                            : (isDarkMode ? 'text-stone-600 hover:text-stone-300 hover:bg-white/5 font-cinzel' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200')]">
                        TIMESHEET
                    </button>
                    <button @click="emit('update:activeTab', 'mandays')" 
                        :class="['py-2 text-[10px] font-bold rounded-lg transition-all', 
                        activeTab==='mandays' 
                            ? (isDarkMode ? 'bg-red-900/20 border border-red-800 text-red-400 font-cinzel' : 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200') 
                            : (isDarkMode ? 'text-stone-600 hover:text-stone-300 hover:bg-white/5 font-cinzel' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200')]">
                        MANDAYS
                    </button>
                </div>

                <button v-if="isAdmin" @click="emit('update:activeTab', 'admin')" 
                    :class="['w-full py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-2', 
                    activeTab==='admin' 
                        ? (isDarkMode ? 'bg-red-950 text-red-500 border border-red-600 font-cinzel' : 'bg-red-500 text-white shadow-sm') 
                        : (isDarkMode ? 'bg-black/50 text-stone-600 border border-stone-800 hover:text-red-500 hover:border-red-900 font-cinzel' : 'bg-white text-red-500 hover:bg-red-50 shadow-sm')]">
                    {{ isDarkMode ? '⚙️ OVERLORD SETTINGS' : '⚙️ ADMIN SETTINGS' }}
                </button>
            </div>

            <div class="flex justify-end mt-4">
                <button @click="emit('toggleDarkMode')" :class="['text-[10px] font-bold transition', isDarkMode ? 'text-stone-600 hover:text-stone-300' : 'text-slate-400 hover:text-blue-600']">
                    {{ isDarkMode ? '☀ RESTORE LIGHT' : '🌙 INVOKE DARKNESS' }}
                </button>
            </div>
        </div>
        
        <!-- Slot Content (Forms) -->
        <div class="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar select-text">
            <slot />
        </div>

        <div :class="['hidden md:block sticky bottom-0 z-30 p-4 border-t md:static transition-colors', isDarkMode ? 'bg-neutral-900 border-red-900/20' : 'bg-white border-slate-200']">
            <button v-if="activeTab === 'mandays' || activeTab === 'timesheet'" 
                @click="emit('loadPreview', activeTab)" 
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
</template>
