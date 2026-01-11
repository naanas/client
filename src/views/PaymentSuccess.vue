<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const seconds = ref(5);
const externalId = route.query.external_id || '-';
let timer: any = null;

// GANTI LOGIC REDIRECT KE HISTORY
const goHistory = () => {
  router.push('/?tab=history'); 
};

onMounted(() => {
  timer = setInterval(() => {
    seconds.value--;
    if (seconds.value <= 0) {
      clearInterval(timer);
      goHistory(); // Panggil fungsi baru
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen transition-colors bg-slate-50 dark:bg-slate-900">
    <div class="w-full max-w-md p-8 text-center bg-white border shadow-xl dark:bg-slate-800 rounded-2xl border-slate-100 dark:border-slate-700">
      
      <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full dark:bg-green-900/30">
        <svg class="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h1 class="mb-2 text-2xl font-bold text-slate-800 dark:text-white">Pembayaran Berhasil!</h1>
      <p class="mb-6 text-slate-500 dark:text-slate-400">
        Invoice ID <span class="font-mono font-bold text-slate-700 dark:text-slate-300">#{{ externalId }}</span> lunas.
      </p>
      
      <div class="px-4 py-3 mb-6 text-sm text-left text-blue-700 border border-blue-100 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
        📧 <b>PENTING:</b><br>
        Sistem sedang memproses PDF Anda.<br>
        Silakan cek <b>Riwayat Transaksi</b> atau Email Anda.
      </div>

      <p class="mb-2 text-xs text-slate-400">
        Membuka riwayat transaksi dalam <span class="font-bold text-slate-600 dark:text-slate-300">{{ seconds }}</span> detik...
      </p>

      <button 
        @click="goHistory" 
        class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-bold transition text-sm"
      >
        Lihat Riwayat Sekarang
      </button>

    </div>
  </div>
</template>