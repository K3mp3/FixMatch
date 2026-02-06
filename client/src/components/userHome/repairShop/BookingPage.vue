<script setup lang="ts">
import LoadingSpinner from '@/components/assets/LoadingSpinner.vue'
import SignedInNav from '@/components/nav/SignedInNav.vue'
import type { BookingWithId, IBookingMessage } from '@/models/IBookingResponse'
import { checkTrialPeriod } from '@/services/account'
import { fetchAcceptedBookingsForRepairShop } from '@/services/timeBooking'
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import DisplayBookings from './DisplayBookings.vue'

const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)

const isLoading = ref(true)

const hasShownWarning = ref(false)
const showSignOut = ref(false)

const bookings = ref<BookingWithId[]>([])
const deletionCheckInterval = ref<number | null>(null)
const trialCheckInterval = ref<number | null>(null)

const userData = computed(() => {
  if (user.value) {
    return {
      email: user.value.email,
      uid: user.value.uid,
      name: user.value.name,
      deleted: user.value.deleted
    }
  }
  return null
})

const fetchBookings = async () => {
  const user = {
    uid: userData.value?.uid
  }

  try {
    const response = await fetchAcceptedBookingsForRepairShop(user)

    if (typeof response !== 'number' && 'responseData' in response) {
      const mappedBookings = response.responseData.bookings.map(
        (booking: IBookingMessage, index: number) => ({
          ...booking,
          id: `${userData.value?.uid}-${index}-${booking.requestId}`
        })
      )

      bookings.value = mappedBookings.sort((a: IBookingMessage, b: IBookingMessage) => {
        const dateA = new Date(a.saveAcceptedDate?.acceptedDate || '')
        const dateB = new Date(b.saveAcceptedDate?.acceptedDate || '')

        if (isNaN(dateA.getTime())) return 1
        if (isNaN(dateB.getTime())) return -1

        return dateA.getTime() - dateB.getTime()
      })
    }
  } catch (error) {
    console.error('An unknown error occured')
  } finally {
    isLoading.value = false
  }
}

const updateBookings = (id: string) => {
  bookings.value = bookings.value.filter((booking) => booking.id !== id)
}

watch(
  () => loading.value,
  (newLoadingState) => {
    if (!newLoadingState && userData.value) fetchBookings()
  }
)

watch(
  () => userData.value?.uid,
  (newUid) => {
    if (newUid) fetchBookings()
  },
  { immediate: true }
)

onMounted(() => {
  if (!loading.value && userData.value?.uid) {
    fetchBookings()
  }

  deletionCheckInterval.value = setInterval(
    () => {
      if (userData.value?.deleted) {
        const deletionDate = new Date(userData.value?.deleted.seconds * 1000)

        if (new Date() >= deletionDate) {
          showSignOut.value = true
          hasShownWarning.value = true

          setTimeout(
            () => {
              authStore.signOut()
            },
            1000 * 60 * 1
          )
        }
      }
    },
    1000 * 60 * 1
  )

  const checkTrial = async () => {
    const user = {
      email: userData.value?.email
    }

    const response = await checkTrialPeriod(user)

    if (response.status === 403) authStore.signOut()
  }

  trialCheckInterval.value = setInterval(
    () => {
      checkTrial()
    },
    1000 * 60 * 10
  )
})

onUnmounted(() => {
  if (deletionCheckInterval.value) {
    clearInterval(deletionCheckInterval.value)
  }

  if (trialCheckInterval.value) {
    clearInterval(trialCheckInterval.value)
  }
})
</script>

<template>
  <SignedInNav :repairShop="true" :highlight="'bookings'" />

  <div class="spinner-component" v-if="isLoading || loading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <main class="flex flex-col gap-8 p-4 items-center mb-24" v-if="!loading && !isLoading">
    <h2 class="text-xl sm:text-2xl w-full max-w-[500px] text-start font-title-bold">Bokningar</h2>

    <div
      class="flex flex-col :md-gap-6 drop-shadow-lg bg-sky-white w-full rounded-lg p-4 max-w-[500px]"
      v-for="(booking, index) in bookings"
      :key="`${booking.requestId} - ${index}`"
    >
      <DisplayBookings
        :booking="booking"
        :email="userData?.email || ''"
        @updateBookings="updateBookings"
      />
    </div>
  </main>
</template>
