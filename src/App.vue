<script setup lang="ts">
  import { useAuth } from './composables/useAuth';
  import AuthView from './views/AuthView.vue';
  import DashboardView from './views/DashboardView.vue';
  
  // FIX: Rename 'loading' menjadi 'isAuthLoading'
  const { user, loading: isAuthLoading } = useAuth();
  </script>
  
  <template>
    <div v-if="isAuthLoading" class="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500">
      <div class="flex flex-col items-center gap-2">
         <div class="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
         <span class="text-xs">Checking session...</span>
      </div>
    </div>
  
    <DashboardView v-else-if="user" />
  
    <AuthView v-else />
  </template>
  
  <style>
  /* CSS Global tetap di sini */
  body { margin: 0; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  .dark ::-webkit-scrollbar-thumb { background: #475569; }
  </style>