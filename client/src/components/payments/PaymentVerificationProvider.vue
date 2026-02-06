<script setup lang="ts">
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import PaymentWarningModal from '../dialogs/PaymentWarningModal.vue'
import { usePaymentVerification } from '../utils/usePaymentVerification'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const isRepairShop = computed(() => {
  if (!user.value) return false

  return (
    user.value.subscriptionType === 'premium' ||
    user.value.location !== undefined ||
    user.value.selectedTimes !== undefined
  )
})

onMounted(() => {
  if (isRepairShop.value) {
    usePaymentVerification()
  }
})
</script>

<template>
  <PaymentWarningModal />
</template>
