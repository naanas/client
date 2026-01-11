<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useTimesheet } from '../composables/useTimesheet';
import { useAuth } from '../composables/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const { user } = useAuth();
// Ambil isDarkMode untuk styling hybrid
const { fetchPricing, isDarkMode } = useTimesheet(); 

const prices = ref({
    timesheet_price: 0,
    mandays_price: 0,
    fee_qris: 0,   // Fee QRIS
    fee_va: 0,     // Fee VA
    fee_retail: 0  // Fee Retail
});

const isLoading = ref(false);
const isSaving = ref(false);

const loadCurrentPrices = async () => {
    isLoading.value = true;
    try {
        const { data } = await axios.get(`${API_URL}/api/pricing`);
        // Map data dari backend ke state lokal
        prices.value = {
            timesheet_price: Number(data.timesheet_price || 20000),
            mandays_price: Number(data.mandays_price || 25000),
            fee_qris: Number(data.fee_qris || 1000),
            fee_va: Number(data.fee_va || 4500),
            fee_retail: Number(data.fee_retail || 6500)
        };
    } catch (e) { console.error(e); } 
    finally { isLoading.value = false; }
};

const savePrices = async () => {
    const msg = isDarkMode.value ? "ALTER THE LAWS OF REALITY?" : "Simpan konfigurasi harga baru?";
    if (!confirm(msg)) return;
    
    isSaving.value = true;
    try {
        await axios.post(`${API_URL}/api/pricing/update`, {
            user_id: user.value?.id,
            updates: [
                { key: 'timesheet_price', value: prices.value.timesheet_price },
                { key: 'mandays_price', value: prices.value.mandays_price },
                { key: 'fee_qris', value: prices.value.fee_qris },
                { key: 'fee_va', value: prices.value.fee_va },
                { key: 'fee_retail', value: prices.value.fee_retail }
            ]
        });
        
        alert(isDarkMode.value ? "THE PACT HAS BEEN SEALED." : "✅ Harga & Fee berhasil diperbarui!");
        await fetchPricing(); // Refresh global pricing
    } catch (e: any) {
        alert("❌ Gagal: " + (e.response?.data?.error || "Akses Ditolak"));
    } finally {
        isSaving.value = false;
    }
};

onMounted(loadCurrentPrices);
</script>

