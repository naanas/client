<script setup lang="ts">
import { ref, watch } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../composables/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const { user } = useAuth(); // Ambil User Login

const transactions = ref<any[]>([]);
const isLoading = ref(false);
const isChecking = ref<string | null>(null);
const selectedTrx = ref<any | null>(null);
const isDetailOpen = ref(false);

const fetchHistory = async () => {
    // Pastikan user ID ada
    if (!user.value?.id) return;
    
    isLoading.value = true;
    try {
        // GANTI LOGIC: Kirim user_id
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

// Watch User ID (Bukan email lagi, tapi ID lebih unik)
watch(() => user.value?.id, (newId) => {
    if (newId) {
        fetchHistory();
    }
}, { immediate: true });

const checkStatus = async (trx: any) => {
    if (trx.status === 'PAID') return;
    
    isChecking.value = trx.id;
    try {
        await axios.post(`${API_URL}/api/payment/check-status`, { external_id: trx.external_id });
        await fetchHistory(); 
        
        const updated = transactions.value.find(t => t.id === trx.id);
        if (updated?.status === 'PAID') alert("✅ LUNAS! Email dikirim.");
        else alert("ℹ️ Masih PENDING. Cek lagi nanti.");
    } catch (e) {
        alert("Gagal cek status.");
    } finally {
        isChecking.value = null;
    }
};

const openDetail = (trx: any) => { selectedTrx.value = trx; isDetailOpen.value = true; };
const closeDetail = () => { isDetailOpen.value = false; setTimeout(() => selectedTrx.value = null, 300); };

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
        case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-slate-100 text-slate-600';
    }
};
</script>

<template>
  <div class="max-w-5xl p-4 mx-auto md:p-6 animate-fade-in">
    
    <div class="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
        <div>
            <h2 class="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-white">📜 Riwayat Transaksi</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Data Akun: <span class="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{{ user?.email }}</span>
            </p>
        </div>
        <button @click="fetchHistory" :disabled="isLoading" class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 transition rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50">
            <span :class="{'animate-spin': isLoading}">🔄</span> Refresh
        </button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative min-h-[300px]">
        
        <div v-if="isLoading" class="p-4 space-y-4">
            <div v-for="i in 3" :key="i" class="flex justify-between animate-pulse">
                <div class="w-1/4 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div class="w-1/4 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div class="w-1/6 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
        </div>

        <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="text-xs uppercase border-b bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                        <th class="p-4 font-bold">Waktu</th>
                        <th class="p-4 font-bold">Detail</th>
                        <th class="p-4 font-bold text-center">Status</th>
                        <th class="p-4 font-bold text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                    <tr v-if="transactions.length === 0">
                        <td colspan="4" class="p-10 text-center text-slate-400">
                            <div class="mb-2 text-2xl">📭</div>
                            <div>Belum ada transaksi di akun ini.</div>
                        </td>
                    </tr>
                    
                    <tr v-for="trx in transactions" :key="trx.id" class="transition hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td class="p-4">
                            <div class="font-bold text-slate-700 dark:text-slate-200">{{ dayjs(trx.created_at).format('DD MMM') }}</div>
                            <div class="text-xs text-slate-400">{{ dayjs(trx.created_at).format('HH:mm') }}</div>
                        </td>
                        <td class="p-4">
                            <div class="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">{{ trx.type }}</div>
                            <div class="text-[10px] text-slate-400 font-mono">Ke: {{ trx.customer_email }}</div>
                        </td>
                        <td class="p-4 text-center">
                            <span :class="['px-2 py-1 rounded-full text-[10px] font-bold border', getStatusColor(trx.status)]">{{ trx.status }}</span>
                        </td>
                        <td class="p-4 text-right">
                            <div class="flex justify-end gap-2">
                                <button v-if="trx.status === 'PENDING'" @click="checkStatus(trx)" :disabled="isChecking === trx.id" class="text-[10px] px-2 py-1 bg-slate-100 border rounded hover:bg-slate-200">
                                    {{ isChecking === trx.id ? '...' : '🔄 Cek' }}
                                </button>
                                <button @click="openDetail(trx)" class="px-3 py-1 text-xs font-medium bg-white border rounded hover:bg-slate-50">Detail</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <Transition name="modal">
        <div v-if="isDetailOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeDetail"></div>
            <div class="relative w-full max-w-md overflow-hidden bg-white shadow-2xl dark:bg-slate-800 rounded-xl">
                <div class="flex justify-between p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 class="font-bold text-slate-800 dark:text-white">Detail Transaksi</h3>
                    <button @click="closeDetail">✕</button>
                </div>
                <div class="p-6 space-y-4">
                    <div :class="['p-3 rounded-lg border text-center', getStatusColor(selectedTrx?.status)]">
                        <div class="text-xl font-bold">{{ selectedTrx?.status }}</div>
                        <div class="text-xs opacity-75">ID: {{ selectedTrx?.external_id }}</div>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between pb-2 border-b"><span class="text-slate-500">Tanggal</span> <span class="font-medium">{{ dayjs(selectedTrx?.created_at).format('DD MMM YYYY HH:mm') }}</span></div>
                        <div class="flex justify-between pb-2 border-b"><span class="text-slate-500">Tipe</span> <span class="font-medium uppercase">{{ selectedTrx?.type }}</span></div>
                        <div class="flex justify-between pb-2 border-b"><span class="text-slate-500">Dikirim Ke</span> <span class="font-medium">{{ selectedTrx?.customer_email }}</span></div>
                    </div>
                </div>
                <div class="p-3 text-right bg-slate-50 dark:bg-slate-800/50"><button @click="closeDetail" class="px-4 py-2 text-xs font-bold text-white rounded bg-slate-800">Tutup</button></div>
            </div>
        </div>
    </Transition>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>