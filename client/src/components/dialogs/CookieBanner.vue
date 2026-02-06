<script setup lang="ts">
import { onMounted, ref } from 'vue'

const showBanner = ref(true)
const cookiesAccepted = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('cookie-consent')
  if (consent === 'accepted') {
    cookiesAccepted.value = true
    showBanner.value = false
    enableAds()
  } else if (consent === 'rejected') {
    cookiesAccepted.value = false
    showBanner.value = false
  }
})

function acceptCookies() {
  localStorage.setItem('cookie-consent', 'accepted')
  cookiesAccepted.value = true
  showBanner.value = false
  enableAds()
}

function rejectCookies() {
  localStorage.setItem('cookie-consent', 'rejected')
  cookiesAccepted.value = false
  showBanner.value = false
}

function enableAds() {
  const adScript = document.createElement('script')
  adScript.async = true
  adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
  adScript.setAttribute('data-ad-client', 'ca-pub-6485247997045508')
  document.head.appendChild(adScript)

  window.dispatchEvent(new CustomEvent('adConsentGranted'))
}
</script>

<template>
  <div v-if="showBanner" class="cookie-banner">
    <div class="cookie-content">
      <h2>Cookie-meddelande</h2>
      <p>
        Vi använder cookies för att förbättra din upplevelse och leverera personligt innehåll,
        inklusive riktade annonser från Google. Genom att acceptera samtycker du till användningen
        av cookies i enlighet med vår integritetspolicy.
      </p>
      <div class="cookie-buttons">
        <button @click="acceptCookies" class="accept-button">Acceptera cookies</button>
        <button @click="rejectCookies" class="reject-button">Avvisa cookies</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(10, 10, 10, 0.95);
  color: #fff;
  z-index: 9999;
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

p {
  margin: 0;
  line-height: 1.5;
}

.cookie-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.accept-button {
  background-color: #4caf50;
  color: white;
  border: none;
}

.accept-button:hover {
  background-color: #3e8e41;
}

.reject-button {
  background-color: transparent;
  color: white;
  border: 1px solid white;
}

.reject-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .cookie-buttons {
    flex-direction: column;
  }
}
</style>
