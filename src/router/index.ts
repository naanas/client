import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import AuthView from '../views/AuthView.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      meta: { guestOnly: true }
    },
    {
      path: '/payment-success',
      name: 'payment-success',
      component: PaymentSuccess,
      meta: { requiresAuth: true }
    },
    // Redirect unknown routes ke home
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// Navigation Guard
// PERBAIKAN: Ubah 'from' menjadi '_from' agar TypeScript tidak komplain unused variable
router.beforeEach((to, _from, next) => {
  // Cek token di localStorage (sesuai key di useAuth.ts)
  const isAuthenticated = !!localStorage.getItem('timesheet_auth_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Jika butuh login tapi belum login -> lempar ke Auth
    next('/auth')
  } else if (to.meta.guestOnly && isAuthenticated) {
    // Jika halaman khusus tamu (Login) tapi sudah login -> lempar ke Dashboard
    next('/')
  } else {
    // Lanjut
    next()
  }
})

export default router