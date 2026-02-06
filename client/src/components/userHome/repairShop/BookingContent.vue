<script setup lang="ts">
import ResponseModal from '@/components/dialogs/ResponseModal.vue'
import { formatDate } from '@/components/utils/formatDate'
import type { IRepairShopContact } from '@/models/IRepairShopContact'
import type { ITimeSlot } from '@/models/ITimeSlot'
import { createPaymentIntent, saveNewDates, sendAcceptedDateToServer } from '@/services/timeBooking'
import { loadStripe } from '@stripe/stripe-js'
import { Timestamp } from 'firebase/firestore'
import DatePicker from 'primevue/datepicker'
import { computed, nextTick, onMounted, ref, type PropType } from 'vue'

const props = defineProps({
  booking: {
    type: Object,
    required: true
  },
  openingHours: {
    type: Array as PropType<ITimeSlot[]>,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  requests: {
    type: Array as PropType<IRepairShopContact[]>,
    required: true
  },
  subscriptionType: {
    type: String,
    required: true
  },
  createdAt: {
    type: Object as PropType<Timestamp | undefined>,
    required: false,
    default: () => Timestamp.now()
  },
  nextFeeDate: {
    type: Object as PropType<Timestamp | null | undefined>,
    required: true
  }
})

const stripeKey = import.meta.env.STRIPE_PROMISEKEY

const setButtonValue = ref('')
const setChosenDateValue = ref('')
const responseTitle = ref('')
const responseHeading = ref('')
const responseText = ref('')
const bookingButtonText = ref('')

const isAcceptDateDisabled = ref(true)
const isLoading = ref(false)
const isResponseModal = ref(false)
const isBookingSuccess = ref(false)
const isSelectNewDates = ref(false)

const firstDate = ref<Date>()
const secondDate = ref<Date>()
const thirdDate = ref<Date>()
const requestsArray = ref<IRepairShopContact[]>([])

const isPaymentModalOpen = ref(false)
const clientSecret = ref('')
const stripePromise = loadStripe(stripeKey)

const stripeElements = ref()
const paymentError = ref('')
const isProcessingPayment = ref(false)

const isPremiumUser = computed(() => props.subscriptionType === 'premium')

const bookingFee = computed(() => Math.round(props.booking.priceOffer * 0.05))

const vatAmount = computed(() => Math.round(bookingFee.value * 0.25))

const paymentAmount = computed(() => bookingFee.value + vatAmount.value)

const getBookingButtonText = () => {
  if (
    isPremiumUser.value ||
    (props.nextFeeDate && new Date() <= new Date(props?.nextFeeDate?.seconds * 1000))
  ) {
    bookingButtonText.value = 'Acceptera valt datum'
  } else if (
    props.createdAt &&
    new Date() <= new Date(props?.createdAt?.seconds * 1000 + 121.6 * 24 * 60 * 60 * 1000)
  ) {
    bookingButtonText.value = 'Acceptera valt datum (provperiod)'
  } else {
    bookingButtonText.value = 'Acceptera valt datum (5% avgift)'
  }
}

const isInTrialPeriod = computed(() => {
  if (props.subscriptionType !== 'core') return false

  if (props.createdAt) {
    return new Date() <= new Date(props?.createdAt?.seconds * 1000 + 121.6 * 24 * 60 * 60 * 1000)
  }

  return false
})

const minDate = ref<Date>(
  (() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  })()
)

const isBtnDisabled = computed(() => !(firstDate.value && secondDate.value && thirdDate.value))

const emit = defineEmits<{
  (e: 'removeBooking', requestId: string): void
}>()

const dayMap = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
}

const disabledDays = computed(() => {
  if (!props.openingHours?.length) return [0, 1, 2, 3, 4, 5, 6]

  return Object.entries(dayMap).reduce((acc: number[], [dayNum, dayName]) => {
    const daySchedule = props.openingHours.find(
      (schedule) => schedule.day.toLowerCase() === dayName
    )

    if (!daySchedule?.isOpen) acc.push(Number(dayNum))

    return acc
  }, [])
})

