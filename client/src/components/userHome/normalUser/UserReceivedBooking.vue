<script setup lang="ts">
import LoadingSpinner from '@/components/assets/LoadingSpinner.vue'
import ResponseDialog from '@/components/dialogs/ResponseDialog.vue'
import type { BookingWithSuggestedDates } from '@/models/IBookingResponse'
import { sendNewAcceptedDatesToServer, updateSavedDates } from '@/services/timeBooking'
import DatePicker from 'primevue/datepicker'
import { computed, onMounted, ref, type PropType } from 'vue'

const props = defineProps({
  booking: {
    type: Object as PropType<BookingWithSuggestedDates>,
    required: true
  }
})

const setChosenDateValue = ref()
const responseText = ref('')

const isAcceptDateDisabled = ref(true)
const isSelectNewDates = ref(false)
const isLoading = ref(false)
const isConfirmation = ref(false)
const isConfirmationError = ref(false)
const isSafari = ref(false)

const firstDate = ref<Date>()
const secondDate = ref<Date>()
const thirdDate = ref<Date>()

const minDate = ref<Date>(
  (() => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date
  })()
)

const dayMap = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
}

const emit = defineEmits<{
  (e: 'fetchBookingRequests'): void
  (e: 'removeBooking', requestId: string, customerMessageId: string, uid: string): void
}>()

const isBtnDisabled = computed(() => !(firstDate.value && secondDate.value && thirdDate.value))

const disabledDays = computed(() => {
  if (!props.booking.selectedTimes?.length) return [0, 1, 2, 3, 4, 5, 6]

  return Object.entries(dayMap).reduce((acc: number[], [dayNum, dayName]) => {
    const daySchedule = props.booking.selectedTimes?.find(
      (schedule) => schedule.day.toLowerCase() === dayName
    )

    if (!daySchedule?.isOpen) acc.push(Number(dayNum))

    return acc
  }, [])
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE')
}

function showConfirmationBox(response: any) {
  if (response === 201) {
    isConfirmation.value = true

    setTimeout(() => {
      isConfirmation.value = false
      emit(
        'removeBooking',
        props.booking.requestId,
        props.booking.customerMessageId,
        props.booking.repairShopUid
      )
      emit('fetchBookingRequests')
    }, 4000)
  } else if (response === 500 || response === 400) {
    isConfirmationError.value = true

    setTimeout(() => {
      isConfirmationError.value = false
      emit('fetchBookingRequests')
    }, 4000)
  }
}

const handleChosenDate = async () => {
  isLoading.value = true

  const dateToSend = new Date(setChosenDateValue.value)

  const bookingData = {
    customerEmail: props.booking.customerEmail,
    uid: props.booking.repairShopUid,
    requestId: props.booking.requestId,
    acceptedDate: dateToSend.toISOString(),
    customerMessageId: props.booking.customerMessageId
  }

  try {
    const response = await sendNewAcceptedDatesToServer(bookingData)

    if (response === 201) {
      responseText.value = 'Bokning accepterad'
      showConfirmationBox(response)
    } else {
      throw new Error('Kunde ej spara')
    }
  } catch (error: any) {
    responseText.value = 'Kunde ej spara'
    showConfirmationBox(500)
  } finally {
    isLoading.value = false
  }
}

const handleSendNewDates = async () => {
  isLoading.value = true

  const data = {
    dateOne: firstDate.value || new Date(),
    dateTwo: secondDate.value || new Date(),
    dateThree: thirdDate.value || new Date(),
    customerMessageId: props.booking.customerMessageId,
    uid: props.booking.repairShopUid,
    requestId: props.booking.requestId,
    customerEmail: props.booking.customerEmail
  }

  try {
    const response = await updateSavedDates(data)
    if (response === 201) {
      responseText.value = 'Datum skickade'
      showConfirmationBox(response)
    } else {
      throw new Error('Kunde ej skicka datum')
    }
  } catch (error) {
    responseText.value = 'Kunde ej skicka datum'
    showConfirmationBox(500)
  } finally {
    isLoading.value = false
  }
}

const isDayDisabled = (dateString: string): boolean => {
  if (!dateString) return false

  const date = new Date(dateString)
  const dayOfWeek = date.getDay()

  const isDayOfWeekDisabled = disabledDays.value.includes(dayOfWeek)

  const today = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(today.getDate() + 7)

  const isWithinNextSevenDays = date <= sevenDaysFromNow

  return isDayOfWeekDisabled || isWithinNextSevenDays
}

const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const checkIfSafari = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  isSafari.value = userAgent.includes('safari') && !userAgent.includes('chrome')
}

const validateAndClearDisabledDates = () => {
  if (firstDate.value && isDayDisabled(formatDateForInput(firstDate.value))) {
    firstDate.value = undefined
  }

  if (secondDate.value && isDayDisabled(formatDateForInput(secondDate.value))) {
    secondDate.value = undefined
  }

  if (thirdDate.value && isDayDisabled(formatDateForInput(thirdDate.value))) {
    thirdDate.value = undefined
  }
}

const getDisabledDateClass = (dateString: string): string => {
  if (!dateString) return ''

  if (isDayDisabled(dateString)) {
    return 'text-gray-400 line-through opacity-50'
  }

  return ''
}

onMounted(async () => {
  checkIfSafari()
  if (isSafari.value) {
    validateAndClearDisabledDates()
  }
})
</script>

