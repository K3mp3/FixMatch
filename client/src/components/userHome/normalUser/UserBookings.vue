<script setup lang="ts">
import LoadingSpinner from '@/components/assets/LoadingSpinner.vue'
import SignedInNav from '@/components/nav/SignedInNav.vue'
import type { IBookingMessage } from '@/models/IBookingResponse'
import { fetchAcceptedBookings } from '@/services/timeBooking'
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import BookingContent from './BookingContent.vue'

const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)

type ExtendedIBookingMessage = IBookingMessage & {
  id: string
  repairShopName: string
  address: string
  location: string
  postalCode: string
  phoneNumber: string
}

const navMobile = ref(true)
const isLoading = ref(true)

const bookings = ref<ExtendedIBookingMessage[]>([])

let resizeTimeout: ReturnType<typeof setTimeout> | null = null

window.addEventListener('resize', resizeThrottler, false)

const userData = computed(() => {
  return user.value
    ? {
        email: user.value.email,
        uid: user.value.uid,
        name: user.value.name
      }
    : null
})

function updateScreenSize() {
  const width = document.documentElement.clientWidth

  navMobile.value = width <= 1023
}

function resizeThrottler() {
  if (!resizeTimeout) {
    resizeTimeout = setTimeout(function () {
      resizeTimeout = null
      updateScreenSize()
    }, 66)
  }
}

const fetchBookings = async () => {
  const user = {
    email: userData.value?.email
  }

  isLoading.value = true

  try {
    const response = await fetchAcceptedBookings(user)

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
    } else if (typeof response === 'number' && response === 500) {
      console.error('An unknown error occured')
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

// watch(
//   [() => loading.value, () => userData.value],
//   ([newLoadingState, newUserData]) => {
//     if (!newLoadingState && newUserData) {
//       fetchBookings()
//     }
//   }
// )

watchEffect(() => {
  if (!loading.value && userData.value) {
    fetchBookings()
  }
})

onMounted(async () => {
  resizeThrottler()
})

onUnmounted(() => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  window.removeEventListener('resize', resizeThrottler, false)
})
</script>

<template>
  <SignedInNav :repairShop="false" :highlight="'bookings'" />

  <div class="spinner-component" v-if="isLoading || loading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <main class="flex flex-col gap-8 p-4 items-center mb-24" v-if="!loading && !isLoading">
    <h2 class="text-xl sm:text-2xl w-full max-w-[500px] text-start">Bokningar</h2>

    <div
      class="flex flex-col :md-gap-6 border-main w-full rounded-lg p-4 max-w-[500px]"
      v-for="(booking, index) in bookings"
      :key="`${booking.requestId} - ${index}`"
    >
      <BookingContent
        :booking="booking"
        :email="userData?.email || ''"
        @updateBookings="updateBookings"
      />
    </div>
  </main>
</template>
