<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCookie } from '@fortawesome/free-solid-svg-icons'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import './assets/styling/base.scss'
import './assets/tailwind.css'
import CookieConsent from './components/dialogs/CookieConsent.vue'
import PaymentVerificationProvider from './components/payments/PaymentVerificationProvider.vue'
import router from './router'
import { useAuthStore } from './stores/StoreSignedInUsers'

library.add(faCookie)
const route = useRoute()
const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)
const isPrerendering = ref(navigator.userAgent.includes('puppeteer'))
const hasInitiallyRedirected = ref(false)

watch([loading, user], ([newLoading, newUser]) => {
  if (isPrerendering.value) return
  if (!newLoading && newUser && !hasInitiallyRedirected.value) {
    hasInitiallyRedirected.value = true
    if (user.value?.admin) {
      router.push('/admin')
    } else if (user.value?.repairShop && route.path === '/') {
      router.push('/repair-shop-garage-home')
    }
  }
})
</script>

<template>
  <div id="app-content">
    <noscript>
      <div style="padding: 20px; text-align: center">
        <h1>FixMatch</h1>
        <p>
          Spara pengar genom att få offerter från flera verkstäder samtidigt. Välj sedan det bästa
          alternativet.
        </p>
      </div>
    </noscript>
    <PaymentVerificationProvider />
    <RouterView />
    <CookieConsent />
  </div>
</template>
