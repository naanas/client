<script setup lang="ts">
import { computed, watch } from 'vue';
import { useTimesheet } from '../composables/useTimesheet';

const { 
  isEmailModalOpen, 
  emailRecipient, 
  pendingExportType, 
  processPayment, 
  isPaymentLoading,
  pricing,      // State harga dari config
  fetchPricing  // Function update harga
} = useTimesheet();

// 1. Fetch harga terbaru saat modal dibuka
watch(isEmailModalOpen, (isOpen) => {
    if (isOpen) {
        fetchPricing();
    }
});

// 2. Tentukan harga berdasarkan tipe dokumen (Timesheet vs Mandays)
const price = computed(() => {
    return pendingExportType.value === 'mandays' 
        ? pricing.value.mandays_price 
        : pricing.value.timesheet_price;
});

// 3. Format Rupiah
const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

const closeModal = () => {
  if (!isPaymentLoading.value) {
    isEmailModalOpen.value = false;
  }
};
</script>

<template>
  <Transition name="modal">
    <div v-if="isEmailModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      <div 
        class="absolute inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" 
        @click="closeModal"
      ></div>

      <div class="relative w-full max-w-md overflow-hidden transition-all transform bg-white border shadow-2xl dark:bg-slate-800 rounded-2xl border-slate-100 dark:border-slate-700">
        
        <div class="relative p-6 overflow-hidden text-center text-white bg-gradient-to-r from-blue-600 to-purple-600">
          <div class="absolute top-0 left-0 w-full h-full transform scale-150 -skew-y-6 bg-white/10 opacity-30"></div>
          
          <div class="relative z-10">
            <h3 class="text-xl font-bold">Konfirmasi Pembayaran</h3>
            <p class="mt-1 text-xs tracking-wider text-blue-100 uppercase opacity-90">Export {{ pendingExportType }}</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          
          <div class="p-4 border bg-slate-50 dark:bg-slate-900/50 rounded-xl border-slate-100 dark:border-slate-700">
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                  <span class="text-xs font-bold uppercase text-slate-500">Rincian</span>
                  <span class="text-xs font-bold uppercase text-slate-500">Biaya</span>
              </div>
              <div class="flex items-center justify-between text-sm font-medium text-slate-800 dark:text-white">
                  <span>Jasa Generate PDF</span>
                  <span>{{ formatRupiah(price) }}</span>
              </div>
              <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                  <span class="text-sm font-bold text-slate-800 dark:text-white">Total Tagihan</span>
                  <span class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ formatRupiah(price) }}</span>
              </div>
          </div>

          <div>
             <label class="block mb-1 ml-1 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Kirim PDF Ke Email:</label>
             <input 
                v-model="emailRecipient" 
                type="email" 
                placeholder="nama@perusahaan.com"
                class="w-full px-4 py-3 transition-all bg-white border shadow-sm dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white"
                @keyup.enter="processPayment"
             />
             <p class="text-[10px] text-slate-400 mt-1 ml-1">*Link download dikirim otomatis via email setelah lunas.</p>
          </div>

          <div class="flex gap-3 mt-2">
             <button 
               @click="closeModal" 
               :disabled="isPaymentLoading"
               class="flex-1 py-3 text-sm font-bold transition text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50"
             >
               Batal
             </button>
             
             <button 
               @click="processPayment" 
               :disabled="isPaymentLoading"
               class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               <span v-if="isPaymentLoading" class="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin"></span>
               <span v-else>Bayar Sekarang</span>
             </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Modal Transition Animation */
.modal-enter-active, .modal-leave-active { 
    transition: opacity 0.3s ease; 
}
.modal-enter-from, .modal-leave-to { 
    opacity: 0; 
}
.modal-enter-active .relative, .modal-leave-active .relative { 
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
}
.modal-enter-from .relative, .modal-leave-to .relative { 
    transform: scale(0.9) translateY(20px); 
}
</style>