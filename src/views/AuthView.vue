<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { loading, authError, handleLogin, handleRegister } = useAuth();

const isRegisterMode = ref(false);
const emailInput = ref('');
const passInput = ref('');

const submitAuth = async () => {
  if (!emailInput.value || !passInput.value) return;
  
  if (isRegisterMode.value) {
    // Register Logic
    const success = await handleRegister(emailInput.value, passInput.value);
    if (success) {
      isRegisterMode.value = false;
      emailInput.value = '';
      passInput.value = '';
    }
  } else {
    // Login Logic
    await handleLogin(emailInput.value, passInput.value);
    
    // Cek apakah login sukses (token tersimpan), lalu redirect
    if (localStorage.getItem('timesheet_auth_token')) {
        router.push('/'); // Redirect ke Dashboard
    }
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4 transition-colors bg-slate-100 dark:bg-slate-900">
    <div class="w-full max-w-sm p-8 transition-colors bg-white border shadow-2xl dark:bg-slate-800 rounded-2xl border-slate-100 dark:border-slate-700">
        
        <div class="mb-6 text-center">
            <div class="flex items-center justify-center mx-auto mb-3 text-white bg-blue-600 shadow-lg w-14 h-14 rounded-xl shadow-blue-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h1 class="text-xl font-bold text-slate-800 dark:text-white">Timesheet App</h1>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Masuk untuk mengelola laporan.</p>
        </div>

        <form @submit.prevent="submitAuth" class="space-y-4">
            <div v-if="authError" class="flex items-start gap-2 p-3 text-xs text-red-600 border border-red-100 rounded-lg bg-red-50">
                <span>⚠️</span> <span>{{ authError }}</span>
            </div>

            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Email Pegadaian</label>
                <input v-model="emailInput" type="email" placeholder="nama@pegadaian.co.id" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Password</label>
                <input v-model="passInput" type="password" placeholder="••••••••" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <button type="submit" :disabled="loading" class="flex justify-center w-full gap-2 py-3 text-sm font-bold text-white transition-all bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 active:scale-95 disabled:opacity-70 shadow-blue-500/20">
                <span v-if="loading" class="animate-spin">⏳</span>
                {{ isRegisterMode ? 'Daftar Akun' : 'Masuk Aplikasi' }}
            </button>
        </form>

        <div class="pt-6 mt-6 text-center border-t border-slate-100 dark:border-slate-700">
            <p class="text-xs text-slate-500">
                {{ isRegisterMode ? 'Sudah punya akun?' : 'Belum punya akun?' }}
                <button @click="isRegisterMode = !isRegisterMode" class="ml-1 font-bold text-blue-600 hover:underline">
                    {{ isRegisterMode ? 'Login disini' : 'Buat akun baru' }}
                </button>
            </p>
        </div>
    </div>
  </div>
</template>