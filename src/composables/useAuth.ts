import { ref, onMounted } from 'vue';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// --- CONFIG ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'timesheet_auth_token';

// Inisialisasi Supabase Client (Hanya untuk ambil Role)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- GLOBAL STATE ---
const user = ref<any>(null);
const userRole = ref<string>('user'); // Default role 'user'

// Flag biar interceptor gak dipasang berkali-kali kalau useAuth dipanggil di banyak tempat
let isInterceptorSetup = false;

export function useAuth() {
  const loading = ref(true); 
  const authError = ref('');

  // --- 1. SETUP AXIOS INTERCEPTOR (PENJAGA PINTU) ---
  if (!isInterceptorSetup) {
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          // Cek error 401 (Unauthorized) atau 403 (Forbidden)
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            
            // Cek URL request, jangan redirect kalau errornya pas lagi coba Login (biar gak loop alert)
            const isLoginRequest = error.config.url.includes('/login');

            if (!isLoginRequest) {
                console.warn("💀 Session expired. The pact is broken.");
                
                // BERSIHKAN JEJAK (Manual cleanup biar aman)
                localStorage.removeItem(TOKEN_KEY);
                delete axios.defaults.headers.common['Authorization'];
                user.value = null;
                userRole.value = 'user';

                // Pesan Satanic
                alert("⏳ Kontrak jiwamu berakhir (Session Expired). Silakan login ulang.");
                
                // TENDANG KE HALAMAN LOGIN
                window.location.href = '/auth'; 
            }
          }
          return Promise.reject(error);
        }
      );
      isInterceptorSetup = true; // Tandai sudah dipasang
  }

  // Helper: Fetch Role dari tabel 'profiles'
  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data) {
        userRole.value = data.role;
      }
    } catch (e) {
      console.error("Gagal mengambil role user", e);
    }
  };

  const setAuthHeader = (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
  };

  const checkSession = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
        loading.value = false;
        return;
    }

    loading.value = true;
    setAuthHeader(token);
    
    try {
      // 1. Ambil data User dari Backend
      const { data } = await axios.get(`${API_URL}/api/auth/me`);
      user.value = data.user;

      // 2. Ambil Role user tersebut (untuk UI Admin)
      if (user.value?.id) {
          await fetchUserRole(user.value.id);
      }

    } catch (e) {
      console.log('Session expired / Invalid Token saat Check Session');
      // Jangan handleLogout di sini karena interceptor di atas udah nanganin 401
      // Tapi kalau error network lain, set loading false
    } finally {
      loading.value = false;
    }
  };

  const handleRegister = async (email: string, pass: string) => {
    loading.value = true; 
    authError.value = '';
    
    try {
      await axios.post(`${API_URL}/api/auth/register`, { email, password: pass });
      alert('Jiwa baru terdaftar. Silakan masuk.');
      return true;
    } catch (e: any) {
      authError.value = e.response?.data?.error || 'Ritual Gagal (Register Error)';
      return false;
    } finally { 
      loading.value = false; 
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    loading.value = true; 
    authError.value = '';
    
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password: pass });
      
      if (data.session?.access_token) {
        const token = data.session.access_token;
        localStorage.setItem(TOKEN_KEY, token);
        setAuthHeader(token);
        
        user.value = data.user;

        // Ambil Role setelah login sukses
        if (data.user?.id) {
            await fetchUserRole(data.user.id);
        }
      }
    } catch (e: any) {
      authError.value = 'Mantra salah (Email/Password Invalid)';
    } finally { 
      loading.value = false; 
    }
  };

  const handleLogout = async () => {
    try { 
        await axios.post(`${API_URL}/api/auth/logout`); 
    } catch (e) {
        console.warn("Logout backend error (ignored)");
    }
    
    localStorage.removeItem(TOKEN_KEY);
    setAuthHeader(null);
    user.value = null;
    userRole.value = 'user'; // Reset role ke user biasa
  };

  onMounted(() => {
    checkSession();
  });

  return { 
    user, 
    userRole, 
    loading, 
    authError, 
    handleRegister, 
    handleLogin, 
    handleLogout 
  };
}