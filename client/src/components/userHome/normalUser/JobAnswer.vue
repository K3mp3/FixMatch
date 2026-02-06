<script setup lang="ts">
import LoadingSpinner from '@/components/assets/LoadingSpinner.vue'
import ResponseModal from '@/components/dialogs/ResponseModal.vue'
import { formatDate } from '@/components/utils/formatDate'
import MapBoxGlobe from '@/components/utils/MapBoxGlobe.vue'
import PDFViewer from '@/components/utils/PDFViewer.vue'
import type { IBookingMessage, IBookingResponse } from '@/models/IBookingResponse'
import type { IRepairShopAnswer } from '@/models/IRepairShopAnswer'
import type { IRepairShopUser } from '@/models/IRepairShopUser'
import type { ITimeSlot } from '@/models/ITimeSlot'
import { fetchBooking, sendSelectedDatesToServer } from '@/services/timeBooking'
import { onMounted, ref, toRef, watch, type PropType } from 'vue'
import OfferDetails from './OfferDetails.vue'
import OfferOpeningHours from './OfferOpeningHours.vue'
import RequestDetails from './RequestDetails.vue'
import TimeBooking from './TimeBooking.vue'

const props = defineProps({
  answer: {
    type: Object as PropType<IRepairShopAnswer>,
    required: true
  },
  customerMessage: {
    type: Object,
    required: true
  },
  request: {
    type: Object,
    required: true
  },
  repairShop: {
    type: Object as PropType<IRepairShopUser>,
    required: true
  },
  disableBookingBtn: {
    type: Boolean,
    required: true
  }
})

const openingHours = ref<ITimeSlot[]>([])
const bookedRequests = ref<IBookingResponse[]>([])

const isInfo = ref(false)
const isTimeBooking = ref(false)
const isLoading = ref(false)
const isBookingSuccess = ref(false)
const isResponseModal = ref(false)
const viewOfferPdf = ref(false)
const isMap = ref(false)
const isDeclined = ref(false)

const responseTitle = ref('')
const responseHeading = ref('')
const responseText = ref('')

const isBtnDisabled = ref(props.disableBookingBtn)

const disableBookingBtnRef = toRef(props, 'disableBookingBtn')

const selectedInfo = ref<'offer' | 'request' | 'details' | ''>('')

const emit = defineEmits<{ (e: 'disableButtons'): void }>()

const fetchBookingData = async () => {
  const data = {
    requestId: props.answer.id,
    repairShopUid: props.answer.uuid,
    customerMessageId: props.answer.customerMessageId
  }

  const response = await fetchBooking(data)

  if (typeof response !== 'number' && 'responseData' in response) {
    const responseData = JSON.parse(JSON.stringify(response.responseData))
    bookedRequests.value = [responseData]

    if (
      responseData &&
      responseData.message &&
      Array.isArray(responseData.message) &&
      responseData.message.length > 0
    ) {
      const hasMatchingBooking = responseData.message.some((booking: IBookingMessage) => {
        const matchesRequest = booking.requestId === props.answer.id
        const matchesMessage = booking.customerMessageId === props.answer.customerMessageId
        const matchesCustomer = booking.customerEmail === props.request.customerEmail

        if (booking.declined) isDeclined.value = booking.declined

        return matchesRequest && matchesMessage && matchesCustomer
      })

      isBtnDisabled.value = hasMatchingBooking
    } else {
      isBtnDisabled.value = false
    }
  } else {
    isBtnDisabled.value = false
  }
}

const saveSelectedDates = async (dateOne: Date, dateTwo: Date, dateThree: Date) => {
  isLoading.value = true

  const data = {
    dateOne: dateOne,
    dateTwo: dateTwo,
    dateThree: dateThree,
    customerMessageId: props.answer.customerMessageId,
    repairShopUid: props.answer.uuid,
    requestId: props.answer.id,
    customerEmail: props.request.customerEmail,
    priceOffer: props.answer.priceOffer as number,
    registrationNumber: props.answer.registrationNumber as string,
    typeOfFix: props.answer.typeOfFix as string,
    customerMessage: props.customerMessage[0].message,
    type: props.customerMessage[0].type,
    work: props.customerMessage[0].work,
    repairShopEmail: props.answer.repairShopEmail ?? ''
  }

  isTimeBooking.value = false

  const response = await sendSelectedDatesToServer(data)

  if (response === 201) {
    isLoading.value = false
    responseTitle.value = 'Bokningsförfrågan skickad'
    responseHeading.value = 'Din bokningsförfrågan är skickad!'
    responseText.value = `Vi har skickat din förfrågan till ${props.repairShop.name} som kommer svara så snart dom kan`
    isBookingSuccess.value = true
    isResponseModal.value = true
    isBtnDisabled.value = true
    fetchBookingData()
    emit('disableButtons')
  } else {
    isLoading.value = false
    responseTitle.value = 'Bokningsförfrågan ej skickad'
    responseHeading.value = 'Din bokningsförfrågan kunde ej skickas!'
    responseText.value =
      'Tyvärr kunde vi ej skicka din bokningsförfrågan. Kvarstår problemet, kontakta oss på info@fixmatch.se'
    isBookingSuccess.value = false
    isResponseModal.value = true
  }
}

watch(disableBookingBtnRef, (newValue) => {
  isBtnDisabled.value = newValue
})