const handleChosenDate = async () => {
  isLoading.value = true

  try {
    if (
      isPremiumUser.value ||
      (props.nextFeeDate && new Date() <= new Date(props?.nextFeeDate?.seconds * 1000))
    ) {
      await completeBookingWithoutPayment()
      return
    } else if (
      props.createdAt &&
      new Date() <= new Date(props?.createdAt?.seconds * 1000 + 121.6 * 24 * 60 * 60 * 1000)
    ) {
      await completeBookingWithoutPayment()
      return
    }

    const paymentData = {
      amount: bookingFee.value,
      bookingId: props.booking.requestId,
      acceptedDate: setChosenDateValue.value,
      currency: 'sek',
      uid: props.booking.repairShopUid
    }

    const result = await createPaymentIntent(paymentData)

    if (result.error) {
      throw new Error(result.message)
    }

    clientSecret.value = result.data.clientSecret
    isPaymentModalOpen.value = true

    nextTick(() => {
      initializeStripeElements()
    })
  } catch (err: any) {
    console.error('Payment error:', err)
    responseTitle.value = 'Problem vid betalning'
    responseHeading.value = 'Betalning kunde ej genomföras'
    responseText.value = err.message || 'Ett fel uppstod vid förberedelse av betalning'
    isResponseModal.value = true
    isBookingSuccess.value = false
  } finally {
    isLoading.value = false
  }
}

const completeBookingWithoutPayment = async () => {
  const bookingData = {
    customerEmail: props.booking.customerEmail as string,
    uid: props.booking.repairShopUid as string,
    requestId: props.booking.requestId,
    acceptedDate: setChosenDateValue.value,
    customerMessageId: props.booking.customerMessageId,
    paymentCompleted: true,
    isTrialBooking: isInTrialPeriod.value,
    subscriptionType: props.subscriptionType
  }

  const response = await sendAcceptedDateToServer(bookingData)

  if (response === 201) {
    isResponseModal.value = true
    isBookingSuccess.value = true
    responseTitle.value = 'Bokning accepterad'
    responseHeading.value = 'Bokningen är nu accepterad'
    responseText.value = 'Bokningen är accepterad och ett e-mail har skickats till kunden'
  } else {
    isResponseModal.value = true
    isBookingSuccess.value = false
    responseTitle.value = 'Bokning ej accepterad'
    responseHeading.value = 'Bokningen kunde ej accepteras'
    responseText.value =
      'Tyvärr kunde bokningen inte accepteras. Om problemet kvarstår kontakta oss på info@fixmatch.se eller 070-380 01 02'
  }

  isLoading.value = false
}

const initializeStripeElements = async () => {
  if (!clientSecret.value) return

  const stripe = await stripePromise
  const elements = stripe?.elements({
    clientSecret: clientSecret.value,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#4d74ff',
        colorBackground: '#111111',
        colorText: '#d9d9d9',
        colorDanger: '#e53e3e',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px'
      },
      rules: {
        '.Input': {
          backgroundColor: '#333333',
          color: '#d9d9d9'
        },
        '.Input:focus': {
          border: '1px solid #4d74ff'
        },
        '.Label': {
          color: '#d9d9d9'
        },
        '.Tab': {
          backgroundColor: '#333333',
          color: '#d9d9d9'
        },
        '.Tab:hover': {
          color: '#EEEEEE'
        },
        '.Tab--selected': {
          borderColor: '#4d74ff',
          color: '#d9d9d9'
        }
      }
    }
  })

  const paymentElement = elements?.create('payment')
  paymentElement?.mount('#payment-element')

  stripeElements.value = { stripe, elements }
}

const handlePaymentSubmit = async (e: any) => {
  isLoading.value = true
  e.preventDefault()

  if (!stripeElements.value) return

  const { stripe, elements } = stripeElements.value
  isProcessingPayment.value = true

  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: window.location.origin + '/payment-success'
      }
    })

    if (error) {
      paymentError.value = error.message
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      handlePaymentSuccess()
    }
  } catch (err) {
    paymentError.value = 'Ett fel uppstod vid betalningen'
    console.error(err)
  } finally {
    isProcessingPayment.value = false
    isLoading.value = false
  }
}

