<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const router = useRouter();
const route = useRoute();

const seconds = ref(5);
const externalId = String(route.query.external_id || '');
const fulfillStatus = ref<'loading' | 'ok' | 'pending' | 'error'>('loading');
const fulfillMessage = ref('');
let timer: any = null;

const goHistory = () => {
  router.push('/?tab=history');
};

const fulfillPayment = async () => {
  if (!externalId || externalId === '-') {
    fulfillStatus.value = 'error';
    fulfillMessage.value = 'ID transaksi tidak ditemukan di URL.';
    return;
  }

  try {
    const { data } = await axios.post(`${API_URL}/api/payment/fulfill`, {
      external_id: externalId,
    });
    fulfillStatus.value = 'ok';
    fulfillMessage.value = data.message || 'PDF dikirim ke email Anda.';
  } catch (e: any) {
    const msg = e.response?.data?.error || e.message;
    if (String(msg).toLowerCase().includes('belum lunas')) {
      fulfillStatus.value = 'pending';
      fulfillMessage.value = 'Pembayaran masih diproses. Cek Riwayat Transaksi beberapa saat lagi.';
    } else {
      fulfillStatus.value = 'error';
      fulfillMessage.value = msg || 'Gagal mengirim PDF. Coba tombol Cek di Riwayat Transaksi.';
    }
  }
};

onMounted(() => {
  void fulfillPayment();

  timer = setInterval(() => {
    seconds.value--;
    if (seconds.value <= 0) {
      clearInterval(timer);
      goHistory();
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
      
      <div class="px-4 py-3 mb-6 text-sm text-left border rounded-lg"
        :class="{
          'text-blue-700 border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800': fulfillStatus === 'loading' || fulfillStatus === 'pending',
          'text-green-700 border-green-100 bg-green-50 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800': fulfillStatus === 'ok',
          'text-red-700 border-red-100 bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800': fulfillStatus === 'error',
        }">
        <template v-if="fulfillStatus === 'loading'">📧 Memproses PDF dan mengirim ke email...</template>
        <template v-else-if="fulfillStatus === 'ok'">📧 <b>Berhasil!</b><br>{{ fulfillMessage }}</template>
        <template v-else-if="fulfillStatus === 'pending'">⏳ {{ fulfillMessage }}</template>
        <template v-else>❌ {{ fulfillMessage }}</template>
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