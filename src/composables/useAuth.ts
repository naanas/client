import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'timesheet_auth_token';

const user = ref<any>(null);

export function useAuth() {
  // FIX 1: Set default TRUE agar saat refresh dia loading dulu, gak langsung nunjukin login
  const loading = ref(true); 
  const authError = ref('');

  const setAuthHeader = (token: string | null) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
  };

  const checkSession = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Jika tidak ada token, matikan loading & biarkan user di halaman login
    if (!token) {
        loading.value = false;
        return;
    }

    loading.value = true;
    setAuthHeader(token);
    
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/me`);
      user.value = data.user;
    } catch (e) {
      console.log('Session expired / Invalid Token');
      handleLogout();
    } finally {
      // FIX 2: Pastikan loading mati entah sukses atau gagal
      loading.value = false;
    }
  };

  const handleRegister = async (email: string, pass: string) => {
    loading.value = true; 
    authError.value = '';
    
    try {
      await axios.post(`${API_URL}/api/auth/register`, { email, password: pass });
      alert('Registrasi berhasil! Silakan Login.');
      return true;
    } catch (e: any) {
      authError.value = e.response?.data?.error || 'Registrasi Gagal';
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
      }
    } catch (e: any) {
      authError.value = e.response?.data?.error || 'Login Gagal';
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
  };

  onMounted(() => {
    checkSession();
  });

  return { 
    user, 
    loading, 
    authError, 
    handleRegister, 
    handleLogin, 
    handleLogout 
  };
}