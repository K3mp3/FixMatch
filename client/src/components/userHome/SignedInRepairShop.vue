<script setup lang="ts">
import { db } from '@/main'
import type { IBookingRequest } from '@/models/IBookingResponse'
import type { IRepairShopAnswer } from '@/models/IRepairShopAnswer'
import type { IRepairShopContact } from '@/models/IRepairShopContact'
import router from '@/router'
import { checkTrialPeriod } from '@/services/account'
import { answerFromRepairShop } from '@/services/userContact'
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import type { AxiosResponse } from 'axios'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import LoadingSpinner from '../assets/LoadingSpinner.vue'
import PaymentWarningModal from '../dialogs/PaymentWarningModal.vue'
import SignedInNav from '../nav/SignedInNav.vue'
import { updateScreenSize } from '../utils/screenSize'
import { usePaymentVerification } from '../utils/usePaymentVerification'
import BookingContent from './repairShop/BookingContent.vue'
import RequestContent from './RequestContent.vue'

const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)

// Initialize payment verification
usePaymentVerification({ checkIntervalMinutes: 5 })

const requests = ref<IRepairShopContact[]>([])
const bookings = ref<IBookingRequest[]>([])
const requestsForBooking = ref<IRepairShopContact[]>([])
const trialCheckInterval = ref<number | null>(null)

const navMobile = ref(true)

const activeRequests = ref({
  userRequest: false,
  userBooking: false,
  bookingData: false,
  submittingAnswer: false
})

const unsubscribe = ref<(() => void) | null>(null)
const unsubscribeBookings = ref<(() => void) | null>(null)

const isLoading = computed(() => {
  return (
    loading.value ||
    activeRequests.value.userRequest ||
    activeRequests.value.userBooking ||
    activeRequests.value.bookingData ||
    activeRequests.value.submittingAnswer
  )
})

const userData = computed(() => {
  if (!user.value) {
    console.warn('User data is null')
    return null
  }

  const data = {
    email: user.value.email,
    uid: user.value.uid,
    location: user.value.location,
    name: user.value.name,
    phoneNumber: user.value.phoneNumber,
    address: user.value.address,
    firstSignIn: user.value.firstSignIn,
    selectedTimes: user.value.selectedTimes,
    postalCode: user.value.postalCode,
    deleted: user.value.deleted,
    newPaymentDate: user.value.newPaymentDate,
    subscriptionType: user.value.subscriptionType,
    createdAt: user.value.createdAt,
    nextFeeDate: user.value.nextFeeDate,
    sessionId: user.value.sessionId
  }
  return data
})

const fetchScreenSize = () => {
  navMobile.value = updateScreenSize(document.documentElement.clientWidth)
}

const realtimeRequest = () => {
  if (!userData.value?.email) return

  const currentDate = new Date().toISOString()

  const q = query(
    collection(db, 'contactRepairShops'),
    where('location', '==', userData.value.location),
    where('validDate', '>=', currentDate)
  )

  unsubscribe.value = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const newRequest = {
          id: change.doc.id,
          ...change.doc.data()
        } as IRepairShopContact

        const isDuplicate = requests.value.some(
          (req) =>
            req.id === newRequest.id ||
            (req.registrationNumber === newRequest.registrationNumber &&
              JSON.stringify(req.customerMessage) === JSON.stringify(newRequest.customerMessage))
        )

        if (!isDuplicate) {
          const filteredRequest = filterUnAnsweredMessages([newRequest], userData.value!.email)[0]
          if (filteredRequest) requests.value.push(filteredRequest)
        }
      }

      if (change.type === 'modified') {
        const updatedRequest = {
          id: change.doc.id,
          ...change.doc.data()
        } as IRepairShopContact

        const filteredRequest = filterUnAnsweredMessages([updatedRequest], userData.value!.email)[0]

        const index = requests.value.findIndex((req) => req.id === updatedRequest.id)

        if (index !== -1) {
          if (filteredRequest) requests.value.splice(index, 1, filteredRequest)
          else requests.value.splice(index, 1)
        } else if (filteredRequest) requests.value.push(filteredRequest)
      }
    })
  })
}

const realtimeBookings = () => {
  if (!userData.value?.uid) return

  const q = query(collection(db, 'bookings'), where('repairShopUid', '==', userData.value.uid))

  unsubscribeBookings.value = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const newBooking = {
          id: change.doc.id,
          ...change.doc.data()
        } as IBookingRequest

        // Check if repair shop has already suggested dates or accepted the booking
        const suggestedByThisShop = newBooking.suggestedDates?.uid === userData.value?.uid
        const acceptedByThisShop = newBooking.acceptedByRepairShop?.uid === userData.value?.uid
        const isDeclined = newBooking.declined === true

        if (!suggestedByThisShop && !acceptedByThisShop && !isDeclined) {
          const isDuplicate = bookings.value.some((booking) => booking.id === newBooking.id)

          if (!isDuplicate) {
            bookings.value.push(newBooking)
          }
        }
      }

      if (change.type === 'modified') {
        const updatedBooking = {
          id: change.doc.id,
          ...change.doc.data()
        } as IBookingRequest

        const index = bookings.value.findIndex((booking) => booking.id === updatedBooking.id)

        if (index !== -1) {
          // Check if repair shop has already suggested dates or accepted the booking
          const suggestedByThisShop = updatedBooking.suggestedDates?.uid === userData.value?.uid
          const acceptedByThisShop =
            updatedBooking.acceptedByRepairShop?.uid === userData.value?.uid
          const isDeclined = updatedBooking.declined === true

          if (!suggestedByThisShop && !acceptedByThisShop && !isDeclined) {
            bookings.value[index] = updatedBooking
          } else {
            bookings.value.splice(index, 1)
          }
        } else {
          // This is a new booking that wasn't previously in our list
          const suggestedByThisShop = updatedBooking.suggestedDates?.uid === userData.value?.uid
          const acceptedByThisShop =
            updatedBooking.acceptedByRepairShop?.uid === userData.value?.uid
          const isDeclined = updatedBooking.declined === true

          if (!suggestedByThisShop && !acceptedByThisShop && !isDeclined) {
            bookings.value.push(updatedBooking)
          }
        }
      }

      if (change.type === 'removed') {
        const removedBooking = {
          id: change.doc.id,
          ...change.doc.data()
        }

        const index = bookings.value.findIndex((booking) => booking.id === removedBooking.id)
        if (index !== -1) {
          bookings.value.splice(index, 1)
        }
      }
    })
  })
}

