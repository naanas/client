<script setup lang="ts">
    import { ref } from 'vue';
    import { useAuth } from '../composables/useAuth';
    
    const { loading, authError, handleLogin, handleRegister } = useAuth();
    
    const isRegisterMode = ref(false);
    const emailInput = ref('');
    const passInput = ref('');
    
    const submitAuth = async () => {
      if (!emailInput.value || !passInput.value) return;
      
      if (isRegisterMode.value) {
        const success = await handleRegister(emailInput.value, passInput.value);
        if (success) {
          isRegisterMode.value = false;
          emailInput.value = '';
          passInput.value = '';
        }
      } else {
        await handleLogin(emailInput.value, passInput.value);
      }
    };
    </script>
    
    <template>
      <div class="flex items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-slate-900 transition-colors">
        <div class="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 transition-colors border border-slate-100 dark:border-slate-700">
            
            <div class="text-center mb-6">
                <div class="w-14 h-14 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30 text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <h1 class="text-xl font-bold text-slate-800 dark:text-white">Timesheet App</h1>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Masuk untuk mengelola laporan.</p>
            </div>
    
            <form @submit.prevent="submitAuth" class="space-y-4">
                <div v-if="authError" class="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-start gap-2">
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
    
                <button type="submit" :disabled="loading" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-70 flex justify-center gap-2 shadow-lg shadow-blue-500/20">
                    <span v-if="loading" class="animate-spin">⏳</span>
                    {{ isRegisterMode ? 'Daftar Akun' : 'Masuk Aplikasi' }}
                </button>
            </form>
    
            <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                <p class="text-xs text-slate-500">
                    {{ isRegisterMode ? 'Sudah punya akun?' : 'Belum punya akun?' }}
                    <button @click="isRegisterMode = !isRegisterMode" class="text-blue-600 font-bold hover:underline ml-1">
                        {{ isRegisterMode ? 'Login disini' : 'Buat akun baru' }}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </template>