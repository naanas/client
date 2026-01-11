<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useTimesheet } from '../composables/useTimesheet';
import { useAuth } from '../composables/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const { user } = useAuth();
const { fetchPricing } = useTimesheet();

const prices = ref({
    timesheet_price: 0,
    mandays_price: 0
});
const isLoading = ref(false);
const isSaving = ref(false);

// Load harga saat ini
const loadCurrentPrices = async () => {
    isLoading.value = true;
    try {
        const { data } = await axios.get(`${API_URL}/api/pricing`);
        prices.value = {
            timesheet_price: Number(data.timesheet_price),
            mandays_price: Number(data.mandays_price)
        };
    } finally { isLoading.value = false; }
};

// Simpan ke DB
const savePrices = async () => {
    if (!confirm("Yakin ingin mengubah harga? User akan langsung terkena tarif baru.")) return;
    
    isSaving.value = true;
    try {
        await axios.post(`${API_URL}/api/pricing/update`, {
            user_id: user.value?.id,
            updates: [
                { key: 'timesheet_price', value: prices.value.timesheet_price },
                { key: 'mandays_price', value: prices.value.mandays_price }
            ]
        });
        alert("✅ Harga berhasil diperbarui!");
        fetchPricing(); // Update state global
    } catch (e: any) {
        alert("❌ Gagal: " + (e.response?.data?.error || "Server Error"));
    } finally {
        isSaving.value = false;
    }
};

onMounted(loadCurrentPrices);
</script>

<template>
  <div class="max-w-lg p-6 mx-auto bg-white border shadow dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700 animate-fade-in">
    <div class="flex items-center gap-3 pb-4 mb-6 border-b dark:border-slate-700">
        <div class="p-2 text-red-600 bg-red-100 rounded-lg">⚙️</div>
        <div>
            <h2 class="font-bold text-slate-800 dark:text-white">Pengaturan Harga (Admin)</h2>
            <p class="text-xs text-slate-500">Atur tarif export PDF secara real-time.</p>
        </div>
    </div>

    <div v-if="isLoading" class="py-8 text-center text-slate-400">Loading config...</div>

    <div v-else class="space-y-5">
        <div>
            <label class="block mb-1 text-xs font-bold uppercase text-slate-500">Harga Timesheet (Rp)</label>
            <input v-model.number="prices.timesheet_price" type="number" class="w-full px-4 py-2 font-mono font-bold text-blue-600 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-600" />
        </div>

        <div>
            <label class="block mb-1 text-xs font-bold uppercase text-slate-500">Harga Mandays (Rp)</label>
            <input v-model.number="prices.mandays_price" type="number" class="w-full px-4 py-2 font-mono font-bold text-purple-600 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-600" />
        </div>

        <button 
            @click="savePrices" 
            :disabled="isSaving"
            class="flex justify-center w-full gap-2 py-3 text-sm font-bold text-white transition bg-slate-900 hover:bg-slate-800 rounded-xl"
        >
            <span v-if="isSaving" class="animate-spin">⏳</span>
            <span v-else>💾 Simpan Perubahan</span>
        </button>
    </div>
  </div>
</template>