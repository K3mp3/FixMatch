<script setup lang="ts">
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import MapBoxGlobe from '@/components/utils/MapBoxGlobe.vue'
import type { IBookingMessage } from '@/models/IBookingResponse'
import { cancelBooking } from '@/services/timeBooking'
import { computed, ref, type PropType } from 'vue'

type ExtendedIBookingMessage = IBookingMessage & {
  id: string
  repairShopName: string
  address: string
  location: string
  postalCode: string
  phoneNumber: string
}

const props = defineProps({
  booking: {
    type: Object as PropType<ExtendedIBookingMessage>,
    required: true
  },
  email: {
    type: String,
    required: true
  }
})

const isMap = ref(false)

const emit = defineEmits<{
  (e: 'updateBookings', id: string): void
}>()

const isConfirmDialog = ref(false)

const isWithin24Hours = computed(() => {
  if (!props.booking.saveAcceptedDate?.acceptedDate) return false

  // Calculate time difference in hours
  const timeDifference =
    new Date(props.booking.saveAcceptedDate.acceptedDate).getTime() - new Date().getTime()
  const hoursDifference = timeDifference / (1000 * 60 * 60)

  return hoursDifference <= 24
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
    email: props.email,
    customerMessageId: props.booking.customerMessageId,
    requestId: props.booking.requestId,
    repairShopUid: props.booking.repairShopUid
  }

  try {
    await cancelBooking(user)
  } catch (error) {
    console.log('An unknown error occured')
  } finally {
    emit('updateBookings', props.booking.id)
    isConfirmDialog.value = !isConfirmDialog.value
  }
}
</script>

<template>
  <ConfirmDialog
    v-if="isConfirmDialog"
    :type="'warning'"
    :icon="['fas', 'triangle-exclamation']"
    :headline="'Är du säker på att du vill avboka bokningen?'"
    :message="'Om du ångrar dig måste du skapa ett nytt  uppdrag'"
    :acceptText="'Avbryt'"
    :cancelText="'Avboka'"
    @confirm="isConfirmDialog = !isConfirmDialog"
    @cancel="handleCancelBooking"
  />

  <section class="relative flex flex-col gap-4">
    <div class="">
      <h2>{{ props.booking.type }}</h2>
      <p>{{ props.booking.work }}</p>
    </div>

    <div class="sm:flex sm:gap-2">
      <strong>Accepterat datum av verkstad:</strong>
      <p class="text-sky-green">
        {{ formatAcceptedDate(props.booking.saveAcceptedDate?.acceptedDate || '') }}
      </p>
    </div>

    <div class="sm:flex sm:gap-2">
      <strong>Verkstad:</strong>
      <p>
        {{ props.booking.repairShopName || '' }}
      </p>
    </div>

    <div>
      <strong>Var?</strong>
      <p>Adress: {{ props.booking.address || '' }}</p>
      <p>Kommun: {{ props.booking.location || '' }}</p>
      <p>Telefonnummer: {{ props.booking.phoneNumber || '' }}</p>
    </div>

    <button @click="isMap = !isMap" type="button">Visa karta</button>

    <button
      type="button"
      :class="['text-secondary', isWithin24Hours ? 'main-btn-disabled' : 'secondary-btn ']"
      @click="isConfirmDialog = !isConfirmDialog"
      :disabled="isWithin24Hours"
    >
      <p>Avboka bokning</p>
    </button>

    <MapBoxGlobe
      v-if="props.booking.address && isMap"
      :address="props.booking.address"
      :postalCode="props.booking.postalCode"
      :location="props.booking.location"
    />
  </section>
</template>