const handlePaymentSuccess = async () => {
  isLoading.value = true
  isPaymentModalOpen.value = false

  const bookingData = {
    customerEmail: props.booking.customerEmail as string,
    uid: props.booking.repairShopUid as string,
    requestId: props.booking.requestId,
    acceptedDate: setChosenDateValue.value,
    customerMessageId: props.booking.customerMessageId,
    paymentCompleted: true,
    subscriptionType: props.subscriptionType,
    isTrialBooking: isInTrialPeriod.value
  }

  const response = await sendAcceptedDateToServer(bookingData)

  if (response === 201) {
    isResponseModal.value = true
    isBookingSuccess.value = true
    responseTitle.value = 'Betalning och bokning accepterad'
    responseHeading.value = 'Bokningen är nu accepterad och betalning skickad'
    responseText.value = 'Bokningen är accepterad och ett e-mail har skickats till kunden'
  } else {
    isResponseModal.value = true
    isBookingSuccess.value = false
    responseTitle.value = 'Betalning genomförd men kunde ej spara bokningen'
    responseHeading.value = 'Bokning kunde ej genomföras'
    responseText.value =
      'Det ser ut som att betalningen har gått igenom, men inte bokningen. Kontakta oss på info@fixmatch.se för en återbetalning av beloppet'
  }

  isLoading.value = false
}

const closePaymentModal = () => {
  isPaymentModalOpen.value = false
  clientSecret.value = ''
  paymentError.value = ''
}

const handleSendNewDates = async () => {
  isLoading.value = true

  const bookingData = {
    customerEmail: props.booking.customerEmail as string,
    uid: props.booking.repairShopUid as string,
    requestId: props.booking.requestId,
    firstDate: firstDate.value,
    secondDate: secondDate.value,
    thirdDate: thirdDate.value,
    customerMessageId: props.booking.customerMessageId,
    subscriptionType: props.subscriptionType,
    isTrialBooking: isInTrialPeriod.value
  }

  const response = await saveNewDates(bookingData)

  isLoading.value = false

  if (response === 201) {
    isResponseModal.value = true
    isBookingSuccess.value = true
    responseTitle.value = 'Föreslagna datum skickade'
    responseHeading.value = 'Nytt förslag på datum är nu skickat'
    responseText.value = 'Förslagen på de nya datumen är nu skickade till kunden. '
  } else {
    isResponseModal.value = true
    isBookingSuccess.value = true
    responseTitle.value = 'Kunde ej skicka föreslagna datum'
    responseHeading.value = 'Nytt förslag på datum är nu skickat'
    responseText.value = 'Förslagen på de nya datumen är nu skickade till kunden. '
  }

  firstDate.value = undefined
  secondDate.value = undefined
  thirdDate.value = undefined

  isSelectNewDates.value = false

  emit('removeBooking', props.requests[0].id as string)
}

setInterval(
  () => {
    getBookingButtonText()
  },
  1000 * 60 * 1
)

onMounted(async () => {
  getBookingButtonText()

  setButtonValue.value = props.booking.typeOfFix ?? ''
  requestsArray.value = props.requests

  if (props.booking.acceptedByCustomer.acceptedDate) {
    setChosenDateValue.value = props.booking.acceptedByCustomer.acceptedDate
  }
})
</script>