const removeBookingLocally = (requestId: string) => {
  bookings.value = bookings.value.filter((booking) => booking.requestId !== requestId)
}

const filterUnAnsweredMessages = (
  messages: IRepairShopContact[],
  signedInRepairShopEmail: string
): IRepairShopContact[] => {
  return messages
    .map((message) => {
      const filteredMessage = {
        ...message,
        customerMessage: message.customerMessage.filter((msg) => {
          const hasBeenAnsweredBySignedInShop =
            message.repairShopAnswers?.some(
              (answer) =>
                answer.customerMessageId === msg.id &&
                answer.repairShopEmail === signedInRepairShopEmail
            ) ?? false

          return !hasBeenAnsweredBySignedInShop
        })
      }

      return filteredMessage
    })
    .filter((message) => message.customerMessage.length > 0)
}

async function handleAnswer(messageData: IRepairShopAnswer | FormData) {
  if (!messageData) return

  try {
    activeRequests.value.submittingAnswer = true

    const response = (await answerFromRepairShop(messageData)) as AxiosResponse
  } catch (error) {
    console.error('Error submitting answer')
  } finally {
    activeRequests.value.submittingAnswer = false
  }
  // Uppdatera med feedback om hur saven gick
}

const checkTrial = async () => {
  const user = {
    email: userData.value?.email
  }

  const response = await checkTrialPeriod(user)

  if (response.status === 403) authStore.signOut()
}

watch(
  [() => user.value, () => loading.value],
  async ([newUser, isLoading]) => {
    if (!isLoading && newUser) {
      try {
        await Promise.all([realtimeRequest(), realtimeBookings()])
      } catch (error) {
        console.error('Error in watch')
      }
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await authStore.initAuth()

  if (!loading.value && user.value) {
    realtimeRequest()
    realtimeBookings()
  }

  fetchScreenSize()
  window.addEventListener('resize', fetchScreenSize, false)

  if (userData?.value?.firstSignIn === true) router.push('/repair-shop-garage-onboarding')

  // Trial check interval is now handled by the usePaymentVerification composable
  trialCheckInterval.value = setInterval(
    () => {
      checkTrial()
    },
    1000 * 60 * 10
  )
})

onUnmounted(() => {
  if (trialCheckInterval.value) {
    clearInterval(trialCheckInterval.value)
  }

  // Clean up Firestore listeners
  if (unsubscribe.value) {
    unsubscribe.value()
  }

  if (unsubscribeBookings.value) {
    unsubscribeBookings.value()
  }

  window.removeEventListener('resize', fetchScreenSize)
})
</script>

<template>
  <SignedInNav :repairShop="true" :highlight="'home'" />

  <!-- Payment Warning Modal -->
  <PaymentWarningModal />

  <div class="spinner-component" v-if="loading || isLoading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <main
    class="flex flex-col gap-10 p-4 min-h-screen mb-24 items-center"
    v-if="!loading && !isLoading"
  >
    <div class="w-full max-w-[500px]">
      <h2 class="text-xl sm:text-2xl font-title-bold">Välkommen!</h2>
      <p v-if="requests.length === 0 && bookings.length === 0">Just nu har du inga förfrågningar</p>
      <p v-else>Just nu har du dessa förfrågningar</p>
    </div>

    <section class="w-full max-w-[500px] flex flex-col gap-6">
      <strong v-if="bookings.length > 0">Bokningsförfrågningar</strong>

      <div
        class="flex flex-col gap-14 :md-gap-6 bg-sky-white drop-shadow-lg w-full rounded-lg p-4"
        v-for="(booking, index) in bookings"
        :key="index"
      >
        <BookingContent
          :booking="booking"
          :openingHours="userData?.selectedTimes || []"
          :index="index"
          :requests="requestsForBooking"
          :subscriptionType="userData?.subscriptionType ? userData.subscriptionType : 'premium'"
          :createdAt="userData?.createdAt"
          :nextFeeDate="userData?.nextFeeDate"
          @removeBooking="removeBookingLocally"
        />
      </div>
    </section>

    <section class="w-full max-w-[500px] flex flex-col gap-6">
      <strong v-if="requests.length > 0">Offertförfrågningar</strong>

      <div
        class="flex flex-col gap-14 :md-gap-6 bg-sky-white drop-shadow-lg w-full rounded-lg p-4 max-w-[500px]"
        v-for="request in requests"
        :key="request.id"
      >
        <div
          v-for="(customerMessage, index) in request.customerMessage"
          :key="request.id + '-' + index"
        >
          <RequestContent
            :customerMessage="customerMessage"
            :message="request"
            :userData="userData"
            @messageData="handleAnswer"
          />
        </div>
      </div>
    </section>
  </main>
</template>
