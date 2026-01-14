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
  <div class="relative flex items-center justify-center min-h-screen p-4 overflow-hidden font-serif bg-black selection:bg-red-900 selection:text-white">
    
    <!-- Dynamic Background -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black opacity-60 pointer-events-none animate-background-pulse"></div>
    <div class="absolute -bottom-20 -left-20 text-[15rem] text-red-900/5 font-cinzel select-none pointer-events-none animate-float" style="animation-delay: 1s;">†</div>
    <div class="absolute -top-20 -right-20 text-[15rem] text-red-900/5 font-cinzel select-none pointer-events-none animate-float">†</div>

    <Transition name="scale-fade" mode="out-in">
        <div :key="isRegisterMode ? 'register' : 'login'" class="w-full max-w-sm p-8 relative z-10 transition-all transform bg-neutral-900 border border-red-900/30 shadow-[0_0_50px_rgba(185,28,28,0.15)] rounded-sm group hover:shadow-[0_0_80px_rgba(185,28,28,0.25)] duration-500">
            
            <div class="mb-8 text-center">
                <div class="relative flex items-center justify-center mx-auto mb-4 w-16 h-16 bg-black border border-red-900 shadow-[0_0_15px_rgba(220,38,38,0.3)] rounded-sm group overflow-hidden">
                <div class="absolute inset-0 transition-all bg-red-900/20 blur-md group-hover:bg-red-900/40"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <span class="relative z-10 text-3xl text-red-600 font-cinzel transition-transform duration-700 group-hover:scale-110">†</span>
                </div>
                <h1 class="text-2xl font-bold text-red-600 font-cinzel tracking-[0.2em] uppercase drop-shadow-md">
                    Grimoire Access
                </h1>
                <p class="mt-2 text-[10px] text-stone-500 uppercase tracking-widest font-cinzel transition-colors group-hover:text-red-900/60">
                    {{ isRegisterMode ? 'Inscribe your name into the book.' : 'Identify yourself, Vessel.' }}
                </p>
            </div>

            <form @submit.prevent="submitAuth" class="space-y-6">
                <Transition name="slide-fade">
                    <div v-if="authError" class="flex items-center gap-3 p-3 text-xs text-red-400 border rounded-sm border-red-900/50 bg-red-950/20">
                        <span class="text-lg animate-pulse">☠</span> <span>{{ authError }}</span>
                    </div>
                </Transition>

                <div class="space-y-5">
                    <div class="relative group">
                        <input 
                            v-model="emailInput" 
                            type="email" 
                            placeholder=" " 
                            required 
                            class="w-full px-4 py-3 font-serif placeholder-transparent transition-all border-b peer bg-neutral-950 border-stone-800 text-stone-300 focus:border-red-600 focus:outline-none focus:bg-neutral-900 focus:shadow-[0_4px_20px_rgba(220,38,38,0.1)]" 
                        />
                        <label class="absolute left-4 top-3 text-stone-600 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-stone-600 peer-placeholder-shown:top-3.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-red-600 font-cinzel tracking-widest uppercase pointer-events-none">
                            Your Soul ID (Email)
                        </label>
                    </div>
                    
                    <div class="relative group">
                        <input 
                            v-model="passInput" 
                            type="password" 
                            placeholder=" " 
                            required 
                            class="w-full px-4 py-3 font-serif placeholder-transparent transition-all border-b peer bg-neutral-950 border-stone-800 text-stone-300 focus:border-red-600 focus:outline-none focus:bg-neutral-900 focus:shadow-[0_4px_20px_rgba(220,38,38,0.1)]" 
                        />
                        <label class="absolute left-4 top-3 text-stone-600 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-stone-600 peer-placeholder-shown:top-3.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-red-600 font-cinzel tracking-widest uppercase pointer-events-none">
                            Secret Incantation (Password)
                        </label>
                    </div>
                </div>

                <button 
                    type="submit" 
                    :disabled="loading" 
                    class="group relative flex justify-center w-full py-4 text-xs font-bold text-stone-300 uppercase tracking-[0.25em] transition-all bg-black border border-red-900/50 hover:border-red-600 hover:text-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden font-cinzel"
                >
                    <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-900/20 to-transparent group-hover:animate-shimmer"></div>
                    <span v-if="loading" class="animate-pulse">COMMUNING...</span>
                    <span v-else>{{ isRegisterMode ? 'SEAL THE PACT' : 'ENTER THE VOID' }}</span>
                </button>
            </form>

            <div class="pt-8 mt-8 text-center border-t border-red-900/20 transition-all hover:border-red-900/40">
                <p class="text-[10px] text-stone-600 font-serif italic">
                    {{ isRegisterMode ? 'Already bound by blood?' : 'New to the coven?' }}
                    <button 
                        @click="isRegisterMode = !isRegisterMode" 
                        class="ml-1 font-bold tracking-wider text-red-800 uppercase transition-colors hover:text-red-500 hover:underline font-cinzel"
                    >
                        {{ isRegisterMode ? 'Return to Login' : 'Join Us' }}
                    </button>
                </p>
            </div>
        </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Shimmer Animation for Button */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}

/* Background Pulse */
@keyframes background-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.8; }
}
.animate-background-pulse {
    animation: background-pulse 4s ease-in-out infinite;
}

/* Custom Input Autofill fix for Dark Mode */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active{
    -webkit-box-shadow: 0 0 0 30px #0a0a0a inset !important;
    -webkit-text-fill-color: #d6d3d1 !important;
    transition: background-color 5000s ease-in-out 0s;
}
</style>
