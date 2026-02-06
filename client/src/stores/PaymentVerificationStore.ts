import { verifyStripeSub } from '@/services/verifyStripeSub'
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { defineStore, storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

export const usePaymentVerificationStore = defineStore('paymentVerification', () => {
  const isVerifying = ref(false)
  const showSignOut = ref(false)
  const signOutText = ref('')
  const verificationComplete = ref(false)
  const lastVerified = ref<Date | null>(null)

  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)
  async function verifyPremiumStatus() {
    if (isVerifying.value || !user.value) return false

    if (user.value.subscriptionType !== 'premium' || !user.value.sessionId) {
      verificationComplete.value = true
      return true
    }

    try {
      isVerifying.value = true

      const result = await verifyStripeSub(user.value.sessionId)
      lastVerified.value = new Date()
      verificationComplete.value = true

      if (!result.valid) {
        showPaymentWarning()
        return false
      }

      return true
    } catch (error) {
      console.error('Error verifying premium subscription:', error)
      verificationComplete.value = true
      return false
    } finally {
      isVerifying.value = false
    }
  }

  function showPaymentWarning() {
    showSignOut.value = true
    signOutText.value =
      'Vi kunde inte verifiera din betalning. Du kommer att loggas ut inom 10 sekunder. För att fortsätta använda premiumtjänsten, vänligen kontrollera din prenumeration.'

    setTimeout(() => {
      signOutUser()
    }, 10000)
  }

  function showPaymentDeadlineWarning() {
    showSignOut.value = true
    signOutText.value =
      'Ditt konto kommer att loggas ut om 30 sekunder eftersom nästa betaldatum har passerat. För att fortsätta använda plattformen, vänligen logga in och betala för nästa period'

    setTimeout(() => {
      signOutUser()
    }, 30000)
  }

  function showDeletionWarning() {
    showSignOut.value = true
    signOutText.value =
      'Eftersom att du valt att radera ditt konto kommer du att loggas ut inom 30 sekunder'

    setTimeout(() => {
      signOutUser()
    }, 30000)
  }

  function resetVerification() {
    verificationComplete.value = false
    lastVerified.value = null
    showSignOut.value = false
    signOutText.value = ''
  }

  function signOutUser() {
    authStore.signOut()
  }

  function checkPaymentDate() {
    if (!user.value) return false

    if (user.value.newPaymentDate) {
      const newPaymentDate = new Date(user.value.newPaymentDate.seconds * 1000 - 60000)

      if (new Date() >= newPaymentDate) {
        showPaymentDeadlineWarning()
        return true
      }
    }

    if (
      user.value.createdAt &&
      user.value.subscriptionType === 'premium' &&
      user.value.sessionId === null &&
      new Date() >= new Date(user.value.createdAt.seconds * 1000 + 121.6 * 24 * 60 * 60 * 1000)
    ) {
      showPaymentDeadlineWarning()
      return true
    }

    return false
  }

  function checkAccountDeletion() {
    if (!user.value || !user.value.deleted) return false

    const deletionDate = new Date(user.value.deleted.seconds * 1000)

    if (new Date() >= deletionDate) {
      showDeletionWarning()
      return true
    }

    return false
  }

  async function checkAllConditions() {
    if (!user.value) return

    if (checkAccountDeletion()) return

    if (checkPaymentDate()) return

    await verifyPremiumStatus()
  }

  watch(
    () => user.value,
    async (newUser) => {
      if (newUser) {
        resetVerification()
        await checkAllConditions()
      }
    }
  )

  return {
    isVerifying,
    showSignOut,
    signOutText,
    verificationComplete,
    lastVerified,
    verifyPremiumStatus,
    showPaymentWarning,
    showPaymentDeadlineWarning,
    showDeletionWarning,
    checkPaymentDate,
    checkAccountDeletion,
    checkAllConditions,
    resetVerification
  }
})
