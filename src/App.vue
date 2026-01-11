<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuth } from './composables/useAuth';

const { loading } = useAuth();
</script>

<template>
  <div class="min-h-screen">
    
    <div v-if="loading" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-black">
      <div class="relative">
         <div class="w-16 h-16 border-4 rounded-full border-red-900/30 border-t-red-700 animate-spin"></div>
         <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xl text-red-800 font-cinzel">†</span>
         </div>
      </div>
      <div class="text-red-700 animate-pulse text-lg tracking-[0.5em] font-bold font-cinzel opacity-80">
        SUMMONING...
      </div>
    </div>
    
    <RouterView v-else /> 
  </div>
</template>

<style>
/* =========================================
   1. IMPORT PREMIUM FONTS
   - Manrope: Font modern terbaik untuk UI/Angka (Sangat jelas & rapi).
   - Cinzel & Crimson Pro: Untuk Dark Mode (Satanic).
   ========================================= */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap');

/* 2. GLOBAL RESET */
body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* =========================================
   3. FONT MAPPING (HYBRID THEME)
   ========================================= */

/* --- LIGHT MODE (Modern & Professional) --- */
/* Gunakan Manrope untuk semua teks di Light Mode */
.font-sans, body {
  font-family: 'Manrope', sans-serif !important;
}

/* Judul Light Mode */
.bg-slate-100 h1, .bg-slate-100 h2, .bg-slate-100 h3, 
.bg-white h1, .bg-white h2, .bg-white h3 {
  font-family: 'Manrope', sans-serif !important;
  font-weight: 700;
  letter-spacing: -0.02em; /* Tampilan rapat modern */
}

/* --- DARK MODE (Satanic & Ritual) --- */
/* Override Body Dark Mode */
.font-serif, .dark body, .bg-neutral-950 {
  font-family: 'Crimson Pro', serif !important;
}

/* Override Judul Dark Mode */
.font-cinzel, 
.bg-neutral-950 h1, .bg-neutral-950 h2, .bg-neutral-950 h3, 
.bg-neutral-900 h1, .bg-neutral-900 h2, .bg-neutral-900 h3 {
  font-family: 'Cinzel', serif !important;
  letter-spacing: 0.05em;
}

/* =========================================
   4. CUSTOM SCROLLBAR
   ========================================= */
::-webkit-scrollbar { 
  width: 6px; 
  height: 6px; 
}
::-webkit-scrollbar-track { 
  background: transparent; 
}
::-webkit-scrollbar-thumb { 
  background: #cbd5e1; 
  border-radius: 10px; 
}
/* Dark Mode Scrollbar */
.bg-neutral-950 ::-webkit-scrollbar-thumb,
.bg-black ::-webkit-scrollbar-thumb { 
  background: #450a0a; 
  border: 1px solid #171717;
}
.bg-neutral-950 ::-webkit-scrollbar-thumb:hover { 
  background: #7f1d1d; 
}
</style>