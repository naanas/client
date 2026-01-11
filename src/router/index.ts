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
      path: '/auth', // Ganti /login jadi /auth agar sesuai file AuthView
      name: 'auth',
      component: AuthView,
      meta: { guestOnly: true } // Hanya untuk yang belum login
    },
    {
      path: '/payment-success',
      name: 'payment-success',
      component: PaymentSuccess,
      meta: { requiresAuth: true }
    },
    // Redirect unknown routes
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('timesheet_auth_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth')
  } else if (to.meta.guestOnly && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router