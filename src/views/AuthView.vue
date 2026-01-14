<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { loading, authError, handleLogin, handleRegister } = useAuth();

const isRegisterMode = ref(false);
const emailInput = ref('');
const passInput = ref('');
const showSuccess = ref(false);

// Generate random embers and blood drops
const embers = ref<Array<{left: string, delay: string, duration: string}>>([]);
const bloodDrops = ref<Array<{left: string, delay: string, duration: string, height: string, width: string}>>([]);

onMounted(() => {
    // Embers
    for (let i = 0; i < 30; i++) {
        embers.value.push({
            left: Math.random() * 100 + '%',
            delay: Math.random() * 10 + 's',
            duration: (Math.random() * 5 + 5) + 's'
        });
    }
    
    // Blood Drops
    for (let i = 0; i < 20; i++) {
        bloodDrops.value.push({
            left: Math.random() * 100 + '%',
            delay: Math.random() * 5 + 's',
            duration: (Math.random() * 2 + 3) + 's', // Slower fall (3-5s)
            height: (Math.random() * 20 + 20) + 'px',
            width: (Math.random() * 2 + 1) + 'px'
        });
    }
});

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
        showSuccess.value = true;
        
        // Wait for animation
        setTimeout(() => {
            router.push('/'); // Redirect ke Dashboard
        }, 3000);
    }
  }
};
</script>

