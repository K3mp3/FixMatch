<script setup lang="ts">
import type { ITimeSlot } from '@/models/ITimeSlot'
import DatePicker from 'primevue/datepicker'
import { computed, onMounted, ref, type PropType } from 'vue'

const props = defineProps({
  openingHours: {
    type: Array as PropType<ITimeSlot[]>,
    required: true
  }
})

const firstDate = ref<Date>()
const secondDate = ref<Date>()
const thirdDate = ref<Date>()
const isSafari = ref(false)

const minDate = ref<Date>(
  (() => {
    const date = new Date()
    date.setDate(date.getDate() + 8)
    return date
  })()
)

const emits = defineEmits<{
  (e: 'selectedDates', dateOne: Date, dateTwo: Date, dateThree: Date): void
  (e: 'closeTimeBooking'): void
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
  if (!props.openingHours?.[0]) return [0, 1, 2, 3, 4, 5, 6]

  return Object.entries(dayMap).reduce((acc: number[], [dayNum, dayName]) => {
    const daySchedule = props.openingHours.find(
      (schedule) => schedule.day.toLowerCase() === dayName
    )
    if (!daySchedule?.isOpen) {
      acc.push(Number(dayNum))
    }
    return acc
  }, [])
})

const closeTimeBooking = () => {
  document.body.style.overflow = 'auto'
  emits('closeTimeBooking')
}

const emitSelectedDates = () => {
  if (firstDate.value && secondDate.value && thirdDate.value) {
    document.body.style.overflow = 'auto'
    emits('selectedDates', firstDate.value, secondDate.value, thirdDate.value)
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

onMounted(() => {
  document.body.style.overflow = 'hidden'

  checkIfSafari()
  if (isSafari.value) {
    validateAndClearDisabledDates()
  }
})
</script>

<template>
  <section
    class="fixed inset-0 z-50 bg-main overflow-hidden flex flex-col items-center justify-center"
  >
    <div
      class="max-w-[400px] w-full flex flex-col gap-6 p-4 sm:p-6 overflow-y-auto max-h-screen rounded-lg bg-sky-white drop-shadow-lg"
    >
      <button
        type="button"
        class="btn-back-light z-10"
        aria-label="Gå tillbaka"
        @click="closeTimeBooking"
      >
        <fontAwesome :icon="['fas', 'chevron-left']" />
      </button>

      <p>
        Välj tre tider som passar dig. Verkstaden bokar då in någon av dessa tider om det går.
        Annars svarar dom tillbaka med tre andra tider som förslag.
      </p>

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
          inputClass="custom-datepicker-input"
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
          inputClass="custom-datepicker-input"
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
          inputClass="custom-datepicker-input"
        />
      </label>

      <button type="button" class="main-btn mb-2 w-full" @click="emitSelectedDates">
        Skicka datum
      </button>
    </div>
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
  border: 1px solid rgb(215, 215, 215);
  border-radius: 8px;
  background-color: rgb(248, 248, 248);
  color: rgb(110, 110, 110);
  font-size: 1rem;
  transition: border-color 0.2s;
}

:deep(.p-inputtext:hover) {
  border-color: rgb(50, 71, 209);
}

:deep(.p-inputtext:focus) {
  border-color: rgb(50, 71, 209);
  border: 1px solid rgb(215, 215, 215);
}

:deep(.p-datepicker-trigger) {
  background-color: transparent;
  border: none;
  color: var(--colors-main, rgb(110, 110, 110));
}

:deep(.p-datepicker-trigger:hover) {
  color: rgb(50, 71, 209);
}

:deep(.p-datepicker-header) {
  border-bottom: 1px solid var(--colors-main, rgb(110, 110, 110));
}

:deep(.p-datepicker-header button) {
  color: var(--colors-third, #737373);
}

:deep(.p-datepicker-header button:hover) {
  color: rgb(50, 71, 209);
}

:deep(.p-datepicker-calendar .p-highlight) {
  background-color: rgb(50, 71, 209);
  color: rgb(248, 248, 248);
}

:deep(.p-datepicker-today > span) {
  border-color: rgb(50, 71, 209);
}

:deep(.p-datepicker-buttonbar) {
  border-top: 1px solid var(--colors-main, rgb(110, 110, 110));
}

:deep(.p-button) {
  background-color: rgb(50, 71, 209);
  border: none;
}

:deep(.p-button.p-button-outlined) {
  background-color: transparent;
  border: 1px solid rgb(50, 71, 209);
  color: rgb(50, 71, 209);
}
</style>
