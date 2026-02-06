<script setup lang="ts">
import type { IRepairShopAnswer } from '@/models/IRepairShopAnswer'
import type { IRepairShopUser } from '@/models/IRepairShopUser'
import { deleteJob } from '@/services/deleteJob'
import { computed, ref, type PropType } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConfirmDialog from '../dialogs/ConfirmDialog.vue'
import ResponseDialog from '../dialogs/ResponseDialog.vue'

const props = defineProps({
  request: {
    type: Object,
    required: true
  },
  customerMessage: {
    type: Object,
    required: true
  },
  repairShopAnswers: {
    type: Array as PropType<IRepairShopAnswer[]>,
    required: true
  },
  repairShops: {
    type: Object as PropType<IRepairShopUser[]>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'removeJob', requestId: string, customerMessageId: string): void
}>()

const isConfirmDialog = ref(false)
const isResponseDialog = ref(false)
const isResponseSuccess = ref(false)
const isLoading = ref(false)

const responseText = ref('')

const route = useRoute()
const router = useRouter()

const repairShopAnswersArray = ref<IRepairShopAnswer[]>([])

const currentDate = new Date()

const showOfferDetails = computed(() => {
  return route.query.id === props.customerMessage.id.toString()
})

const isDateValid = computed(() => {
  if (!props.request.validDate) return false
  const validDate = new Date(props.request.validDate)
  return currentDate > validDate
})

// Filter answers for the current customer message only
const filteredAnswers = computed(() => {
  return props.repairShopAnswers.filter(
    (answer) => answer.customerMessageId === props.customerMessage.id && answer.declined === false
  )
})

const matchingAnswers = computed(() => {
  return filteredAnswers.value.length > 0
})

const isRepairShopAnswersEmpty = computed(() => {
  return filteredAnswers.value.length === 0
})

// Fixed answer count to only count offers for this specific job
const answerCount = computed(() => {
  return filteredAnswers.value.length
})

const formattedCreatedDate = computed(() => {
  if (!props.request.validDate) return 'Okänt datum'

  const validDate = new Date(props.request.validDate)
  const createdDate = new Date(validDate)
  createdDate.setHours(createdDate.getHours() - 48)

  const year = createdDate.getFullYear()
  const month = String(createdDate.getMonth() + 1).padStart(2, '0')
  const day = String(createdDate.getDate()).padStart(2, '0')
  const hours = String(createdDate.getHours()).padStart(2, '0')
  const minutes = String(createdDate.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
})

// Initialize repair shop answers filtering for the current job only
repairShopAnswersArray.value = props.repairShopAnswers.filter(
  (answer: IRepairShopAnswer) =>
    answer.customerMessageId === props.customerMessage.id && answer.declined === false
) as IRepairShopAnswer[]

async function handleAnswer() {
  isLoading.value = true

  try {
    const requestData = {
      customerMessageId: props.customerMessage.id,
      requestId: props.request.id
    }

    const response = await deleteJob(requestData)

    isResponseDialog.value = true

    if (response !== 204) {
      isResponseSuccess.value = true
      responseText.value = 'Radering misslyckades'
    }
  } catch (error) {
    isResponseDialog.value = true
    isResponseSuccess.value = false
    responseText.value = 'Radering misslyckades'
  } finally {
    isLoading.value = false

    emit('removeJob', props.request.id, props.customerMessage.id)

    setTimeout(() => {
      isResponseDialog.value = false
    }, 4000)
  }
}

function handleDelete() {
  isConfirmDialog.value = false

  handleAnswer()
}
</script>

<template>
  <ConfirmDialog
    v-if="isConfirmDialog"
    :type="'warning'"
    :icon="['fas', 'triangle-exclamation']"
    :message="'Är du säker på att du vill radera uppdraget? Det kommer inte gå att återställa!'"
    :acceptText="'Avbryt'"
    :cancelText="'Radera'"
    @confirm="isConfirmDialog = false"
    @cancel="handleDelete"
  />

  <ResponseDialog
    v-if="isResponseDialog"
    :isConfirmationSuccess="isResponseSuccess"
    :text="responseText"
  />

  <section class="relative flex flex-col gap-2">
    <div class="flex gap-2 items-center">
      <fontAwesome :icon="['fas', 'car-side']" class="text-sky-blue p-2 blue-100 rounded-lg" />

      <p class="text-third">{{ props.request.registrationNumber }}</p>

      <div
        v-if="new Date() > new Date(props.request.validDate) && isRepairShopAnswersEmpty"
        class="absolute right-0 rounded-full py-1 px-4 gray-100 text-third"
      >
        Inga offerter tillgängliga
      </div>

      <div
        v-else-if="isRepairShopAnswersEmpty || !isDateValid || !matchingAnswers"
        class="absolute right-0 rounded-full py-1 px-4 gray-100 text-third"
      >
        Inväntar offerter
      </div>

      <div v-else class="absolute right-0 rounded-full py-1 px-4 green-100 text-sky-green">
        Offerter tillgängliga
      </div>
    </div>

    <div>
      <strong>Typ av jobb</strong>
      <p class="text-third">
        {{ props.customerMessage.work ? props.customerMessage.work : props.customerMessage.type }}
      </p>
    </div>

    <div class="flex gap-2 items-center text-third">
      <fontAwesome :icon="['fas', 'clock']" />
      Skapad: {{ formattedCreatedDate }}
    </div>

    <p class="flex gap-2 items-center rounded-lg blue-100 text-sky-blue py-1 px-2">
      {{ answerCount }} {{ answerCount < 2 ? 'offert tillgänglig' : 'offerter tillgängliga' }}
    </p>

    <div class="gray-line"></div>

    <div class="flex justify-between m-auto w-full max-w-[350px] mt-1">
      <button
        type="button"
        class="text-third"
        aria-label="Radera förfrågan"
        @click="isConfirmDialog = true"
      >
        <fontAwesome :icon="['fas', 'trash']" /> Ta bort
      </button>

      <RouterLink
        v-if="!isRepairShopAnswersEmpty && isDateValid && matchingAnswers"
        :to="`/job:id=${props.customerMessage.id}`"
        type="button"
        :class="[
          '  flex items-center justify-center',
          answerCount <= 0 || !isDateValid || !matchingAnswers ? 'text-third' : 'text-sky-blue'
        ]"
      >
        Se offerter <fontAwesome :icon="['fas', 'chevron-right']" />
      </RouterLink>

      <button type="button" class="text-third" v-else disabled>
        Se offerter <fontAwesome :icon="['fas', 'chevron-right']" />
      </button>
    </div>
  </section>
</template>
