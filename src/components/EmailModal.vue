<script setup lang="ts">
import { computed, watch } from 'vue';
import { useTimesheet } from '../composables/useTimesheet';

const { 
  isEmailModalOpen, 
  emailRecipient, 
  pendingExportType, 
  processPayment, 
  isPaymentLoading,
  pricing,      
  fetchPricing,
  selectedPaymentCategory // Ambil state pilihan kategori bayar
} = useTimesheet();

// 1. Fetch harga terbaru saat modal dibuka
watch(isEmailModalOpen, (isOpen) => {
    if (isOpen) {
        fetchPricing();
    }
});

// 2. Hitung Harga Dasar (Dokumen)
const basePrice = computed(() => {
    return pendingExportType.value === 'mandays' 
        ? pricing.value.mandays_price 
        : pricing.value.timesheet_price;
});

// 3. Hitung Admin Fee (Dinamis berdasarkan Pilihan User)
const adminFee = computed(() => {
    if (selectedPaymentCategory.value === 'qris') return pricing.value.fee_qris || 1000;
    if (selectedPaymentCategory.value === 'retail') return pricing.value.fee_retail || 6500;
    return pricing.value.fee_va || 4500; // Default VA
});

// 4. Hitung Total Tagihan
const totalPrice = computed(() => basePrice.value + adminFee.value);

// Format Rupiah
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
        
        <div class="relative p-5 overflow-hidden text-center text-white bg-gradient-to-r from-blue-600 to-purple-600">
          <div class="absolute top-0 left-0 w-full h-full transform scale-150 -skew-y-6 bg-white/10 opacity-30"></div>
          <div class="relative z-10">
            <h3 class="text-lg font-bold">Checkout Export {{ pendingExportType }}</h3>
          </div>
        </div>

        <div class="p-5 space-y-5">
          
          <div>
              <label class="block mb-2 ml-1 text-xs font-bold uppercase text-slate-500">Pilih Metode Pembayaran</label>
              <div class="space-y-2">
                  
                  <label class="flex items-center justify-between p-3 transition border cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50"
                         :class="selectedPaymentCategory === 'qris' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-600'">
                      <div class="flex items-center gap-3">
                          <input type="radio" value="qris" v-model="selectedPaymentCategory" class="text-blue-600 focus:ring-blue-500">
                          <div>
                              <div class="text-sm font-bold text-slate-700 dark:text-white">QRIS / E-Wallet</div>
                              <div class="text-[10px] text-slate-500">Scan QR, GoPay, Dana, ShopeePay</div>
                          </div>
                      </div>
                      <div class="text-xs font-bold text-green-600">+{{ formatRupiah(pricing.fee_qris || 1000) }}</div>
                  </label>

                  <label class="flex items-center justify-between p-3 transition border cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50"
                         :class="selectedPaymentCategory === 'va' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-600'">
                      <div class="flex items-center gap-3">
                          <input type="radio" value="va" v-model="selectedPaymentCategory" class="text-blue-600 focus:ring-blue-500">
                          <div>
                              <div class="text-sm font-bold text-slate-700 dark:text-white">Virtual Account</div>
                              <div class="text-[10px] text-slate-500">BCA, BRI, Mandiri, BNI, dll</div>
                          </div>
                      </div>
                      <div class="text-xs font-bold text-slate-600">+{{ formatRupiah(pricing.fee_va || 4500) }}</div>
                  </label>

                  <label class="flex items-center justify-between p-3 transition border cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50"
                         :class="selectedPaymentCategory === 'retail' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-600'">
                      <div class="flex items-center gap-3">
                          <input type="radio" value="retail" v-model="selectedPaymentCategory" class="text-blue-600 focus:ring-blue-500">
                          <div>
                              <div class="text-sm font-bold text-slate-700 dark:text-white">Minimarket</div>
                              <div class="text-[10px] text-slate-500">Indomaret / Alfamart</div>
                          </div>
                      </div>
                      <div class="text-xs font-bold text-slate-600">+{{ formatRupiah(pricing.fee_retail || 6500) }}</div>
                  </label>

              </div>
          </div>

          <div class="p-4 border bg-slate-50 dark:bg-slate-900/50 rounded-xl border-slate-100 dark:border-slate-700">
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                  <span class="text-xs font-bold uppercase text-slate-500">Rincian</span>
                  <span class="text-xs font-bold uppercase text-slate-500">Biaya</span>
              </div>
              
              <div class="flex items-center justify-between mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <span>Harga Dokumen</span>
                  <span>{{ formatRupiah(basePrice) }}</span>
              </div>

              <div class="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                  <span>Biaya Layanan</span>
                  <span>{{ formatRupiah(adminFee) }}</span>
              </div>

              <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                  <span class="text-sm font-bold text-slate-800 dark:text-white">Total Tagihan</span>
                  <span class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ formatRupiah(totalPrice) }}</span>
              </div>
          </div>

          <div>
             <input 
                v-model="emailRecipient" 
                type="email" 
                placeholder="Masukkan Email Tujuan..."
                class="w-full px-4 py-3 transition-all bg-white border shadow-sm dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white"
                @keyup.enter="processPayment"
             />
             <p class="text-[10px] text-slate-400 mt-1 ml-1">*Link download dikirim otomatis via email setelah lunas.</p>
          </div>

          <div class="flex gap-3 pt-2">
             <button 
               @click="closeModal" 
               :disabled="isPaymentLoading"
               class="flex-1 py-3 text-sm font-bold transition text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl"
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