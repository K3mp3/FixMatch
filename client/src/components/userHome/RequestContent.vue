<script setup lang="ts">
import type { IRepairShopAnswer } from '@/models/IRepairShopAnswer'
import { answerFromRepairShop } from '@/services/userContact'
import DatePicker from 'primevue/datepicker'
import { nextTick, onMounted, ref, watch, type Ref } from 'vue'
import ConfirmDialog from '../dialogs/ConfirmDialog.vue'
import TextInput from '../utils/TextInput.vue'

interface UserData {
  email: string
  uid: string
  name: string
  phoneNumber: string
  address: string
  postalCode: string
  location: string
}

const props = defineProps({
  customerMessage: {
    type: Object,
    required: true
  },
  message: {
    type: Object,
    required: true
  },
  userData: {
    type: Object as () => UserData | null,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'messageData', messageData: IRepairShopAnswer | FormData): void
}>()

const setButtonValue = ref('')
const priceOption = ref(0)
const workTime = ref(0)

const isConfirmDialog = ref(false)
const showPriceNotValid = ref(false)
const showWorkTimeNotValid = ref(false)
const showFileSizeError = ref(false)
const showFileTypeError = ref(false)

const isBtnDisabled = ref(true)
const isPriceValid = ref(true)
const isWorkTimeValid = ref(true)

const offerPdf = ref<File | null>(null)
const validOfferDate = ref<Date>()

const MAX_FILE_SIZE = 1024 * 1024

const inputsArray: { key: string | number; value: boolean }[] = [
  { key: 'isPriceOffer', value: false },
  { key: 'isWorkTime', value: false }
]

const minDate = ref<Date>(
  (() => {
    const date = new Date()
    date.setDate(date.getDate() + 5)
    return date
  })()
)

function checkInputData() {
  isBtnDisabled.value =
    !inputsArray.every((field) => field.value) ||
    !(
      isPriceValid.value &&
      isWorkTimeValid.value &&
      setButtonValue.value !== '' &&
      offerPdf.value !== null
    )
}

const checkInputsData = (confirmKey: string | number) => {
  nextTick(() => {
    let refVariable: Ref<string | number> | null = null
    switch (confirmKey) {
      case 'isPriceOffer':
        {
          isPriceValid.value = /^[0-9]+$/.test(priceOption.value as unknown as string)
        }
        refVariable = priceOption
        break
      case 'isWorkTime':
        {
          isWorkTimeValid.value = /^(?!0\.?0*$)\d+(\.\d{1,2})?$/.test(
            workTime.value as unknown as string
          )
        }
        refVariable = workTime
        break
    }

    if (refVariable?.value === '') {
      const index = inputsArray.findIndex((field) => field.key === confirmKey)

      if (index !== -1) inputsArray[index].value = false
      else inputsArray.push({ key: confirmKey, value: false })

      checkInputData()
      return
    } else {
      const index = inputsArray.findIndex((field) => field.key === confirmKey)

      if (index !== -1) inputsArray[index].value = true
      else inputsArray.push({ key: confirmKey, value: true })

      checkInputData()
    }
  })
}

const validateInput = (confirmKey: string | number) => {
  switch (confirmKey) {
    case 'isPriceOffer':
      {
        showPriceNotValid.value = !/^[0-9]+$/.test(priceOption.value as unknown as string)
      }
      break
    case 'isWorkTime':
      {
        showWorkTimeNotValid.value = !/^(?!0\.?0*$)\d+(\.\d{1,2})?$/.test(
          workTime.value as unknown as string
        )
      }
      break
  }

  checkInputData()
}

const handleDelete = () => {
  isConfirmDialog.value = false

  handleAnswer(true)
}

async function handleAnswer(isDeclined: boolean) {
  if (!isDeclined && !offerPdf.value) {
    console.error('PDF offer is required for non-declined submissions')
    return
  }

  let pdfData = null
  if (offerPdf.value) {
    try {
      const buffer = await offerPdf.value.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      pdfData = {
        name: offerPdf.value.name,
        type: offerPdf.value.type,
        data: base64
      }
    } catch (error) {
      console.error('Error processing PDF file')
      return
    }
  }

  const messageData = {
    id: props.message.id,
    address: props.userData?.address || 'unknown',
    postalCode: props.userData?.postalCode || '',
    location: props.userData?.location || '',
    type: props.customerMessage.type || 'Unknown',
    work: props.customerMessage.work || 'None',
    registrationNumber: props.message.registrationNumber,
    uuid: props.userData?.uid || '',
    customerMessageId: props.customerMessage.id,
    repairShopName: props.userData?.name,
    repairShopEmail: props.userData?.email,
    repairShopPhoneNumber: props.userData?.phoneNumber,
    priceOffer: isDeclined ? 0 : priceOption.value || 0,
    typeOfFix: isDeclined ? 'Declined' : setButtonValue.value || 'None',
    declined: isDeclined,
    workTime: workTime.value,
    validDate: new Date(),
    validOfferDate: validOfferDate.value
  }

  if (!props.userData?.uid || !props.userData?.email) {
    console.error('User data is missing required fields')
    return
  }

  if (offerPdf.value && !isDeclined) {
    try {
      const formData = new FormData()

      formData.append('pdfFile', offerPdf.value)
      formData.append('messageData', JSON.stringify(messageData))

      emit('messageData', formData)
    } catch (error) {
      console.log('error')
    }
  }

  if (isDeclined === true) {
    const wrappedData = { [messageData.id]: messageData }
    await answerFromRepairShop(wrappedData as unknown as IRepairShopAnswer)
  }
}

const formatMileage = (value: string | number): string => {
  if (!props.customerMessage.mileage) return ''

  const stringValue = value.toString()
  const cleanValue = stringValue.replace(/\s/g, '')

  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  showFileSizeError.value = false

  if (input.files && input.files.length > 0) {
    const file = input.files[0]

    if (file.type !== 'application/pdf') {
      showFileTypeError.value = true
      input.value = ''
      offerPdf.value = null
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      showFileSizeError.value = true
      input.value = '' // Clear the file input
      offerPdf.value = null
      return
    }

    showFileTypeError.value = false
    offerPdf.value = input.files[0]
  } else {
    offerPdf.value = null
  }
}

watch([priceOption, setButtonValue, workTime, offerPdf], () => {
  checkInputData()
})

onMounted(() => {
  priceOption.value = 0
  setButtonValue.value = ''
  checkInputData()
})
</script>

<template>
  <ConfirmDialog
    v-if="isConfirmDialog"
    :type="'warning'"
    :icon="['fas', 'triangle-exclamation']"
    :message="'Är du säker på att du vill radera förfrågan? Den kommer inte gå att återställa!'"
    :acceptText="'Avbryt'"
    :cancelText="'Radera'"
    @confirm="isConfirmDialog = false"
    @cancel="handleDelete"
  />

  <form class="relative flex flex-col gap-2">
    <div class="flex gap-2 items-center">
      <fontAwesome :icon="['fas', 'car-side']" class="text-sky-blue p-2 blue-100 rounded-lg" />

      <p class="text-third">{{ props.message.registrationNumber }}</p>
    </div>

    <div class="gray-line"></div>

    <button
      type="button"
      class="absolute right-0 p-2 mr-[-8px] mt-[-9px] text-main"
      @click="() => (isConfirmDialog = true)"
      aria-label="Radera förfrågan"
    >
      <fontAwesome :icon="['fas', 'trash']" />
    </button>

    <div>
      <strong>Typ av jobb</strong>
      <p class="text-third">
        {{ props.customerMessage.work ? props.customerMessage.work : props.customerMessage.type }}
      </p>
    </div>

    <div v-if="props.customerMessage.message !== ''">
      <strong>Meddelande från kund</strong>
      <p class="text-third">{{ props.customerMessage.message }}</p>
    </div>

    <div v-if="props.customerMessage.mileage !== 0">
      <strong>Mätarställning</strong>
      <p class="text-third">{{ props.customerMessage.mileage }} mil</p>
    </div>

    <p class="flex flex-col">
      <strong class="font-title-bold">Växellåda: </strong
      >{{ props.message.gearType === 'auto' ? 'Automat' : 'Manuell' }}
    </p>

    <label class="flex flex-col gap-1">
      <span>Prisförslag (utan kr)</span>
      <TextInput
        :checkInputData="(value: number) => checkInputsData(value)"
        :inputData="(e: number) => (priceOption = e)"
        :inputType="'number'"
        :inputName="'isPriceOffer'"
        :isDataCorrect="isPriceValid"
        @blur="validateInput('isPriceOffer')"
        placeholder="Prisförslag (utan kr)"
        min="0"
      />

      <p
        class="text-warning-orange font-text-light flex gap-2 items-center mt-1"
        v-if="showPriceNotValid"
      >
        <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />Ange pris
        i endast siffror!
      </p>
    </label>

    <label class="flex flex-col gap-1 mt-1">
      <span>Arbetstid i timmar</span>
      <TextInput
        :checkInputData="(value: string) => checkInputsData(value)"
        :inputData="(e: number) => (workTime = e)"
        :inputType="'text'"
        :inputName="'isWorkTime'"
        :isDataCorrect="!isWorkTimeValid"
        @blur="validateInput('isWorkTime')"
        placeholder="Arbetstid i timmar"
      />

      <p
        v-if="showWorkTimeNotValid"
        class="text-warning-orange font-text-light flex gap-2 items-center mt-1"
      >
        <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />
        Lägsta tillåtna värde är 0.01!
      </p>
    </label>

    <label class="flex flex-col gap-1 w-full mt-1">
      <p>Ange till vilket datum offerten är giltig</p>
      <DatePicker
        v-model="validOfferDate"
        dateFormat="yy/mm/dd"
        showButtonBar
        hourFormat="24"
        :numberOfMonths="1"
        :minDate="minDate"
        placeholder="Välj ett datum"
        inputClass="custom-datepicker-input"
        class="w-full border-main"
      />
    </label>

    <span class="flex gap-2 mt-2">
      <input
        type="radio"
        :checked="setButtonValue === 'Felsökning'"
        @click="setButtonValue = 'Felsökning'"
      />
      <p>Felsökning (gäller en timme)</p></span
    >
    <span class="flex gap-2">
      <input
        type="radio"
        :checked="setButtonValue === 'Reparation'"
        @click="setButtonValue = 'Reparation'"
      />
      <p>Reparation</p></span
    >

    <label class="flex flex-col gap-1">
      <span>Offert som PDF</span>
      <input type="file" accept="application/pdf,.pdf" @change="handleFileUpload" ref="fileInput" />

      <p
        v-if="showFileSizeError"
        class="text-warning-orange font-text-light flex gap-2 items-center"
      >
        <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />
        Filen är för stor. Maximal filstorlek är 1 MB.
      </p>

      <p
        v-if="showFileTypeError"
        class="text-warning-orange font-text-light flex gap-2 items-center"
      >
        <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />
        Endast PDF-filer är tillåtna.
      </p>
    </label>

    <button
      type="button"
      :disabled="isBtnDisabled"
      :class="['text-center px-6 mt-4', isBtnDisabled ? 'main-btn-disabled' : 'main-btn']"
      @click="() => handleAnswer(false)"
    >
      <p
        :class="[
          'flex items-center gap-2 justify-center',
          isBtnDisabled ? 'text-third' : 'text-secondary'
        ]"
      >
        Skicka <fontAwesome :icon="['fas', 'paper-plane']" />
      </p>
    </button>
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
</style>
