<script setup lang="ts">
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import type { IBookingMessage } from '@/models/IBookingResponse'
import { cancelBookingForRepairShop } from '@/services/timeBooking'
import { computed, ref, type PropType } from 'vue'

type BookingWithId = IBookingMessage & { id: string }

const props = defineProps({
  booking: {
    type: Object as PropType<BookingWithId>,
    required: true
  },
  email: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'updateBookings', id: string): void
}>()

const isConfirmDialog = ref(false)
const isShowMore = ref(false)

const message = ref('')

const isBtnDisabled = computed(() => message.value.trim() === '')

const isUpcomingBooking = computed(() => {
  if (!props.booking.saveAcceptedDate?.acceptedDate) return false

  const bookingDate = new Date(props.booking.saveAcceptedDate.acceptedDate)
  const currentDate = new Date()

  return bookingDate > currentDate
})

const isCurrentBooking = computed(() => {
  if (!props.booking.saveAcceptedDate?.acceptedDate) return false

  const bookingDate = new Date(props.booking.saveAcceptedDate.acceptedDate)
  const currentDate = new Date()

  return bookingDate === currentDate
})

const formatAcceptedDate = (acceptedDate: string) => {
  if (acceptedDate !== '' || null) {
    const date = new Date(acceptedDate)
    return new Intl.DateTimeFormat('sv-SE').format(date)
  } else {
    return 'Datum hittades ej'
  }
}

const handleCancelBooking = async () => {
  const user = {
    customerEmail: props.booking.customerEmail,
    customerMessageId: props.booking.customerMessageId,
    requestId: props.booking.requestId,
    repairShopUid: props.booking.repairShopUid,
    reason: message.value
  }

  try {
    await cancelBookingForRepairShop(user)
  } catch (error) {
    console.log('error')
  } finally {
    emit('updateBookings', props.booking.id)
  }
}
</script>

<template>
  <ConfirmDialog
    v-if="isConfirmDialog"
    :type="'warning'"
    :icon="['fas', 'triangle-exclamation']"
    :headline="'Är du säker på att du vill avboka bokningen?'"
    :message="'Kunden måste då boka in en ny tid!'"
    :acceptText="'Avbryt'"
    :cancelText="'Avboka'"
    @confirm="isConfirmDialog = !isConfirmDialog"
    @cancel="handleCancelBooking"
  />

  <section class="flex flex-col gap-2">
    <div class="flex gap-2 items-center">
      <fontAwesome :icon="['fas', 'car-side']" class="text-sky-blue p-2 blue-100 rounded-lg" />

      <p class="text-third">{{ props.booking.registrationNumber }}</p>

      <p
        v-if="isUpcomingBooking && !booking.declined"
        class="text-sky-green py-1 px-3 text-sm rounded-full green-100 absolute right-0 mr-4"
      >
        Kommande
      </p>

      <p
        v-if="booking.declined"
        class="text-error-red-full py-1 px-3 text-sm rounded-full red-100 absolute right-0 mr-4"
      >
        Avbokad
      </p>

      <p
        v-if="isCurrentBooking && !booking.declined"
        class="text-sky-yellow py-1 px-3 text-sm rounded-full yellow-100 absolute right-0 mr-4"
      >
        Pågående
      </p>
    </div>

    <div class="gray-line"></div>

    <div
      class="flex flex-col sm:flex-row justify-center items-between sm:items-center sm:justify-between"
    >
      <strong class="text-lg">{{ props.booking.priceOffer }} kr</strong>

      <p class="text-third">
        <strong>Datum:</strong>
        {{ formatAcceptedDate(props.booking.saveAcceptedDate?.acceptedDate || '') }}
      </p>

      <button
        type="button"
        class="flex items-center justify-center gap-2 w-28 text-main absolute right-0 sm:static"
        @click="isShowMore = !isShowMore"
      >
        <fontAwesome :icon="['fas', 'arrow-down']" />
        Se mer
      </button>
    </div>

    <div class="relative flex flex-col gap-4" v-if="isShowMore">
      <div class="">
        <strong>Typ av jobb</strong>
        <p>{{ props.booking.work }}</p>
      </div>

      <strong
        >Kontakta kund:
        <p>{{ props.booking.customerEmail }}</p></strong
      >

      <label for="isName" class="font-text-light flex flex-col gap-1"
        ><span>Skäl till avbokning</span>
        <TextArea
          :inputData="(e: string) => (message = e)"
          :inputName="'isMessage'"
          placeholder="Ange skäl till varför ni avbokar"
          class="h-32 textarea-input-light"
        ></TextArea>
      </label>

      <button
        type="button"
        :class="[
          'text-secondary',
          booking.declined || isBtnDisabled ? 'main-btn-disabled' : 'secondary-btn'
        ]"
        @click="isConfirmDialog = !isConfirmDialog"
        :disabled="booking.declined || isBtnDisabled"
      >
        <p>Avboka bokning</p>
      </button>
    </div>
  </section>
</template>
