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
        class="absolute inset-0 transition-opacity bg-black/95 backdrop-blur-md" 
        @click="closeModal"
      ></div>

      <div class="relative w-full max-w-md overflow-hidden transition-all transform bg-neutral-900 border-2 border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.15)] rounded-sm">
        
        <div class="relative p-6 text-center border-b border-red-900/30 bg-gradient-to-b from-red-950 to-neutral-900">
          <h3 class="font-serif text-2xl font-bold tracking-widest text-red-500 uppercase drop-shadow-md">Offering Required</h3>
          <p class="mt-2 text-[10px] text-stone-500 uppercase tracking-[0.2em]">Sacrifice for {{ pendingExportType }}</p>
        </div>

        <div class="p-6 space-y-6">
          
          <div>
              <label class="block mb-3 text-xs font-bold tracking-widest text-center text-red-700 uppercase">CHOOSE YOUR PATH</label>
              <div class="space-y-3">
                  
                  <label class="relative flex items-center justify-between p-4 transition-all border cursor-pointer group border-stone-800 hover:border-red-600 hover:bg-red-950/10"
                         :class="selectedPaymentCategory === 'qris' ? 'border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : ''">
                      <div class="flex items-center gap-4">
                          <input type="radio" value="qris" v-model="selectedPaymentCategory" class="w-4 h-4 accent-red-600">
                          <div>
                              <div class="font-serif text-sm font-bold transition text-stone-200 group-hover:text-red-400">QRIS / E-Wallet</div>
                              <div class="text-[10px] text-stone-500">Instant Invocation</div>
                          </div>
                      </div>
                      <div class="text-xs font-bold text-stone-400">+{{ formatRupiah(pricing.fee_qris || 1000) }}</div>
                  </label>

                  <label class="relative flex items-center justify-between p-4 transition-all border cursor-pointer group border-stone-800 hover:border-red-600 hover:bg-red-950/10"
                         :class="selectedPaymentCategory === 'va' ? 'border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : ''">
                      <div class="flex items-center gap-4">
                          <input type="radio" value="va" v-model="selectedPaymentCategory" class="w-4 h-4 accent-red-600">
                          <div>
                              <div class="font-serif text-sm font-bold transition text-stone-200 group-hover:text-red-400">Virtual Account</div>
                              <div class="text-[10px] text-stone-500">Direct Tribute</div>
                          </div>
                      </div>
                      <div class="text-xs font-bold text-stone-400">+{{ formatRupiah(pricing.fee_va || 4500) }}</div>
                  </label>

                  <label class="relative flex items-center justify-between p-4 transition-all border cursor-pointer group border-stone-800 hover:border-red-600 hover:bg-red-950/10"
                         :class="selectedPaymentCategory === 'retail' ? 'border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : ''">
                      <div class="flex items-center gap-4">
                          <input type="radio" value="retail" v-model="selectedPaymentCategory" class="w-4 h-4 accent-red-600">
                          <div>
                              <div class="font-serif text-sm font-bold transition text-stone-200 group-hover:text-red-400">Marketplace</div>
                              <div class="text-[10px] text-stone-500">Retail Merchants</div>
                          </div>
                      </div>
                      <div class="text-xs font-bold text-stone-400">+{{ formatRupiah(pricing.fee_retail || 6500) }}</div>
                  </label>

              </div>
          </div>

          <div class="relative p-4 overflow-hidden bg-black border border-stone-800">
              <div class="absolute w-16 h-16 rounded-full -right-4 -top-4 bg-red-900/20 blur-xl"></div>
              
              <div class="flex justify-between mb-1 font-mono text-xs text-stone-500">
                  <span>BASE TRIBUTE</span>
                  <span>{{ formatRupiah(basePrice) }}</span>
              </div>

              <div class="flex justify-between pb-2 mb-3 font-mono text-xs border-b text-stone-500 border-stone-800">
                  <span>SERVICE FEE</span>
                  <span>{{ formatRupiah(adminFee) }}</span>
              </div>

              <div class="flex items-end justify-between">
                  <span class="font-serif text-sm font-bold tracking-widest text-red-700">TOTAL SACRIFICE</span>
                  <span class="text-xl font-bold text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] font-serif">{{ formatRupiah(totalPrice) }}</span>
              </div>
          </div>

          <div class="relative group">
             <input 
                v-model="emailRecipient" 
                type="email" 
                placeholder=" "
                class="w-full px-4 py-3 placeholder-transparent transition-all border peer bg-neutral-950 border-stone-700 text-stone-300 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-900"
                @keyup.enter="processPayment"
             />
             <label class="absolute left-4 top-3 text-stone-500 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-stone-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-red-500 peer-focus:bg-neutral-900 peer-focus:px-1 pointer-events-none uppercase tracking-wider">
                Recipient Email
             </label>
          </div>

          <div class="flex gap-4 pt-2">
             <button 
               @click="closeModal" 
               :disabled="isPaymentLoading"
               class="flex-1 py-3 font-serif text-xs font-bold tracking-widest uppercase transition border border-transparent text-stone-500 hover:text-stone-300 hover:border-stone-700"
             >
               Abandon
             </button>
             
             <button 
               @click="processPayment" 
               :disabled="isPaymentLoading"
               class="group relative flex-1 py-3 bg-red-900 hover:bg-red-800 text-stone-200 font-bold text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(153,27,27,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden uppercase border border-red-800 font-serif"
             >
               <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent group-hover:animate-shimmer"></div>
               <span v-if="isPaymentLoading" class="animate-pulse">SEALING PACT...</span>
               <span v-else>SEAL THE PACT</span>
             </button>
          </div>
          
          <p class="text-[9px] text-center text-stone-700 font-mono">
            *The download link shall be summoned to your email upon completion.
          </p>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Shimmer Animation for Button */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}

/* Modal Transition */
.modal-enter-active, .modal-leave-active { 
    transition: opacity 0.5s ease; 
}
.modal-enter-from, .modal-leave-to { 
    opacity: 0; 
}
.modal-enter-active .relative, .modal-leave-active .relative { 
    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1); 
}
.modal-enter-from .relative, .modal-leave-to .relative { 
    transform: scale(0.95) translateY(30px); 
    opacity: 0;
}
</style>