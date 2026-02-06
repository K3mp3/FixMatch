<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import SelectButton from './SelectButton.vue'

const props = defineProps<{
  selectedWorkType: string
  selectedWork: [string[], string, string, string, number][]
}>()

const emptyValues = ref(false)
const isBtnDisabled = ref(true)
const showMileageError = ref(false)

const textInput = ref('')
const mileageInput = ref('')
const selectedTypes = ref('')
const selectedBrakes = ref('all')

const selectedOptions = ref<string[]>([])
const selectedKeys = ref<string[]>([])

const emits = defineEmits<{
  (
    e: 'selectedWorkTypeArray',
    values: string[],
    textInput: string,
    mileage: number,
    workType: string,
    selectedBrakes: string,
    key: string[]
  ): void
}>()

const Ac: { key: string; value: string }[] = [
  { key: 'radio', value: 'AC-Service' },
  { key: 'radio', value: 'AC-Service + rengöring' }
]

const Exhaust: { key: string; value: string }[] = [
  { key: 'checkBox', value: 'Byte av partikelfilter' },
  { key: 'checkBox', value: 'Eftermontering av partikelfilter' },
  { key: 'checkBox', value: 'Byte av katalysator' },
  { key: 'checkBox', value: 'Byte av ljuddämpare' },
  { key: 'checkBox', value: 'Byte av lambdasond' }
]

const Battery: { key: string; value: string }[] = [{ key: 'radio', value: 'Byte av batteri' }]

const Inspection: { key: string; value: string }[] = [
  { key: 'radio', value: 'Kontroll inför besiktning' }
]

const detailing: { key: string; value: string }[] = [
  { key: 'checkBox', value: 'Invänding rengöring' },
  { key: 'checkBox', value: 'Utvändig rengöring' }
]

const brakes: { key: string; value: string }[] = [
  { key: 'radio', value: 'Nya skivor och klossar' },
  { key: 'radio', value: 'Byte av bromsklossar' },
  { key: 'radio', value: 'Andra bromsuppgifter' }
]

const wheelAlignment: { key: string; value: string }[] = [
  { key: 'radio', value: 'Hjulinställning' }
]

const options = computed(() => {
  switch (selectedTypes.value) {
    case 'AC':
      return Ac
    case 'Avgaser':
      return Exhaust
    case 'Batteri':
      return Battery
    case 'Besiktning och förkontroll':
      return Inspection
    case 'Bilvård':
      return detailing
    case 'Bromsar':
      return brakes
    case 'Hjulinställning':
      return wheelAlignment
    default:
      return []
  }
})

const formatMileage = (value: string) => {
  const digitsOnly = value.replace(/\s/g, '')

  if (digitsOnly.length > 6) {
    return mileageInput.value
  }

  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const handleMileageInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const cursorPosition = input.selectionStart
  const previousLength = mileageInput.value.length

  const formatted = formatMileage(input.value)
  mileageInput.value = formatted

  nextTick(() => {
    const newPosition = cursorPosition
      ? cursorPosition + (formatted.length - previousLength)
      : formatted.length
    input.setSelectionRange(newPosition, newPosition)
  })

  validateMileage()
  validateInputs()
}

const validateMileage = () => {
  const isValidFormat = /^[\d\s]*$/.test(mileageInput.value)

  const numericValue = parseInt(mileageInput.value.replace(/\s/g, ''))

  showMileageError.value =
    !isValidFormat || isNaN(numericValue) || numericValue > 110000 || numericValue < 1

  return !showMileageError.value
}

const validateInputs = () => {
  if (selectedTypes.value === 'Service') {
    const hasValidMileage = validateMileage() && mileageInput.value.trim() !== ''
    isBtnDisabled.value = !hasValidMileage
  } else {
    isBtnDisabled.value = !(selectedOptions.value.length > 0 || textInput.value.trim() !== '')
  }
}

function handleSelectedOption(option?: string[]) {
  if (option) {
    selectedOptions.value = option
  }
  validateInputs()
}

function handleAddOptions() {
  const numericMileage =
    selectedTypes.value === 'Service' ? parseInt(mileageInput.value.replace(/\s/g, '')) : 0

  emits(
    'selectedWorkTypeArray',
    selectedOptions.value,
    textInput.value,
    numericMileage,
    props.selectedWorkType,
    selectedBrakes.value,
    selectedKeys.value
  )
  emptyValues.value = true
  selectedOptions.value = []
  selectedTypes.value = ''
  mileageInput.value = ''
}

function resetComponent() {
  selectedOptions.value = []
  selectedKeys.value = []
  emptyValues.value = false
  isBtnDisabled.value = true
  textInput.value = ''
  mileageInput.value = ''
  selectedTypes.value = props.selectedWorkType
}

watch(
  () => props.selectedWorkType,
  () => {
    resetComponent()
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-col gap-4 mb-2">
    <SelectButton
      :options="options"
      :setSelectedOption="(e) => handleSelectedOption(e)"
      :emptyValues="emptyValues"
      :selectedWork="selectedWork"
      :setSelectedKey="(e) => (selectedKeys = e)"
    />

    <label
      v-if="selectedTypes === 'Service'"
      for="mileage-input"
      class="font-text-light flex flex-col gap-1 text-main"
    >
      <span>Mätarställning (mil)</span>
      <input
        type="text"
        name="mileage-input"
        class="text-input-light p-2 text-sm w-full"
        placeholder="Ange mätarställning i mil"
        v-model="mileageInput"
        @input="handleMileageInput"
      />

      <p
        class="text-warning-orange font-text-light flex gap-2 items-center"
        v-if="showMileageError && mileageInput"
      >
        <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />
        Ange ett giltigt värde mellan 1 och 110 000 mil!
      </p>
    </label>

    <label
      v-if="selectedTypes === 'Bromsar'"
      for="brake-select"
      class="font-text-light flex flex-col gap-1 text-main"
    >
      <span>Vilka bromsar</span>
      <select v-model="selectedBrakes" class="w-full select-light" id="brake-select">
        <option value="all" selected>Alla fyra bromsar</option>
        <option value="front">Främre</option>
        <option value="back">Bak</option>
        <option value="front-left">Vänster fram</option>
        <option value="front-right">Höger fram</option>
        <option value="back-left">Vänster bak</option>
        <option value="back-right">Höger bak</option>
      </select>
    </label>

    <label for="message-input" class="font-text-light flex flex-col gap-1"
      ><span>Meddelande</span>
      <textarea
        name="message-input"
        class="textarea-input-light h-40 text-sm"
        placeholder="Beskriv själv"
        v-model="textInput"
        @input="handleSelectedOption()"
      ></textarea>
    </label>

    <button
      type="submit"
      :disabled="isBtnDisabled"
      :class="[
        isBtnDisabled ? 'main-btn-disabled text-sm mt-6 text-secondary' : 'main-btn text-sm mt-6'
      ]"
      @click="handleAddOptions"
    >
      Lägg till arbeten
    </button>
  </div>
</template>
