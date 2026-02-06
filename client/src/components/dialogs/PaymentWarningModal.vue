<script setup lang="ts">
import { usePaymentVerificationStore } from '@/stores/PaymentVerificationStore'
import { storeToRefs } from 'pinia'

const paymentStore = usePaymentVerificationStore()
const { showSignOut, signOutText } = storeToRefs(paymentStore)
</script>

<template>
  <section
    class="fixed top-0 left-0 bg-main-20 h-screen w-screen flex items-center justify-center z-50"
    v-if="showSignOut"
  >
    <div class="p-4 bg-main rounded-lg flex flex-col gap-4 border-gr-warning max-w-md">
      <fontAwesome icon="warning" class="h-10 text-warning-orange" />
      <p>{{ signOutText }}</p>
    </div>
  </section>
</template>
