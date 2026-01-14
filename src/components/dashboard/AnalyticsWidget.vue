<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    transactions: any[];
    isDarkMode: boolean;
}>();

const totalPaid = computed(() => props.transactions.filter(t => t.status === 'PAID').length);
const totalPending = computed(() => props.transactions.filter(t => t.status === 'PENDING').length);
const totalRevenue = computed(() => props.transactions
    .filter(t => t.status === 'PAID')
    .reduce((acc, t) => acc + t.amount, 0)
);

function formatRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
}
</script>

<template>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <!-- Card 1: Revenue -->
        <div :class="['p-6 rounded-2xl relative overflow-hidden transition-all duration-500 hover:scale-105', 
            isDarkMode ? 'bg-gradient-to-br from-black to-red-950 border border-red-900/30' : 'bg-white shadow-xl glass-card border border-white/50']">
            <div :class="['absolute -right-4 -top-4 text-8xl opacity-10 font-bold', isDarkMode ? 'text-red-600' : 'text-blue-200']">Rp</div>
            <div class="relative z-10">
                <h3 :class="['text-sm font-bold uppercase tracking-wider', isDarkMode ? 'text-stone-500 font-cinzel' : 'text-slate-400']">Total Revenue</h3>
                <div :class="['text-2xl font-black mt-1', isDarkMode ? 'text-red-500 font-cinzel drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'text-slate-800']">
                    {{ formatRupiah(totalRevenue) }}
                </div>
                <div :class="['text-xs mt-2', isDarkMode ? 'text-stone-600' : 'text-slate-400']">Lifetime Earnings</div>
            </div>
        </div>

        <!-- Card 2: Paid Docs -->
        <div :class="['p-6 rounded-2xl relative overflow-hidden transition-all duration-500 hover:scale-105', 
            isDarkMode ? 'bg-gradient-to-br from-black to-stone-900 border border-red-900/20' : 'bg-white shadow-xl glass-card border border-white/50']">
            <div :class="['absolute -right-4 -top-4 text-8xl opacity-10 font-bold', isDarkMode ? 'text-red-600' : 'text-purple-200']">#</div>
            <div class="relative z-10">
                <h3 :class="['text-sm font-bold uppercase tracking-wider', isDarkMode ? 'text-stone-500 font-cinzel' : 'text-slate-400']">Documents Paid</h3>
                <div :class="['text-3xl font-black mt-1', isDarkMode ? 'text-stone-200 font-cinzel' : 'text-slate-800']">
                    {{ totalPaid }} <span class="text-sm font-normal opacity-50">docs</span>
                </div>
                <div :class="['text-xs mt-2', isDarkMode ? 'text-stone-600' : 'text-green-500']">Completed Transactions</div>
            </div>
        </div>

        <!-- Card 3: Pending -->
        <div :class="['p-6 rounded-2xl relative overflow-hidden transition-all duration-500 hover:scale-105', 
            isDarkMode ? 'bg-gradient-to-br from-black to-stone-900 border border-red-900/20' : 'bg-white shadow-xl glass-card border border-white/50']">
            <div :class="['absolute -right-4 -top-4 text-8xl opacity-10 font-bold', isDarkMode ? 'text-red-600' : 'text-orange-200']">!</div>
            <div class="relative z-10">
                <h3 :class="['text-sm font-bold uppercase tracking-wider', isDarkMode ? 'text-stone-500 font-cinzel' : 'text-slate-400']">Pending</h3>
                <div :class="['text-3xl font-black mt-1', isDarkMode ? 'text-red-500 animate-pulse font-cinzel' : 'text-orange-500']">
                    {{ totalPending }} <span class="text-sm font-normal opacity-50 text-slate-400">docs</span>
                </div>
                <div :class="['text-xs mt-2', isDarkMode ? 'text-stone-600' : 'text-slate-400']">Waiting Payment</div>
            </div>
        </div>
    </div>
</template>