<template>
  <Teleport to="body" v-if="isResponseModal">
    <div class="modal-overlay">
      <div class="modal-container">
        <ResponseModal
          :success="isBookingSuccess"
          :title="responseTitle"
          :heading="responseHeading"
          :text="responseText"
          @closeModal="isResponseModal = false"
        />
      </div>
    </div>
  </Teleport>

  <Teleport to="body" v-if="isPaymentModalOpen">
    <div class="stripe-modal-overlay">
      <div class="stripe-modal-container">
        <div class="stripe-modal-header">
          <h3 class="text-main">Betala bokningsavgift</h3>
          <button @click="closePaymentModal" class="close-button">&times;</button>
        </div>
        <div class="stripe-modal-body">
          <p>För att bekräfta bokningen, betala 5% av priset + moms ({{ paymentAmount }} kr)</p>
          <p>Kostnad: {{ bookingFee }} kr</p>
          <p>Moms: {{ vatAmount }} kr</p>
          <form @submit="handlePaymentSubmit">
            <div id="payment-element"></div>
            <div class="button-container">
              <button type="submit" class="main-btn w-full mt-4" :disabled="isProcessingPayment">
                {{ isProcessingPayment ? 'Bearbetar...' : 'Betala nu' }}
              </button>
            </div>
            <div class="error-message" v-if="paymentError">
              {{ paymentError }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>

  <form class="flex flex-col gap-1">
    <h2>{{ props.booking.type }}</h2>

    <p>{{ props.booking.work }}</p>

    <p class="flex flex-col">
      <strong class="font-title-bold">Kundmeddelande: </strong>{{ props.booking.customerMessage }}
    </p>

    <p class="flex flex-col">
      <strong class="font-title-bold">Registreringsnummer: </strong
      >{{ props.booking.registrationNumber }}
    </p>

    <input
      type="text"
      :disabled="true"
      class="text-input-light px-2"
      :value="`${props.booking.priceOffer} kr`"
    />

    <span class="flex gap-2 mt-2"
      ><button
        type="button"
        :class="[
          'w-5 h-5 border-main rounded-full',
          setButtonValue === 'Felsökning' && 'border-blue'
        ]"
        @click="setButtonValue = 'Felsökning'"
        :disabled="true"
      ></button>
      <p>Felsökning (för en timme)</p></span
    >
    <span class="flex gap-2"
      ><button
        type="button"
        :class="[
          'w-5 h-5 border-main rounded-full',
          setButtonValue === 'Reparation' && 'border-blue'
        ]"
        @click="setButtonValue = 'Reparation'"
        :disabled="true"
      ></button>
      <p>Reparation</p></span
    >

    <section v-if="props.booking.acceptedByCustomer" class="flex flex-col gap-4 mt-4">
      <p>Datum accepterat av kund:</p>

      <div class="flex gap-4 items-center">
        <div class="flex flex-col gap-4 w-full">
          <input
            id="priceOffer"
            name="priceOffer"
            type="text"
            class="text-input-light px-2 w-full"
            :disabled="true"
            :value="formatDate(props.booking.acceptedByCustomer.acceptedDate)"
          />
        </div>
      </div>

      <button type="button" class="mt-2 w-full main-btn" @click="handleChosenDate">
        {{ bookingButtonText }}
      </button>

      <button
        type="button"
        class="secondary-btn text-secondary mb-2 w-full"
        @click="isSelectNewDates = !isSelectNewDates"
      >
        Avböj
      </button>
    </section>

    <section v-else class="flex flex-col gap-4 mt-4">
      <p>Förslag på datum fån kund:</p>

      <div class="flex gap-4 items-center">
        <div class="flex flex-col gap-4 w-full">
          <input
            id="priceOffer"
            name="priceOffer"
            type="text"
            class="text-input-light px-2 w-full"
            :disabled="true"
            :value="formatDate(props.booking.dateOne)"
          />

          <input
            id="priceOffer"
            name="priceOffer"
            type="text"
            class="text-input-light px-2 w-full"
            :disabled="true"
            :value="formatDate(props.booking.dateTwo)"
          />

          <input
            id="priceOffer"
            name="priceOffer"
            type="text"
            class="text-input-light px-2 w-full"
            :disabled="true"
            :value="formatDate(props.booking.dateThree)"
          />
        </div>
        <div class="flex flex-col h-[142px] justify-evenly gap-6">
          <button
            type="button"
            :class="[
              'w-5 h-5 border-main rounded-full',
              setChosenDateValue === props.booking.dateOne && 'border-blue'
            ]"
            @click="
              (setChosenDateValue = props.booking.dateOne as string), (isAcceptDateDisabled = false)
            "
          ></button>

          <button
            type="button"
            :class="[
              'w-5 h-5 border-main rounded-full',
              setChosenDateValue === props.booking.dateTwo && 'border-blue'
            ]"
            @click="
              (setChosenDateValue = props.booking.dateTwo as string), (isAcceptDateDisabled = false)
            "
          ></button>

          <button
            type="button"
            :class="[
              'w-5 h-5 border-main rounded-full',
              setChosenDateValue === props.booking.dateThree && 'border-blue'
            ]"
            @click="
              (setChosenDateValue = props.booking.dateThree as string),
                (isAcceptDateDisabled = false)
            "
          ></button>
        </div>
      </div>
      <button
        type="button"
        :class="['mt-2 w-full', isAcceptDateDisabled ? 'main-btn-disabled' : 'main-btn ']"
        @click="handleChosenDate"
        :disabled="isAcceptDateDisabled"
      >
        <div v-if="isLoading">
          <div class="inline-flex items-center gap-4">
            <div
              class="grid w-full place-items-center overflow-x-scroll rounded-lg lg:overflow-visible mt-1"
            >
              <svg
                class="text-gray-300 animate-spin"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
              >
                <path
                  d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                  stroke="currentColor"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
                <path
                  d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                  stroke="currentColor"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-gray-900"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        {{ isLoading === false ? bookingButtonText : '' }}
      </button>

      <button
        type="button"
        class="border-button mb-2 w-full"
        @click="isSelectNewDates = !isSelectNewDates"
      >
        Avböj
      </button>
    </section>

    <section class="mt-2 flex flex-col gap-4" v-if="isSelectNewDates">
      <strong
        >Passar inget av datumen?
        <p>Ge förslag på tre nya</p></strong
      >

      <label class="flex flex-col gap-1 w-full">
        <p>Datum</p>
        <DatePicker
          v-model="firstDate"
          dateFormat="yy/mm/dd"
          showButtonBar
          hourFormat="24"
          :numberOfMonths="1"
          :disabledDays="disabledDays"
          fluid
          :minDate="minDate"
          class="custom-datepicker-input w-full border-main"
        />
      </label>

      <label class="flex flex-col gap-1 w-full">
        <p>Datum</p>
        <DatePicker
          v-model="secondDate"
          dateFormat="yy/mm/dd"
          showButtonBar
          hourFormat="24"
          :numberOfMonths="1"
          :disabledDays="disabledDays"
          fluid
          :minDate="minDate"
          class="custom-datepicker-input w-full border-main"
        />
      </label>

      <label class="flex flex-col gap-1 w-full">
        <p>Datum</p>
        <DatePicker
          v-model="thirdDate"
          dateFormat="yy/mm/dd"
          showButtonBar
          hourFormat="24"
          :numberOfMonths="1"
          :disabledDays="disabledDays"
          fluid
          :minDate="minDate"
          class="custom-datepicker-input w-full border-main"
        />
      </label>

      <button
        type="button"
        :class="['mt-2 w-full', isBtnDisabled ? 'main-btn-disabled text-secondary' : 'main-btn ']"
        @click="handleSendNewDates"
      >
        <div v-if="isLoading">
          <div class="inline-flex items-center gap-4">
            <div
              class="grid w-full place-items-center overflow-x-scroll rounded-lg lg:overflow-visible mt-1"
            >
              <svg
                class="text-gray-300 animate-spin"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
              >
                <path
                  d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                  stroke="currentColor"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
                <path
                  d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                  stroke="currentColor"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-gray-900"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        {{ isLoading === false ? 'Skicka' : '' }}
      </button>
    </section>
  </form>
