<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const router = useRouter();
const route = useRoute();

const MAX_ATTEMPTS = 20;
const RETRY_MS = 3000;

const seconds = ref(8);
const externalId = String(route.query.external_id || '');
const fulfillStatus = ref<'loading' | 'ok' | 'pending' | 'error'>('loading');
const fulfillMessage = ref('Memproses PDF dan mengirim ke email...');
let timer: ReturnType<typeof setInterval> | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const goHistory = () => {
  if (timer) clearInterval(timer);
  router.push('/?tab=history');
};

const startRedirectTimer = () => {
  timer = setInterval(() => {
    seconds.value--;
    if (seconds.value <= 0) {
      goHistory();
    }
  }, 1000);
};

const fulfillPayment = async () => {
  if (!externalId || externalId === '-') {
    fulfillStatus.value = 'error';
    fulfillMessage.value = 'ID transaksi tidak ditemukan di URL.';
    startRedirectTimer();
    return;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    fulfillMessage.value =
      attempt === 1
        ? 'Memproses PDF dan mengirim ke email...'
        : `Menunggu konfirmasi Xendit... (${attempt}/${MAX_ATTEMPTS})`;

    try {
      const { data } = await axios.post(`${API_URL}/api/payment/fulfill`, {
        external_id: externalId,
      });
      fulfillStatus.value = 'ok';
      fulfillMessage.value = data.message || 'PDF dikirim ke email Anda.';
      startRedirectTimer();
      return;
    } catch (e: any) {
      const msg = String(e.response?.data?.error || e.message || '');
      const belumLunas = msg.toLowerCase().includes('belum lunas');

      if (belumLunas && attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_MS);
        continue;
      }

      if (belumLunas) {
        fulfillStatus.value = 'pending';
        fulfillMessage.value =
          'Pembayaran masih diproses Xendit. Email akan dikirim otomatis — buka tab Riwayat Transaksi.';
      } else {
        fulfillStatus.value = 'error';
        fulfillMessage.value = msg || 'Gagal mengirim PDF. Buka Riwayat Transaksi untuk coba lagi otomatis.';
      }
      startRedirectTimer();
      return;
    }
  }
};

onMounted(() => {
  void fulfillPayment();
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
      
      <div class="px-4 py-3 mb-6 text-sm text-left border rounded-lg"
        :class="{
          'text-blue-700 border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800': fulfillStatus === 'loading' || fulfillStatus === 'pending',
          'text-green-700 border-green-100 bg-green-50 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800': fulfillStatus === 'ok',
          'text-red-700 border-red-100 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800': fulfillStatus === 'error',
        }">
        <template v-if="fulfillStatus === 'loading'">📧 {{ fulfillMessage }}</template>
        <template v-else-if="fulfillStatus === 'ok'">📧 <b>Berhasil!</b><br>{{ fulfillMessage }}</template>
        <template v-else-if="fulfillStatus === 'pending'">⏳ {{ fulfillMessage }}</template>
        <template v-else>❌ {{ fulfillMessage }}</template>
      </div>

      <p v-if="fulfillStatus === 'ok'" class="mb-2 text-xs text-slate-400">
        Membuka riwayat dalam <span class="font-bold text-slate-600 dark:text-slate-300">{{ seconds }}</span> detik...
      </p>
      <p v-else-if="fulfillStatus === 'loading'" class="mb-2 text-xs text-slate-400">
        Jangan tutup halaman ini sampai email terkirim.
      </p>

      <button 
        @click="goHistory" 
        class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-bold transition text-sm"
      >
        Lihat Riwayat
      </button>

    </div>
  </div>
</template>
