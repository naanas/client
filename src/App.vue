<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuth } from './composables/useAuth';

// Kita panggil useAuth di sini agar cek session jalan saat aplikasi mulai
const { loading } = useAuth();
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-500">
    <div class="flex flex-col items-center gap-2">
       <div class="w-6 h-6 border-2 rounded-full border-slate-300 border-t-blue-600 animate-spin"></div>
       <span class="text-xs">Memuat aplikasi...</span>
    </div>
  </div>

  <RouterView v-else />
</template>

<style>
body { margin: 0; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.dark ::-webkit-scrollbar-thumb { background: #475569; }
</style>