onMounted(async () => {
  openingHours.value = props.repairShop.selectedTimes

  await fetchBookingData()
})
</script>

<template>
  <div class="spinner-component" v-if="isLoading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <!-- v-if="isConfirmation || isConfirmationError" -->

  <ResponseModal
    v-if="isResponseModal"
    :success="isBookingSuccess"
    :title="responseTitle"
    :heading="responseHeading"
    :text="responseText"
    @closeModal="isResponseModal = false"
  />

  <TimeBooking
    v-if="isTimeBooking"
    :openingHours="openingHours"
    @selectedDates="saveSelectedDates"
    @closeTimeBooking="isTimeBooking = false"
  />

  <PDFViewer
    v-if="props.answer.pdfFileName && viewOfferPdf"
    :pdfFileName="props.answer.pdfFileName"
    @closePDF="viewOfferPdf = false"
  />

  <section class="flex flex-col gap-6 items-center lg:mt-8 p-4 max-w-[750px] m-auto">
    <div
      class="flex flex-col gap-4 w-full max-w-[750px] bg-sky-white p-4 rounded-lg drop-shadow-lg"
    >
      <div class="flex justify-between">
        <div class="flex flex-col">
          <strong>{{ props.answer.repairShopName }}</strong>
          <p class="text-third">{{ props.repairShop.address }}</p>
          <p class="text-third">
            {{ props.repairShop.postalCode }} {{ props.repairShop.location }}
          </p>
        </div>
        <strong class="text-sky-blue">{{ props.answer.priceOffer }} kr</strong>
      </div>

      <div class="flex gap-2">
        <strong>Typ av jobb:</strong>
        <p>{{ props.answer.typeOfFix }}</p>
      </div>

      <div class="flex gap-2">
        <strong>Arbetstid:</strong>
        <p>{{ props.answer.workTime }} h</p>
      </div>

      <div class="flex gap-2">
        <strong>Giltig till:</strong>
        <p>{{ formatDate(props.answer.validOfferDate) }}</p>
      </div>

      <div class="gray-line"></div>

      <div class="flex flex-wrap gap-4 justify-between text-third">
        <button
          @click="viewOfferPdf = true"
          type="button"
          class="flex flex-col items-center justify-center gap-1"
        >
          <fontAwesome :icon="['fas', 'arrow-up-right-from-square']" /> Visa offert
        </button>

        <button
          @click="isMap = true"
          type="button"
          class="flex flex-col items-center justify-center gap-1"
        >
          <fontAwesome :icon="['fas', 'map']" /> Visa karta
        </button>

        <button
          type="button"
          :class="[
            'flex flex-col items-center justify-center gap-1',
            selectedInfo === 'offer' ? 'text-sky-blue' : 'text-third'
          ]"
          @click="(selectedInfo = !isInfo ? 'offer' : ''), (isInfo = !isInfo)"
        >
          <fontAwesome :icon="['fas', 'circle-info']" />
          Information
        </button>

        <button
          type="button"
          :class="[
            'mb-2 flex flex-col items-center justify-center gap-1',
            isBtnDisabled || isDeclined || new Date() > new Date(props.answer.validOfferDate)
              ? 'text-disabled'
              : 'text-sky-blue'
          ]"
          @click="isTimeBooking = !isTimeBooking"
          :disabled="
            isBtnDisabled || isDeclined || new Date() > new Date(props.answer.validOfferDate)
          "
        >
          <fontAwesome :icon="['fas', 'calendar-check']" />
          {{
            isDeclined
              ? 'Avbokad'
              : new Date() > new Date(props.answer.validOfferDate)
                ? 'Giltighetstid passerad'
                : isBtnDisabled
                  ? 'Bokning redan gjord'
                  : 'Boka en tid'
          }}
        </button>
      </div>
      <div class="flex gap-2 justify-between text-main"></div>

      <div class="flex flex-col gap-2 justify-start">
        <MapBoxGlobe
          v-if="props.repairShop.address && isMap"
          :address="props.repairShop.address"
          :postalCode="props.repairShop.postalCode"
          :location="props.repairShop.location"
        />
      </div>

      <section class="w-full flex flex-col gap-6" v-if="isInfo">
        <div class="gray-line"></div>
        <ul class="p-0 w-full flex justify-between max-w-[300px]">
          <li :class="selectedInfo === 'offer' ? 'text-sky-blue' : 'text-main'">
            <button type="button" @click="selectedInfo = 'offer'">Offert</button>
          </li>
          <li :class="selectedInfo === 'request' ? 'text-sky-blue' : 'text-main'">
            <button type="button" @click="selectedInfo = 'request'">Förfrågan</button>
          </li>
          <li :class="selectedInfo === 'details' ? 'text-sky-blue' : 'text-main'">
            <button type="button" @click="selectedInfo = 'details'">Öppettider</button>
          </li>
        </ul>

        <OfferDetails
          v-if="selectedInfo === 'offer'"
          :answer="props.answer"
          :repairShopData="props.repairShop"
        />

        <RequestDetails
          v-if="selectedInfo === 'request'"
          :answer="props.answer"
          :customerMessage="props.customerMessage"
        />

        <OfferOpeningHours :openingHours="openingHours" v-if="selectedInfo === 'details'" />
      </section>
    </div>
  </section>
</template>
