<script setup lang="ts">
import type { BookingWithSuggestedDates } from '@/models/IBookingResponse'
import type { IRepairShopContact } from '@/models/IRepairShopContact'
import type { IRepairShopUser } from '@/models/IRepairShopUser'
import { retrieveRepairShopData } from '@/services/retreiveUserData'
import { fetchBookingsWithNewDates } from '@/services/timeBooking'
import { retrieveSentRequests } from '@/services/userContact'
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import type { AxiosResponse } from 'axios'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import LoadingSpinner from '../assets/LoadingSpinner.vue'
import LandingFooter from '../footer/LandingFooter.vue'
import LandingNav from '../nav/LandingNav.vue'
import UserSentRequests from './UserSentRequests.vue'
import UserReceivedBooking from './normalUser/UserReceivedBooking.vue'

const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)

const requests = ref<IRepairShopContact[]>([])
const repairShops = ref<IRepairShopUser[]>([])
const bookings = ref<BookingWithSuggestedDates[]>([])

const navMobile = ref(true)

const activeRequests = ref({
  userRequest: false,
  userBooking: false,
  repairShops: false
})

const isLoading = computed(() => {
  return (
    loading.value || activeRequests.value.userRequest,
    activeRequests.value.userBooking,
    activeRequests.value.repairShops
  )
})

let resizeTimeout: ReturnType<typeof setTimeout> | null = null

window.addEventListener('resize', resizeThrottler, false)

