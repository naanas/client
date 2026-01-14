<script setup lang="ts">

const props = defineProps<{
    headerTitle: string;
    activeTab: string;
    isDarkMode: boolean;
    scale: number;
    isPaymentLoading: boolean;
}>();

const emit = defineEmits<{
    (e: 'zoomIn'): void;
    (e: 'zoomOut'): void;
    (e: 'fitScreen'): void;
    (e: 'update:scale', val: number): void;
    (e: 'openPaymentModal', tab: string): void;
    (e: 'toggleSidebar'): void;
}>();
</script>

<template>
    <header :class="['sticky top-0 z-10 flex items-center justify-between h-16 px-6 border-b shadow-sm backdrop-blur-md', isDarkMode ? 'bg-neutral-900/80 border-red-900/20' : 'bg-white/80 border-slate-200']">
        <div class="flex items-center gap-3">
            <button @click="emit('toggleSidebar')" :class="['md:hidden p-2 rounded-lg', isDarkMode ? 'text-stone-300 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100']">
                ☰
            </button>
            <div :class="['font-bold text-sm truncate max-w-[150px] md:max-w-none', isDarkMode ? 'text-stone-300 font-cinzel tracking-wider drop-shadow-md' : 'text-slate-700']">
                {{ headerTitle }}
            </div>
        </div>
        
        <div v-if="activeTab === 'timesheet' || activeTab === 'mandays'" :class="['hidden md:flex items-center gap-2 p-1 rounded-lg border', isDarkMode ? 'bg-black/50 border-red-900/20' : 'bg-slate-100 border-transparent']">
            <button @click="emit('zoomOut')" :class="['flex items-center justify-center w-6 h-6 font-bold transition rounded-md', isDarkMode ? 'text-stone-500 hover:text-stone-300 hover:bg-white/10' : 'bg-white text-slate-600 shadow-sm']">-</button>
            <input type="range" min="0.3" max="1.5" step="0.1" :value="scale" @input="emit('update:scale', ($event.target as HTMLInputElement).valueAsNumber)" :class="['w-20 h-1.5 rounded-lg appearance-none cursor-pointer', isDarkMode ? 'bg-red-900/50 accent-red-600' : 'bg-slate-300 accent-blue-600']">
            <button @click="emit('zoomIn')" :class="['flex items-center justify-center w-6 h-6 font-bold transition rounded-md', isDarkMode ? 'text-stone-500 hover:text-stone-300 hover:bg-white/10' : 'bg-white text-slate-600 shadow-sm']">+</button>
            <button @click="emit('fitScreen')" :class="['px-2 text-[9px] font-bold rounded ml-1', isDarkMode ? 'text-red-500 border border-red-900/30 hover:bg-red-900/20 font-cinzel' : 'text-blue-600 bg-white shadow-sm hover:bg-blue-50']">FIT</button>
        </div>
        
        <button 
            v-if="activeTab === 'timesheet' || activeTab === 'mandays'" 
            @click="emit('openPaymentModal', activeTab)" 
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
</template>