<template>
  <Teleport to="body">
    <div class="spinner-component" v-if="isLoading">
      <LoadingSpinner />
    </div>

    <ResponseDialog
      v-if="isConfirmation || isConfirmationError"
      :isConfirmationSuccess="isConfirmation"
      :text="responseText"
    />
  </Teleport>

  <section class="relative flex flex-col gap-2 pb-4">
    <div class="flex gap-2 items-center">
      <fontAwesome :icon="['fas', 'car-side']" class="text-sky-blue p-2 blue-100 rounded-lg" />

      <p class="text-third">{{ props.booking.registrationNumber }}</p>

      <p class="text-third absolute right-0">{{ props.booking.type }}</p>
    </div>

    <div class="gray-line"></div>

    <div class="flex items-start justify-between">
      <div class="flex flex-col">
        <strong class="text-lg">{{ props.booking.repairShopName }}</strong>
        <p class="text-third">
          <fontAwesome :icon="['fas', 'location-dot']" />
          {{ props.booking.repairShopAddress }}
        </p>
      </div>

      <p class="text-lg text-sky-blue">{{ props.booking.priceOffer }} kr</p>
    </div>

    <strong v-if="Object.keys(props.booking.customerMessage).length > 0"
      >Meddelande:
      <p>{{ props.booking.customerMessage }}</p></strong
    >

    <section class="flex flex-col gap-4 mt-4">
      <p>Förslag på datum fån verkstaden:</p>

      <div class="flex gap-4 items-center">
        <div class="flex flex-col gap-4 w-full">
          <input
            id="priceOffer"
            name="priceOffer"
            type="text"
            class="text-input-light px-2 w-full"
            :disabled="true"
            :value="formatDate(props.booking.suggestedDates.firstDate as string)"
          />

          <input
            id="priceOffer"
            name="priceOffer"
            type="text"
            class="text-input-light px-2 w-full"
            :disabled="true"
            :value="formatDate(props.booking.suggestedDates.secondDate as string)"
          />

          <input
            id="priceOffer"
            name="priceOffer"
            type="text"
            class="text-input-light px-2 w-full"
            :disabled="true"
            :value="formatDate(props.booking.suggestedDates.thirdDate as string)"
          />
        </div>
        <div class="flex flex-col h-[143px] justify-evenly gap-8">
          <button
            type="button"
            :class="[
              'w-5 h-5 border-main rounded-full',
              setChosenDateValue === props.booking.suggestedDates.firstDate && 'border-gr-success'
            ]"
            @click="
              (setChosenDateValue = props.booking.suggestedDates.firstDate),
                (isAcceptDateDisabled = false)
            "
          ></button>

          <button
            type="button"
            :class="[
              'w-5 h-5 border-main rounded-full',
              setChosenDateValue === props.booking.suggestedDates.secondDate && 'border-gr-success'
            ]"
            @click="
              (setChosenDateValue = props.booking.suggestedDates.secondDate),
                (isAcceptDateDisabled = false)
            "
          ></button>

          <button
            type="button"
            :class="[
              'w-5 h-5 border-main rounded-full',
              setChosenDateValue === props.booking.suggestedDates.thirdDate && 'border-gr-success'
            ]"
            @click="
              (setChosenDateValue = props.booking.suggestedDates.thirdDate),
                (isAcceptDateDisabled = false)
            "
          ></button>
        </div>
      </div>

      <button
        type="button"
        :class="[
          'mt-2 w-full rounded-lg',
          isAcceptDateDisabled ? 'main-btn-disabled' : 'main-btn '
        ]"
        @click="handleChosenDate"
        :disabled="isAcceptDateDisabled"
      >
        Acceptera valt datum
      </button>

      <button
        type="button"
        class="border-button mb-2 w-full rounded-lg"
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

      <!-- PrimeVue DatePicker for non-Safari browsers -->
      <template v-if="!isSafari">
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
            class="w-full border-main"
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
            class="w-full border-main"
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
            class="w-full border-main"
          />
        </label>
      </template>

      <!-- Native HTML5 Date Inputs for Safari -->
      <template v-else>
        <label class="flex flex-col gap-1 w-full">
          <p>Datum</p>
          <input
            type="date"
            v-model="firstDate"
            :min="formatDateForInput(minDate)"
            :class="[
              'w-full p-2 border rounded',
              getDisabledDateClass(formatDateForInput(firstDate))
            ]"
            @change="validateAndClearDisabledDates"
          />
        </label>

        <label class="flex flex-col gap-1 w-full">
          <p>Datum</p>
          <input
            type="date"
            v-model="secondDate"
            :min="formatDateForInput(minDate)"
            :class="[
              'w-full p-2 border rounded',
              getDisabledDateClass(formatDateForInput(firstDate))
            ]"
            @change="validateAndClearDisabledDates"
          />
        </label>

        <label class="flex flex-col gap-1 w-full">
          <p>Datum</p>
          <input
            type="date"
            v-model="thirdDate"
            :min="formatDateForInput(minDate)"
            :class="[
              'w-full p-2 border rounded',
              getDisabledDateClass(formatDateForInput(firstDate))
            ]"
            @change="validateAndClearDisabledDates"
          />
        </label>
      </template>

      <button
        type="button"
        :class="['mt-2 w-full text-secondary', isBtnDisabled ? 'main-btn-disabled ' : 'main-btn ']"
        @click="handleSendNewDates"
        :disabled="isBtnDisabled"
      >
        Skicka
      </button>
    </section>
  </section>
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
</style>
