declare global {
  interface Window {
    onAppReady?: boolean
  }
}
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './assets/styling/main.scss'
import './index.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Aura from '@primevue/themes/aura'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/StoreSignedInUsers'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

library.add(fas)
app.component('fontAwesome', FontAwesomeIcon)
app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    primary: {
      color: 'rgb(37, 99, 233)' // Replace green with your blue
    }
  }
})

const authStore = useAuthStore()
authStore.initAuth()

const isPrerendering = navigator.userAgent.includes('puppeteer')
router.isReady().then(() => {
  app.mount('#app')
  if (isPrerendering) {
    window.onAppReady = true
  }
})