<template>
  <div :class="['max-w-2xl p-6 mx-auto border shadow-lg rounded-xl transition-all', 
      isDarkMode ? 'bg-black border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'bg-white border-slate-200']">
    
    <div :class="['flex items-center gap-4 pb-4 mb-6 border-b', isDarkMode ? 'border-red-900/30' : 'border-slate-100']">
        <div :class="['flex items-center justify-center w-12 h-12 text-2xl rounded-xl', isDarkMode ? 'bg-neutral-900 text-red-600 border border-red-900' : 'bg-red-100 text-red-600']">
            {{ isDarkMode ? '⚙️' : '⚙️' }}
        </div>
        <div>
            <h2 :class="['text-xl font-bold', isDarkMode ? 'text-red-600 font-cinzel tracking-widest' : 'text-slate-800']">
                {{ isDarkMode ? 'TRIBUTE CONFIG' : 'Admin Pricing Config' }}
            </h2>
            <p :class="['text-xs', isDarkMode ? 'text-stone-500 font-serif italic' : 'text-slate-500']">
                {{ isDarkMode ? 'Adjust the sacrifices required.' : 'Atur tarif dasar & biaya layanan.' }}
            </p>
        </div>
    </div>

    <div v-if="isLoading" :class="['py-10 text-center animate-pulse', isDarkMode ? 'text-red-800 font-cinzel tracking-widest' : 'text-slate-400']">
        {{ isDarkMode ? 'CONSULTING THE ORACLE...' : 'Memuat...' }}
    </div>

    <div v-else class="space-y-8">
        
        <div class="space-y-4">
            <h3 :class="['text-xs font-bold uppercase tracking-wider', isDarkMode ? 'text-stone-500 border-b border-red-900/20 pb-1 font-cinzel' : 'text-slate-400 border-b pb-1']">
                {{ isDarkMode ? 'BASE SACRIFICES' : 'Harga Dokumen Dasar' }}
            </h3>
            
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label :class="['block mb-2 text-xs font-bold uppercase', isDarkMode ? 'text-red-800 font-cinzel' : 'text-slate-500']">
                        {{ isDarkMode ? 'Timesheet Value' : 'Harga Timesheet' }}
                    </label>
                    <div class="relative">
                        <span :class="['absolute font-bold -translate-y-1/2 left-4 top-1/2', isDarkMode ? 'text-red-900' : 'text-slate-400']">Rp</span>
                        <input v-model.number="prices.timesheet_price" type="number" 
                            :class="['w-full py-3 pl-12 pr-4 font-mono text-lg font-bold transition outline-none', 
                            isDarkMode ? 'bg-neutral-900 border-b border-red-900/50 text-stone-200 focus:border-red-500 rounded-t-sm' : 'bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500']" />
                    </div>
                </div>

                <div>
                    <label :class="['block mb-2 text-xs font-bold uppercase', isDarkMode ? 'text-red-800 font-cinzel' : 'text-slate-500']">
                        {{ isDarkMode ? 'Mandays Value' : 'Harga Mandays' }}
                    </label>
                    <div class="relative">
                        <span :class="['absolute font-bold -translate-y-1/2 left-4 top-1/2', isDarkMode ? 'text-red-900' : 'text-slate-400']">Rp</span>
                        <input v-model.number="prices.mandays_price" type="number" 
                             :class="['w-full py-3 pl-12 pr-4 font-mono text-lg font-bold transition outline-none', 
                            isDarkMode ? 'bg-neutral-900 border-b border-red-900/50 text-stone-200 focus:border-red-500 rounded-t-sm' : 'bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500']" />
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-4">
             <h3 :class="['text-xs font-bold uppercase tracking-wider', isDarkMode ? 'text-stone-500 border-b border-red-900/20 pb-1 font-cinzel' : 'text-slate-400 border-b pb-1']">
                {{ isDarkMode ? 'GATEWAY TRIBUTES (FEES)' : 'Biaya Layanan (Fee)' }}
            </h3>
            
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label :class="['block mb-2 text-[10px] font-bold uppercase', isDarkMode ? 'text-stone-600' : 'text-slate-500']">QRIS / E-Wallet</label>
                    <div class="relative">
                        <input v-model.number="prices.fee_qris" type="number" 
                             :class="['w-full py-2 px-3 font-mono font-bold transition outline-none text-sm', 
                            isDarkMode ? 'bg-black border border-stone-800 text-stone-400 focus:border-red-500' : 'bg-white border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-blue-500']" />
                    </div>
                </div>
                 <div>
                    <label :class="['block mb-2 text-[10px] font-bold uppercase', isDarkMode ? 'text-stone-600' : 'text-slate-500']">Virtual Account</label>
                    <div class="relative">
                        <input v-model.number="prices.fee_va" type="number" 
                             :class="['w-full py-2 px-3 font-mono font-bold transition outline-none text-sm', 
                            isDarkMode ? 'bg-black border border-stone-800 text-stone-400 focus:border-red-500' : 'bg-white border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-blue-500']" />
                    </div>
                </div>
                 <div>
                    <label :class="['block mb-2 text-[10px] font-bold uppercase', isDarkMode ? 'text-stone-600' : 'text-slate-500']">Retail (Indomaret)</label>
                    <div class="relative">
                        <input v-model.number="prices.fee_retail" type="number" 
                             :class="['w-full py-2 px-3 font-mono font-bold transition outline-none text-sm', 
                            isDarkMode ? 'bg-black border border-stone-800 text-stone-400 focus:border-red-500' : 'bg-white border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-blue-500']" />
                    </div>
                </div>
            </div>
            
            <p :class="['text-[10px] italic', isDarkMode ? 'text-red-900' : 'text-slate-400']">
                *Fee akan ditambahkan otomatis saat user memilih metode pembayaran.
            </p>
        </div>

        <button @click="savePrices" :disabled="isSaving" 
            :class="['flex items-center justify-center w-full gap-2 py-4 text-xs font-bold uppercase tracking-widest transition shadow-lg active:scale-95 disabled:opacity-70', 
            isDarkMode ? 'bg-red-900 text-stone-200 hover:bg-red-800 border border-red-700 shadow-red-900/20 font-cinzel' : 'bg-slate-900 text-white hover:bg-slate-800 rounded-xl']">
            <span v-if="isSaving" class="animate-spin">⏳</span>
            <span v-else>{{ isDarkMode ? 'OVERWRITE REALITY' : '💾 Simpan Perubahan' }}</span>
        </button>
    </div>
  </div>
</template>