const userData = computed(() => {
  if (user.value) {
    return {
      email: user.value.email,
      uid: user.value.uid,
      name: user.value.name
    }
  }
  return null
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

// Filtrera ut requests som har blivit declined
async function fetchUserRequest() {
  if (userData.value) {
    try {
      activeRequests.value.userRequest = true
      const response = await retrieveSentRequests(userData.value)

      const responseData = response as { data: Object | null }

      if (typeof response === 'number') {
        console.error('Error fetching user requests: Server returned status code')
        return
      }

      const responseArray: IRepairShopContact[] = Array.isArray(responseData.data)
        ? responseData.data
        : [responseData.data]

      requests.value = responseArray.filter((message: IRepairShopContact) => {
        const flattenedCustomerMessages = message.customerMessage.flat()
        return flattenedCustomerMessages
      })

      requests.value = requests.value.sort((a, b) => {
        const dateA = a.validDate instanceof Date ? a.validDate : new Date(a.validDate)
        const dateB = b.validDate instanceof Date ? b.validDate : new Date(b.validDate)

        return dateB.getTime() - dateA.getTime()
      })

      fetchRepairShopData()
    } catch (error) {
      console.error('Error fetching user requests')
    } finally {
      activeRequests.value.userRequest = false
    }
  }
}

const fetchRepairShopData = async () => {
  try {
    activeRequests.value.repairShops = true
    const userObject: { [key: string]: string } = {}

    requests.value.forEach((request) => {
      if (request.repairShopAnswers) {
        request.repairShopAnswers.forEach((answer, index) => {
          if (answer.uuid) userObject[`user${index + 1}`] = answer.uuid
        })
      }
    })

    if (Object.keys(userObject).length === 0) {
      repairShops.value = []
      activeRequests.value.repairShops = false
      return
    }

    const response = (await retrieveRepairShopData(userObject)) as AxiosResponse<{
      users: IRepairShopUser[]
    }>

    repairShops.value = response.data.users
  } catch (error) {
    console.error('Error fetching repair shop data')
    repairShops.value = []
  } finally {
    activeRequests.value.repairShops = false
  }
}

const fetchBookings = async () => {
  if (!userData.value) return

  const user = {
    email: userData.value.email
  }

  try {
    activeRequests.value.userBooking = true
    const response = await fetchBookingsWithNewDates(user)

    if (response?.responseData?.bookings) {
      bookings.value = response.responseData.bookings
    } else {
      bookings.value = []
    }
  } catch (error: any) {
    throw new Error(error)
  } finally {
    activeRequests.value.userBooking = false
  }
}

const removeBookingLocally = (requestId: string, customerMessageId: string, uid: string) => {
  bookings.value = bookings.value.filter(
    (booking) =>
      !(
        booking.requestId === requestId &&
        booking.customerMessageId === customerMessageId &&
        booking.repairShopUid === uid
      )
  )
}

function removeJob(requestId: string, customerMessageId: string) {
  requests.value = requests.value
    .map((request) => {
      if (request.id !== requestId) return request

      if (
        request.customerMessage.length === 1 &&
        request.customerMessage[0].id === customerMessageId
      ) {
        return null
      }

      const updatedCustomerMessage = request.customerMessage.filter(
        (message) => message.id !== customerMessageId
      )

      return {
        ...request,
        customerMessage: updatedCustomerMessage
      }
    })
    .filter(Boolean) as IRepairShopContact[]
}

watch(
  [() => user.value, () => loading.value],
  async ([newUser, isLoading]) => {
    if (!isLoading && newUser) {
      await Promise.all([fetchUserRequest(), fetchBookings()])
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (!loading.value && userData.value) fetchUserRequest(), fetchBookings()
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
  <header class="flex flex-col gap-24 lg:gap-36 items-center">
    <nav class="w-full fixed z-10">
      <LandingNav :backgroundColor="true" />
    </nav>
  </header>

  <div class="spinner-component" v-if="isLoading || loading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <main
    class="flex flex-col gap-24 sm:gap-20 lg:gap-28 items-center lg:mt-[132px] mb-24"
    v-if="!loading && !isLoading"
  >
    <section class="flex flex-col gap-6 max-w-[550px] xl:max-w-[650px] 2xl:max-w-[750px] w-full">
      <div class="flex flex-col gap-2 p-4" v-if="bookings.length > 0">
        <h2 class="text-xl font-title-bold">Datumförslag från verkstäder</h2>
        <p class="text-third">Verkstäder har föreslagit följande tider baserat på din förfrågan</p>
        <div
          v-for="(booking, index) in bookings"
          :key="`${booking.requestId}+${index}`"
          class="flex flex-col bg-sky-white drop-shadow-lg rounded-lg px-4 pt-4 mb-4 mt-3"
        >
          <div class="flex flex-col gap-4">
            <UserReceivedBooking
              :booking
              @fetchBookingRequest="fetchBookings"
              @removeBooking="removeBookingLocally"
            />
          </div>
        </div>
      </div>

      <div class="p-4 mt-4 lg:mt-0 flex flex-col gap-6" v-if="requests.length > 0">
        <div class="flex items-center justify-between">
          <h2 class="text-xl">Dina uppdrag</h2>

          <RouterLink
            to="/get-offers"
            class="flex items-center gap-2 justify-center main-btn max-w-44"
            ><fontAwesome :icon="['fas', 'plus']" /> Nytt uppdrag</RouterLink
          >
        </div>

        <div
          v-for="(request, index) in requests"
          :key="request.id"
          :class="['flex flex-col gap-6', index === requests.length - 1 && 'mb-[106px]']"
        >
          <div
            v-for="(customerMessage, index) in request.customerMessage"
            :key="request.id + '-' + index"
            class="flex flex-col gap-6 bg-sky-white drop-shadow-lg p-4 rounded-lg"
          >
            <UserSentRequests
              :request="request"
              :customerMessage="customerMessage"
              :repairShopAnswers="request.repairShopAnswers || []"
              :repairShops="repairShops"
              @removeJob="removeJob"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 items-center p-4 mt-4 lg:mt-0" v-else>
        <h2 class="text-xl">Skapa ditt första uppdrag genom att klicka på knappen</h2>

        <div class="w-16 h-16 rounded-full border-main flex items-center justify-center">
          <fontAwesome :icon="['fas', 'arrow-down']" class="h-8 text-main" />
        </div>

        <RouterLink
          :to="authStore.isAuthenticated ? '/get-offers' : '/register'"
          class="main-btn flex items-center justify-center"
          :aria-label="authStore.isAuthenticated ? 'Få offerter' : 'Registrera'"
        >
          {{ authStore.isAuthenticated ? 'Få offerter' : 'Registrera' }}
        </RouterLink>
      </div>
    </section>
  </main>

  <footer>
    <LandingFooter />
  </footer>
</template>