<template>
  <div class="relative flex items-center justify-center min-h-screen p-4 overflow-hidden font-serif bg-black selection:bg-red-900 selection:text-white">
    
    <!-- SUCCESS RITUAL OVERLAY -->
    <Transition name="fade">
        <div v-if="showSuccess" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
            <!-- Expanding Portal -->
            <div class="absolute inset-0 bg-red-900 rounded-full opacity-20 blur-3xl animate-[summon-scale_2.5s_ease-in_forwards]"></div>
            
            <!-- Summoning Circle -->
            <div class="summon-circle flex items-center justify-center mb-10">
                <div class="text-9xl text-red-600 font-cinzel opacity-80 animate-heartbeat">†</div>
            </div>

            <!-- Text -->
            <div class="relative z-10 text-center space-y-4">
                <h2 class="text-4xl font-black text-red-500 font-cinzel tracking-[0.3em] summon-text">
                    PACT SEALED
                </h2>
                <p class="text-sm text-stone-500 uppercase tracking-widest font-cinzel animate-pulse">
                    Entering the Void...
                </p>
            </div>
        </div>
    </Transition>

    <!-- NOISE OVERLAY -->
    <div class="bg-noise"></div>

    <!-- BLOOD DROPS -->
    <div v-for="(drop, i) in bloodDrops" :key="'blood-'+i" class="blood-drop" 
         :style="{ 
             left: drop.left, 
             animation: `blood-drip ${drop.duration} infinite ease-in`,
             animationDelay: drop.delay,
             height: drop.height,
             width: drop.width
         }">
    </div>

    <!-- EMBERS -->
    <div v-for="(ember, i) in embers" :key="i" class="ember" 
         :style="{ left: ember.left, animationDelay: ember.delay, animationDuration: ember.duration }">
    </div>

    <!-- Dynamic Background -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-black to-black opacity-80 pointer-events-none animate-background-pulse"></div>
    <div class="absolute -bottom-40 -left-40 text-[20rem] text-red-900/5 font-cinzel select-none pointer-events-none animate-float" style="animation-delay: 1s;">†</div>
    <div class="absolute -top-40 -right-40 text-[20rem] text-red-900/5 font-cinzel select-none pointer-events-none animate-float">†</div>

    <Transition name="scale-fade" mode="out-in">
        <div :key="isRegisterMode ? 'register' : 'login'" class="w-full max-w-sm p-10 relative z-10 transition-all transform bg-black/80 backdrop-blur-md border border-red-900/40 shadow-[0_0_100px_rgba(153,27,27,0.15)] rounded-xl group hover:shadow-[0_0_120px_rgba(220,38,38,0.2)] duration-700">
            
            <!-- Card Decoration (Corners) -->
            <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-900/50 rounded-tl-xl"></div>
            <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-900/50 rounded-tr-xl"></div>
            <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-900/50 rounded-bl-xl"></div>
            <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-900/50 rounded-br-xl"></div>

            <!-- Card Blood Drips -->
            <div class="card-blood-drip left-10 h-6" style="animation-delay: 0s;"></div>
            <div class="card-blood-drip left-14 h-4" style="animation-delay: 1.5s; opacity: 0.7;"></div>
            <div class="card-blood-drip right-10 h-8" style="animation-duration: 5s;"></div>
            <div class="card-blood-drip right-20 h-5" style="animation-delay: 2s;"></div>

            <div class="mb-10 text-center">
                <div class="relative flex items-center justify-center mx-auto mb-6 w-20 h-20 bg-black/50 border border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.2)] rounded-full group overflow-hidden transition-transform duration-700 hover:rotate-180">
                    <div class="absolute inset-0 transition-all bg-red-900/20 blur-xl group-hover:bg-red-900/40"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <span class="relative z-10 text-4xl text-red-600 font-cinzel drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">†</span>
                </div>
                <h1 class="relative inline-block text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-950 font-cinzel tracking-[0.2em] uppercase drop-shadow-sm">
                    Grimoire
                </h1>
                <p class="mt-2 text-[10px] text-stone-500 uppercase tracking-[0.3em] font-cinzel transition-colors group-hover:text-red-900/80">
                    {{ isRegisterMode ? 'Inscribe The Covenant' : 'Identify The Vessel' }}
                </p>
            </div>

            <form @submit.prevent="submitAuth" class="space-y-8">
                <Transition name="slide-fade">
                    <div v-if="authError" class="flex items-center gap-3 p-4 text-xs font-bold text-red-400 border border-red-900/80 bg-red-950/20 shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]">
                        <span class="text-xl animate-pulse">☠</span> <span>{{ authError }}</span>
                    </div>
                </Transition>

                <div class="space-y-6">
                    <div class="relative group">
                        <input 
                            v-model="emailInput" 
                            type="email" 
                            placeholder=" " 
                            required 
                            class="w-full px-5 py-4 font-serif text-sm placeholder-transparent transition-all border border-stone-800 rounded-lg bg-black/50 text-stone-300 focus:border-red-700 focus:ring-1 focus:ring-red-900/50 focus:outline-none focus:bg-red-950/10 focus:shadow-[0_0_30px_rgba(220,38,38,0.1)] peer" 
                        />
                        <label class="absolute left-3 -top-2.5 bg-black px-2 text-[10px] text-red-500 font-cinzel tracking-widest uppercase pointer-events-none rounded transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-stone-600 peer-placeholder-shown:top-4 peer-placeholder-shown:left-5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-black peer-focus:px-2 peer-focus:text-[10px] peer-focus:text-red-500">
                            Your Soul ID
                        </label>
                    </div>
                    
                    <div class="relative group">
                        <input 
                            v-model="passInput" 
                            type="password" 
                            placeholder=" " 
                            required 
                            class="w-full px-5 py-4 font-serif text-sm placeholder-transparent transition-all border border-stone-800 rounded-lg bg-black/50 text-stone-300 focus:border-red-700 focus:ring-1 focus:ring-red-900/50 focus:outline-none focus:bg-red-950/10 focus:shadow-[0_0_30px_rgba(220,38,38,0.1)] peer" 
                        />
                        <label class="absolute left-3 -top-2.5 bg-black px-2 text-[10px] text-red-500 font-cinzel tracking-widest uppercase pointer-events-none rounded transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-stone-600 peer-placeholder-shown:top-4 peer-placeholder-shown:left-5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-black peer-focus:px-2 peer-focus:text-[10px] peer-focus:text-red-500">
                            Secret Incantation
                        </label>
                    </div>
                </div>

                <div class="relative">
                    <button 
                        type="submit" 
                        :disabled="loading" 
                        class="group relative w-full py-4 overflow-hidden rounded-lg bg-red-950 border border-red-900 text-stone-400 font-cinzel font-bold tracking-[0.25em] uppercase transition-all hover:text-white hover:border-red-600 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    >
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer transition-transform pointer-events-none"></div>
                        <span v-if="loading" class="animate-pulse">COMMUNING...</span>
                        <span v-else>{{ isRegisterMode ? 'SEAL THE PACT' : 'ENTER THE VOID' }}</span>
                    </button>
                    <!-- Pentagram/Decoration behind button -->
                    <div class="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-20 transition duration-1000 pointer-events-none"></div>
                </div>
            </form>

            <div class="pt-8 mt-8 text-center border-t border-red-900/20 transition-all hover:border-red-900/40">
                <p class="text-[10px] text-stone-600 font-serif italic">
                    {{ isRegisterMode ? 'Already bound by blood?' : 'New to the coven?' }}
                    <button 
                        @click="isRegisterMode = !isRegisterMode" 
                        class="ml-2 px-3 py-1 text-[9px] font-bold tracking-wider text-red-800 uppercase transition-all border border-red-900/30 rounded hover:text-red-500 hover:border-red-600 hover:bg-red-950/30 font-cinzel"
                    >
                        {{ isRegisterMode ? 'Return' : 'Join Us' }}
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
