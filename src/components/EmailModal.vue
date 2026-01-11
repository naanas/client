<script setup lang="ts">
import { useTimesheet } from '../composables/useTimesheet';

const { 
  isEmailModalOpen, 
  emailRecipient, 
  pendingExportType, 
  processPayment, 
  isPaymentLoading 
} = useTimesheet();

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
            <div class="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full shadow-inner bg-white/20 backdrop-blur-md">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h3 class="text-xl font-bold">Kirim PDF via Email</h3>
            <p class="mt-1 text-xs text-blue-100 opacity-90">Export {{ pendingExportType.toUpperCase() }} Premium</p>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <p class="text-sm text-center text-slate-500 dark:text-slate-400">
            Masukkan alamat email tujuan untuk menerima file PDF. Link download akan dikirim otomatis setelah pembayaran sukses.
          </p>

          <div>
             <label class="block mb-1 ml-1 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Email Penerima</label>
             <input 
                v-model="emailRecipient" 
                type="email" 
                placeholder="nama@perusahaan.com"
                class="w-full px-4 py-3 transition-all border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white"
                @keyup.enter="processPayment"
             />
          </div>

          <div class="flex gap-3 mt-4">
             <button 
               @click="closeModal" 
               :disabled="isPaymentLoading"
               class="flex-1 py-3 text-sm font-bold transition text-slate-500 hover:text-slate-700 disabled:opacity-50"
             >
               Batal
             </button>
             
             <button 
               @click="processPayment" 
               :disabled="isPaymentLoading"
               class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               <span v-if="isPaymentLoading" class="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin"></span>
               <span v-else>Bayar & Kirim</span>
             </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9) translateY(20px);
}
</style>