<script setup lang="ts">
import { ref, watch } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../composables/useAuth';
import { useTimesheet } from '../composables/useTimesheet'; // Ambil isDarkMode

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const { user } = useAuth(); 
const { isDarkMode } = useTimesheet(); // Helper untuk tema

const transactions = ref<any[]>([]);
const isLoading = ref(false);
const isChecking = ref<string | null>(null);
const selectedTrx = ref<any | null>(null);
const isDetailOpen = ref(false);

const fetchHistory = async () => {
    if (!user.value?.id) return;
    
    isLoading.value = true;
    try {
        const { data } = await axios.get(`${API_URL}/api/history`, {
            params: { user_id: user.value.id } 
        });
        transactions.value = data;
    } catch (e) {
        console.error("Gagal load history", e);
    } finally {
        setTimeout(() => isLoading.value = false, 300);
    }
};

watch(() => user.value?.id, (newId) => {
    if (newId) fetchHistory();
}, { immediate: true });

const checkStatus = async (trx: any) => {
    if (trx.status === 'PAID') return;
    
    isChecking.value = trx.id;
    try {
        await axios.post(`${API_URL}/api/payment/check-status`, { external_id: trx.external_id });
        await fetchHistory(); 
        
        const updated = transactions.value.find(t => t.id === trx.id);
        const successMsg = isDarkMode.value ? "🩸 PACT SEALED. The ritual is complete." : "✅ LUNAS! Email dikirim.";
        const pendingMsg = isDarkMode.value ? "⏳ The spirits are still waiting..." : "ℹ️ Masih PENDING. Cek lagi nanti.";

        if (updated?.status === 'PAID') alert(successMsg);
        else alert(pendingMsg);
    } catch (e) {
        alert("Gagal cek status.");
    } finally {
        isChecking.value = null;
    }
};

const openDetail = (trx: any) => { selectedTrx.value = trx; isDetailOpen.value = true; };
const closeDetail = () => { isDetailOpen.value = false; setTimeout(() => selectedTrx.value = null, 300); };

// Helper warna status (Dynamic Theme)
const getStatusColor = (status: string) => {
    if (isDarkMode.value) {
        // Dark Mode Colors
        switch (status) {
            case 'PAID': return 'bg-green-900/20 text-green-500 border-green-900 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
            case 'PENDING': return 'bg-red-900/20 text-red-500 border-red-900 animate-pulse';
            default: return 'bg-stone-900 text-stone-500 border-stone-800';
        }
    } else {
        // Light Mode Colors
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    }
};

// Helper Label Status (Satanic vs Normal)
const getStatusLabel = (status: string) => {
    if (!isDarkMode.value) return status;
    return status === 'PAID' ? 'PACT SEALED' : 'AWAITING SACRIFICE';
};
</script>

