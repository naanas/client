<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import MandaysForm from '../mandays/MandaysForm.vue';
import TimesheetForm from '../timesheet/TimesheetForm.vue';

defineProps<{
    activeTab: string;
    isDarkMode: boolean;
    isLoading: boolean;
    isPaymentLoading: boolean;
}>();

const emit = defineEmits<{
    (e: 'loadPreview', tab: string): void;
    (e: 'openPaymentModal', tab: string): void;
    (e: 'zoomIn'): void;
    (e: 'zoomOut'): void;
    (e: 'fitScreen'): void;
}>();
</script>

<template>
    <div class="w-full mb-6 space-y-4">
        <!-- Mobile Forms -->
        <div :class="['p-4 rounded-xl border shadow-sm', isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-white border-slate-200']">
            <h3 :class="['mb-4 text-sm font-bold uppercase tracking-widest', isDarkMode ? 'text-stone-500' : 'text-slate-400']">{{ activeTab }} Details</h3>
            <MandaysForm v-if="activeTab === 'mandays'" />
            <TimesheetForm v-if="activeTab === 'timesheet'" />

            <!-- Mobile Update Preview Button -->
            <button 
                @click="emit('loadPreview', activeTab)" 
                :disabled="isLoading" 
                :class="['mt-6 flex items-center justify-center w-full gap-2 py-3 text-xs font-bold transition-all border rounded-xl active:scale-95 disabled:opacity-50', 
                isDarkMode 
                    ? 'text-red-500 bg-red-950/30 border-red-900 hover:bg-red-900/50 hover:text-red-400 font-cinzel tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                    : 'text-white bg-slate-900 hover:bg-slate-800 shadow-lg']">
                <span v-if="isLoading" class="animate-pulse">{{ isDarkMode ? 'DIVINING...' : 'Generating...' }}</span>
                <span v-else>{{ isDarkMode ? 'UPDATE VISION' : 'Update Preview' }}</span>
            </button>
        </div>

        <!-- Mobile Zoom Tools -->
        <div :class="['flex items-center justify-between p-3 rounded-xl border shadow-sm', isDarkMode ? 'bg-stone-900 border-red-900/30' : 'bg-white border-slate-200']">
            <span :class="['text-xs font-bold', isDarkMode ? 'text-red-400' : 'text-slate-500']">View Controls</span>
            <div class="flex items-center gap-2">
                <button @click.stop.prevent="emit('zoomOut')" :class="['w-8 h-8 font-bold flex items-center justify-center rounded-lg transition', isDarkMode ? 'bg-black text-stone-400 border border-stone-800' : 'bg-slate-100 text-slate-600']">-</button>
                <button @click.stop.prevent="emit('fitScreen')" :class="['px-3 py-1.5 text-xs font-bold rounded-lg', isDarkMode ? 'bg-red-950 text-red-500 border border-red-900' : 'bg-blue-100 text-blue-600']">FIT</button>
                <button @click.stop.prevent="emit('zoomIn')" :class="['w-8 h-8 font-bold flex items-center justify-center rounded-lg transition', isDarkMode ? 'bg-black text-stone-400 border border-stone-800' : 'bg-slate-100 text-slate-600']">+</button>
            </div>
        </div>

        <!-- Mobile Payment/PDF Button -->
        <button 
            @click="emit('openPaymentModal', activeTab)" 
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
</template>