</template>

<style scoped>
/* DatePicker Custom Styling */
:deep(.p-datepicker) {
  border-radius: 8px;
  font-family: var(--font-family);
}

:deep(.p-inputtext) {
  width: 100%;
  border: none;
  border-radius: 8px;
  background-color: rgb(248, 248, 248);
  color: rgb(110, 110, 110);
  font-size: 1rem;
  transition: border-color 0.2s;
}

:deep(.p-inputtext:hover) {
  border-color: rgb(37, 99, 233);
}

:deep(.p-inputtext:focus) {
  border-color: rgb(37, 99, 233);
  box-shadow: 0 0 0 2px rgba(0, 120, 215, 0.25);
  outline: none;
}

:deep(.p-datepicker-trigger) {
  background-color: transparent;
  border: none;
  color: var(--colors-main, rgb(110, 110, 110));
}

:deep(.p-datepicker-trigger:hover) {
  color: rgb(37, 99, 233);
}

:deep(.p-datepicker-header) {
  border-bottom: 1px solid var(--colors-main, rgb(110, 110, 110));
}

:deep(.p-datepicker-header button) {
  color: var(--colors-third, #737373);
}

:deep(.p-datepicker-header button:hover) {
  color: rgb(37, 99, 233);
}

:deep(.p-datepicker-calendar .p-highlight) {
  background-color: rgb(37, 99, 233);
  color: rgb(248, 248, 248);
}

:deep(.p-datepicker-today > span) {
  border-color: rgb(37, 99, 233);
}

:deep(.p-datepicker-buttonbar) {
  border-top: 1px solid var(--colors-main, rgb(110, 110, 110));
}

:deep(.p-button) {
  background-color: rgb(37, 99, 233);
  border: none;
}

:deep(.p-button.p-button-outlined) {
  background-color: transparent;
  border: 1px solid rgb(37, 99, 233);
  color: rgb(37, 99, 233);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  width: 500px;
}
</style>