<template>
  <div class="w-full max-w-6xl p-4 mx-auto md:p-6 animate-fade-in">
    
    <div class="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
        <div>
            <h2 :class="['flex items-center gap-2 text-2xl font-bold', isDarkMode ? 'text-red-600 font-cinzel tracking-widest' : 'text-slate-800']">
                {{ isDarkMode ? 'ANCIENT RECORDS' : '📜 Riwayat Transaksi' }}
            </h2>
            <p :class="['mt-1 text-sm', isDarkMode ? 'text-stone-500 font-serif italic' : 'text-slate-500']">
                {{ isDarkMode ? 'The deeds of Vessel:' : 'Data Akun:' }} 
                <span :class="['font-mono font-bold px-2 py-0.5 rounded', isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-slate-100 text-slate-700']">{{ user?.email }}</span>
            </p>
        </div>
        <button @click="fetchHistory" :disabled="isLoading" 
            :class="['flex items-center gap-2 px-4 py-2 text-sm font-bold transition rounded-lg disabled:opacity-50', 
            isDarkMode ? 'text-red-500 bg-black border border-red-900 hover:bg-red-900/20 font-cinzel tracking-wider' : 'text-blue-600 bg-blue-50 hover:bg-blue-100']">
            <span :class="{'animate-spin': isLoading}">{{ isDarkMode ? '⟡' : '🔄' }}</span> 
            {{ isDarkMode ? 'INVOKE UPDATE' : 'Refresh' }}
        </button>
    </div>

    <div :class="['rounded-xl shadow-sm border overflow-hidden relative min-h-[300px] transition-all', 
        isDarkMode ? 'bg-black/40 border-red-900/20 backdrop-blur-sm' : 'bg-white border-slate-200']">
        
        <div v-if="isLoading" class="p-6 space-y-6">
            <div v-for="i in 3" :key="i" class="flex justify-between animate-pulse">
                <div :class="['w-1/4 h-4 rounded', isDarkMode ? 'bg-red-900/20' : 'bg-slate-200']"></div>
                <div :class="['w-1/4 h-4 rounded', isDarkMode ? 'bg-red-900/10' : 'bg-slate-200']"></div>
                <div :class="['w-1/6 h-6 rounded-full', isDarkMode ? 'bg-red-900/20' : 'bg-slate-200']"></div>
            </div>
        </div>

        <div v-else-if="transactions.length === 0" :class="['flex flex-col items-center justify-center h-64 text-center', isDarkMode ? 'text-stone-600' : 'text-slate-400']">
            <div class="mb-2 text-4xl opacity-50">{{ isDarkMode ? '🩸' : '📭' }}</div>
            <div :class="[isDarkMode ? 'font-serif italic' : '']">
                {{ isDarkMode ? 'No blood has been spilled yet.' : 'Belum ada transaksi di akun ini.' }}
            </div>
        </div>

        <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr :class="['text-xs uppercase border-b', isDarkMode ? 'bg-black text-red-800 border-red-900/30 font-cinzel tracking-widest' : 'bg-slate-50 text-slate-500 border-slate-200']">
                        <th class="p-4 font-bold">{{ isDarkMode ? 'TIMELINE' : 'Waktu' }}</th>
                        <th class="p-4 font-bold">{{ isDarkMode ? 'MANIFESTATION' : 'Detail' }}</th>
                        <th class="p-4 font-bold text-center">{{ isDarkMode ? 'STATE' : 'Status' }}</th>
                        <th class="p-4 font-bold text-right"></th>
                    </tr>
                </thead>
                <tbody :class="['text-sm divide-y', isDarkMode ? 'divide-red-900/10' : 'divide-slate-100']">
                    <tr v-for="trx in transactions" :key="trx.id" :class="['transition group', isDarkMode ? 'hover:bg-red-950/10' : 'hover:bg-slate-50']">
                        <td class="p-4">
                            <div :class="['font-bold', isDarkMode ? 'text-stone-300 font-cinzel' : 'text-slate-700']">{{ dayjs(trx.created_at).format('DD MMM') }}</div>
                            <div :class="['text-xs', isDarkMode ? 'text-stone-600' : 'text-slate-400']">{{ dayjs(trx.created_at).format('HH:mm') }}</div>
                        </td>
                        <td class="p-4">
                            <div :class="['text-xs font-bold uppercase', isDarkMode ? 'text-red-500 tracking-wider' : 'text-slate-700']">{{ trx.type }} Export</div>
                            <div :class="['text-[10px] font-mono', isDarkMode ? 'text-stone-600' : 'text-slate-400']">To: {{ trx.customer_email }}</div>
                        </td>
                        <td class="p-4 text-center">
                            <span :class="['px-3 py-1 rounded text-[10px] font-bold border transition-all inline-block', getStatusColor(trx.status), isDarkMode ? 'font-cinzel tracking-widest' : 'rounded-full']">
                                {{ getStatusLabel(trx.status) }}
                            </span>
                        </td>
                        <td class="p-4 text-right">
                            <div class="flex justify-end gap-2">
                                <button v-if="trx.status === 'PENDING'" @click="checkStatus(trx)" :disabled="isChecking === trx.id" 
                                    :class="['text-[10px] px-3 py-1 border rounded transition hover:opacity-80', 
                                    isDarkMode ? 'bg-red-950 text-red-400 border-red-900 font-cinzel' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']">
                                    {{ isChecking === trx.id ? '...' : (isDarkMode ? 'DIVINE STATUS' : '🔄 Cek') }}
                                </button>
                                <button @click="openDetail(trx)" 
                                    :class="['px-3 py-1 text-xs font-medium border rounded transition', 
                                    isDarkMode ? 'bg-black text-stone-400 border-stone-800 hover:text-white hover:border-stone-600 font-serif' : 'bg-white hover:bg-slate-50']">
                                    {{ isDarkMode ? 'Inspect' : 'Detail' }}
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <Transition name="modal">
        <div v-if="isDetailOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 transition-opacity bg-slate-900/80 backdrop-blur-sm" @click="closeDetail"></div>
            
            <div :class="['relative w-full max-w-md overflow-hidden shadow-2xl rounded-xl transition-all border', 
                isDarkMode ? 'bg-neutral-900 border-red-900/50' : 'bg-white border-transparent']">
                
                <div :class="['flex justify-between p-4 border-b', isDarkMode ? 'bg-black border-red-900/30' : 'bg-slate-50 border-slate-100']">
                    <h3 :class="['font-bold', isDarkMode ? 'text-red-600 font-cinzel tracking-widest' : 'text-slate-800']">
                        {{ isDarkMode ? 'RITUAL DETAILS' : 'Detail Transaksi' }}
                    </h3>
                    <button @click="closeDetail" :class="isDarkMode ? 'text-stone-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'">✕</button>
                </div>

                <div class="p-6 space-y-6">
                    <div :class="['p-4 rounded-lg border text-center transition-all', getStatusColor(selectedTrx?.status)]">
                        <div :class="['text-xl font-bold', isDarkMode ? 'font-cinzel tracking-[0.2em]' : '']">{{ getStatusLabel(selectedTrx?.status) }}</div>
                        <div :class="['text-xs opacity-75 mt-1 font-mono', isDarkMode ? 'text-stone-400' : '']">ID: {{ selectedTrx?.external_id }}</div>
                    </div>
                    
                    <div :class="['space-y-3 text-sm', isDarkMode ? 'text-stone-400 font-serif' : 'text-slate-600']">
                        <div class="flex justify-between pb-2 border-b border-current border-dashed border-opacity-20">
                            <span>{{ isDarkMode ? 'Timestamp' : 'Tanggal' }}</span> 
                            <span class="font-bold">{{ dayjs(selectedTrx?.created_at).format('DD MMM YYYY HH:mm') }}</span>
                        </div>
                        <div class="flex justify-between pb-2 border-b border-current border-dashed border-opacity-20">
                            <span>{{ isDarkMode ? 'Ritual Type' : 'Tipe' }}</span> 
                            <span class="font-bold uppercase">{{ selectedTrx?.type }}</span>
                        </div>
                        <div class="flex justify-between pb-2 border-b border-current border-dashed border-opacity-20">
                            <span>{{ isDarkMode ? 'Recipient' : 'Dikirim Ke' }}</span> 
                            <span class="font-bold">{{ selectedTrx?.customer_email }}</span>
                        </div>
                    </div>
                </div>

                <div :class="['p-4 text-right', isDarkMode ? 'bg-black/50' : 'bg-slate-50']">
                    <button @click="closeDetail" 
                        :class="['px-6 py-2 text-xs font-bold rounded transition uppercase tracking-wider', 
                        isDarkMode ? 'text-red-500 border border-red-900 hover:bg-red-900/20 font-cinzel' : 'text-white bg-slate-800 hover:bg-slate-700']">
                        {{ isDarkMode ? 'Dismiss' : 'Tutup' }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>