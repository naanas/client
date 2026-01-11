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
    mandays_price: 0,
    admin_fee: 0 // FIELD UNTUK EDIT ADMIN FEE
});
const isLoading = ref(false);
const isSaving = ref(false);

const loadCurrentPrices = async () => {
    isLoading.value = true;
    try {
        const { data } = await axios.get(`${API_URL}/api/pricing`);
        // Default values sesuai strategi
        prices.value = {
            timesheet_price: Number(data.timesheet_price || 20000),
            mandays_price: Number(data.mandays_price || 25000),
            admin_fee: Number(data.admin_fee || 4500) 
        };
    } catch (e) { console.error(e); } 
    finally { isLoading.value = false; }
};

const savePrices = async () => {
    if (!confirm("⚠️ Simpan konfigurasi harga baru?")) return;
    
    isSaving.value = true;
    try {
        await axios.post(`${API_URL}/api/pricing/update`, {
            user_id: user.value?.id,
            updates: [
                { key: 'timesheet_price', value: prices.value.timesheet_price },
                { key: 'mandays_price', value: prices.value.mandays_price },
                { key: 'admin_fee', value: prices.value.admin_fee }
            ]
        });
        
        alert("✅ Harga & Fee berhasil diperbarui!");
        await fetchPricing(); 
    } catch (e: any) {
        alert("❌ Gagal: " + (e.response?.data?.error || "Akses Ditolak"));
    } finally {
        isSaving.value = false;
    }
};

onMounted(loadCurrentPrices);
</script>

<template>
  <div class="max-w-xl p-6 mx-auto bg-white border shadow-lg dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700 animate-fade-in">
    <div class="flex items-center gap-4 pb-4 mb-8 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center justify-center w-12 h-12 text-2xl text-red-600 bg-red-100 dark:bg-red-900/30 rounded-xl">⚙️</div>
        <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Admin Pricing Config</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Atur tarif dasar & biaya layanan (Xendit Cover).</p>
        </div>
    </div>

    <div v-if="isLoading" class="py-10 text-center text-slate-400 animate-pulse">Memuat...</div>

    <div v-else class="space-y-6">
        <div>
            <label class="block mb-2 text-xs font-bold uppercase text-slate-500">Harga Timesheet (Base)</label>
            <div class="relative"><span class="absolute font-bold -translate-y-1/2 left-4 top-1/2 text-slate-400">Rp</span>
                <input v-model.number="prices.timesheet_price" type="number" class="w-full py-3 pl-12 pr-4 font-mono text-lg font-bold border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-white focus:outline-none" />
            </div>
        </div>

        <div>
            <label class="block mb-2 text-xs font-bold uppercase text-slate-500">Harga Mandays (Base)</label>
            <div class="relative"><span class="absolute font-bold -translate-y-1/2 left-4 top-1/2 text-slate-400">Rp</span>
                <input v-model.number="prices.mandays_price" type="number" class="w-full py-3 pl-12 pr-4 font-mono text-lg font-bold border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-white focus:outline-none" />
            </div>
        </div>

        <div class="pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
            <label class="block mb-2 text-xs font-bold text-red-500 uppercase">Biaya Layanan (Admin Fee)</label>
            <p class="text-[10px] text-slate-400 mb-2">
                Biaya ini akan ditambahkan ke total tagihan user.<br>
                <span class="font-bold text-slate-500">Rekomendasi: Rp 4.500</span> (Cover VA) atau <span class="font-bold text-slate-500">Rp 5.500</span> (Cover Retail).
            </p>
            <div class="relative"><span class="absolute font-bold -translate-y-1/2 left-4 top-1/2 text-slate-400">Rp</span>
                <input v-model.number="prices.admin_fee" type="number" class="w-full py-3 pl-12 pr-4 font-mono text-lg font-bold text-red-600 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50 dark:bg-red-900/10 focus:outline-none" />
            </div>
        </div>

        <button @click="savePrices" :disabled="isSaving" class="flex items-center justify-center w-full gap-2 py-4 text-sm font-bold text-white transition shadow-lg bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl active:scale-95 disabled:opacity-70">
            <span v-if="isSaving" class="animate-spin">⏳</span>
            <span v-else>💾 Simpan Perubahan</span>
        </button>
    </div>
  </div>
</template>