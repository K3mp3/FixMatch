<script setup lang="ts">
import { onMounted, ref } from 'vue'

const showModal = ref(false)

onMounted(() => {
  // Check if user has already accepted cookies
  const cookiesAccepted = localStorage.getItem('cookiesAccepted')
  if (!cookiesAccepted) {
    // Show the modal if they haven't accepted cookies yet
    showModal.value = true
  }
})

const acceptCookies = () => {
  localStorage.setItem('cookiesAccepted', 'true')
  showModal.value = false
}
</script>

<template>
  <div
    v-if="showModal"
    class="fixed bottom-0 left-0 right-0 bg-main dark:bg-gray-800 shadow-lg p-4 z-50 border-t border-gray-200 dark:border-gray-700"
  >
    <div class="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-start gap-3">
        <fontAwesome icon="cookie" class="text-sky-light-blue text-xl mt-1" />
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Cookies</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Denna webbplats använder nödvändiga cookies för att möjliggöra betalningar via Stripe
            och för att webbplatsen ska fungera korrekt. Genom att fortsätta använda webbplatsen
            godkänner du vår användning av cookies.
          </p>
        </div>
      </div>
      <div class="flex gap-3">
        <button @click="acceptCookies" class="main-btn w-32">Accept</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-primary-500 {
  color: rgb(37, 99, 233);
}

.bg-primary-500 {
  background-color: rgb(37, 99, 233);
}

.bg-primary-600:hover {
  background-color: rgb(29, 78, 216);
}
</style>
