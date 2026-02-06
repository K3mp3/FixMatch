import { usePaymentVerificationStore } from '@/stores/PaymentVerificationStore'
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { storeToRefs } from 'pinia'
import { onUnmounted, ref, watch } from 'vue'

interface PaymentVerificationOptions {
  checkIntervalMinutes?: number
  immediateCheck?: boolean
}

export function usePaymentVerification(options: PaymentVerificationOptions = {}) {
  const { checkIntervalMinutes = 5, immediateCheck = true } = options

  const authStore = useAuthStore()
  const paymentStore = usePaymentVerificationStore()

  const { user } = storeToRefs(authStore)
  const { showSignOut } = storeToRefs(paymentStore)

  const checkInterval = ref<number | null>(null)
  const isInitialized = ref(false)

  // Handle auth state changes
  const unwatchUser = watch(
    () => [user.value, showSignOut.value],
    ([newUser, showingSignOut]) => {
      // If user is logged out and modal is still showing, hide it
      if (!newUser && showingSignOut) {
        paymentStore.resetVerification()
      }

      // If user logs in, start verification
      if (newUser && !isInitialized.value) {
        startVerificationInterval()
        isInitialized.value = true

        // Run immediate check if enabled
        if (immediateCheck) {
          performAllChecks()
        }
      }
    },
    { immediate: true }
  )

  // Watch for changes to payment dates in user object
  const unwatchPaymentDate = watch(
    () => user.value?.newPaymentDate,
    () => {
      if (user.value) {
        performAllChecks()
      }
    }
  )

  // Create a function to check all payment conditions
  async function performAllChecks() {
    if (!user.value) return

    // For Premium users, prioritize payment verification
    if (user.value.subscriptionType === 'premium') {
      await paymentStore.checkAllConditions()
    }
  }

  // Start the verification interval
  function startVerificationInterval() {
    // Clear any existing interval first
    stopVerificationInterval()

    // Set up the new interval check
    checkInterval.value = window.setInterval(
      () => {
        performAllChecks()
      },
      checkIntervalMinutes * 60 * 1000
    )
  }

  // Stop the verification interval
  function stopVerificationInterval() {
    if (checkInterval.value) {
      clearInterval(checkInterval.value)
      checkInterval.value = null
    }
  }

  // Clean up on component unmount
  onUnmounted(() => {
    stopVerificationInterval()
    unwatchUser()
    unwatchPaymentDate()
  })

  // Return methods for manual checks if needed
  return {
    verifyNow: performAllChecks,
    isInitialized
  }
}
