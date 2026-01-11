import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // Import router yang baru dibuat

const app = createApp(App)

app.use(router) // Gunakan router
app.mount('#app')