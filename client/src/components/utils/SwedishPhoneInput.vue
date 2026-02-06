<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  checkInputData: {
    type: Function,
    required: true
  },
  inputData: {
    type: Function,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '08-123 45 67 / 08-123 456 78 / 060-123 45 67'
  },
  label: {
    type: String,
    default: 'Telefonnummer'
  },
  inputName: {
    type: String,
    default: 'phoneNumber'
  }
})

const phoneNumber = ref(props.modelValue || '')
const isPhoneNumberValid = ref(true)
const showWrongPhoneNumber = ref(false)
const inputRef = ref<HTMLInputElement>()

const threeDigitAreaCodes = [
  '010',
  '011',
  '013',
  '016',
  '018',
  '019',
  '021',
  '023',
  '026',
  '031',
  '033',
  '035',
  '036',
  '040',
  '042',
  '044',
  '046',
  '054',
  '060',
  '063',
  '090'
]

function formatPhoneNumberValue(value: string): string {
  const digits = value.replace(/[^\d]/g, '')

  if (!digits.startsWith('0') || digits.length === 0) {
    return digits
  }

  const length = digits.length

  // Stockholm format: 08-xx xx xx (7-8 digits), 08-xxx xxx x (9 digits), 08-xxx xxx xx (10 digits)
  if (digits.startsWith('08')) {
    if (length <= 2) return digits
    if (length === 3) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    if (length === 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    if (length === 5) return `${digits.slice(0, 2)}-${digits.slice(2, 4)} ${digits.slice(4)}`
    if (length === 6) return `${digits.slice(0, 2)}-${digits.slice(2, 4)} ${digits.slice(4)}`
    if (length === 7)
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
    if (length === 8)
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
    if (length === 9)
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
    if (length === 10)
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`

    return digits
  }

  // NEW: Mobile format: 07x-xxx xx xx (10 digits)
  if (digits.length === 10 && digits.startsWith('07')) {
    if (length <= 3) return digits
    if (length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    if (length <= 8) return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6)}`

    // Final format: 07x-xxx xx xx
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
  }

  // 3-digit area code format: 0xx-xxx xx xx (10 digits only)
  if (
    digits.length >= 3 &&
    digits.length === 10 &&
    !digits.startsWith('07') &&
    threeDigitAreaCodes.includes(digits.slice(0, 3))
  ) {
    if (length <= 3) return digits
    if (length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    if (length <= 8) return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6)}`

    // Final format: 0xx-xxx xx xx
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
  }

  // NEW: 2-digit area code format: 0xx-xxx xx (8 digits)
  if (digits.length === 8 && !digits.startsWith('08') && !digits.startsWith('07')) {
    if (length <= 3) return digits
    if (length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`

    // Final format: 0xx-xxx xx
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6, 8)}`
  }

  // 4-digit area code format: 0xxx-xx xx xx (10 digits) or 0xxx-xxx xx (9 digits)
  if (
    digits.length >= 4 &&
    !digits.startsWith('08') &&
    !digits.startsWith('07') &&
    !threeDigitAreaCodes.includes(digits.slice(0, 3))
  ) {
    // 10 digits: 0xxx-xx xx xx
    if (digits.length === 10) {
      if (length <= 4) return digits
      if (length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`
      if (length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)} ${digits.slice(6)}`
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
    }
    // 9 digits: 0xxx-xxx xx
    else if (digits.length === 9) {
      if (length <= 4) return digits
      if (length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`
      return `${digits.slice(0, 4)}-${digits.slice(4, 7)} ${digits.slice(7, 9)}`
    }
  }

  // 2-digit area code format: 0xx-xx xx xx (9 digits) - fallback for any remaining 9-digit numbers
  if (digits.length === 9 && !digits.startsWith('08') && !digits.startsWith('07')) {
    if (length <= 3) return digits
    if (length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    if (length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3, 5)} ${digits.slice(5)}`

    // Final format: 0xx-xx xx xx
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  return digits
}

function validatePhoneNumber(value: string): boolean {
  const digits = value.replace(/[^\d]/g, '')

  if (!digits.startsWith('0') || digits.length < 7) {
    return false
  }

  // Stockholm format: 08-xx xx xx (7 digits), 08-xxx xx xx (8 digits), 08-xxx xxx x (9 digits), 08-xxx xxx xx (10 digits)
  if (digits.startsWith('08')) {
    return digits.length === 7 || digits.length === 8 || digits.length === 9 || digits.length === 10
  }

  // NEW: Mobile format: 07x-xxx xx xx (10 digits)
  if (digits.length === 10 && digits.startsWith('07')) {
    return true
  }

  // NEW: 2-digit area code format: 0xx-xxx xx (8 digits)
  if (digits.length === 8 && !digits.startsWith('08') && !digits.startsWith('07')) {
    return true
  }

  // 3-digit area code format: 0xx-xxx xx xx (10 digits only)
  if (
    digits.length === 10 &&
    !digits.startsWith('07') &&
    threeDigitAreaCodes.includes(digits.slice(0, 3))
  ) {
    return true
  }

  // 4-digit area code format: 0xxx-xx xx xx (10 digits) or 0xxx-xxx xx (9 digits)
  if (
    digits.length >= 4 &&
    !digits.startsWith('08') &&
    !digits.startsWith('07') &&
    !threeDigitAreaCodes.includes(digits.slice(0, 3))
  ) {
    return digits.length === 9 || digits.length === 10
  }

  // 2-digit area code format: 0xx-xx xx xx (9 digits) - fallback for remaining 9-digit numbers
  if (digits.length === 9 && !digits.startsWith('08') && !digits.startsWith('07')) {
    return true
  }

  // 4-digit area code format: 0xxx-xx xx xx (10 digits) - fallback for remaining 10-digit numbers
  return digits.length === 10
}

function controlPhoneNumber(value: string) {
  showWrongPhoneNumber.value = !validatePhoneNumber(value)
}

function handleChange() {
  isPhoneNumberValid.value = validatePhoneNumber(phoneNumber.value)
  props.checkInputData(props.inputName, isPhoneNumberValid.value ? phoneNumber.value : '')
  props.inputData(isPhoneNumberValid.value ? phoneNumber.value : '')
}

function formatPhoneNumber(event: Event) {
  const input = event.target as HTMLInputElement
  const cursorPosition = input.selectionStart || 0
  const oldValue = phoneNumber.value

  const newValue = input.value
  const newDigits = newValue.replace(/[^\d]/g, '')

  // Limit to 10 digits max (except Stockholm can be 8 or 10, and new 8-digit format)
  if (newDigits.length > 10) {
    phoneNumber.value = oldValue
    input.value = oldValue
    setTimeout(() => {
      input.setSelectionRange(cursorPosition - 1, cursorPosition - 1)
    }, 0)
    return
  }

  const digitsBeforeCursor = newValue.slice(0, cursorPosition).replace(/[^\d]/g, '').length

  const formatted = formatPhoneNumberValue(newValue)
  phoneNumber.value = formatted

  let newCursorPosition = 0
  let digitCount = 0

  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      digitCount++
      if (digitCount === digitsBeforeCursor) {
        newCursorPosition = i + 1
        break
      }
    }
  }

  if (digitCount < digitsBeforeCursor) {
    newCursorPosition = formatted.length
  }

  setTimeout(() => {
    if (inputRef.value) {
      inputRef.value.setSelectionRange(newCursorPosition, newCursorPosition)
    }
  }, 0)

  handleChange()
}

function handleKeyDown(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement
  const cursorPosition = input.selectionStart || 0

  if (event.key === 'Backspace' && cursorPosition > 0) {
    const charBeforeCursor = phoneNumber.value[cursorPosition - 1]
    if (charBeforeCursor === '-' || charBeforeCursor === ' ') {
      event.preventDefault()
      const newValue =
        phoneNumber.value.slice(0, cursorPosition - 2) + phoneNumber.value.slice(cursorPosition)
      const formatted = formatPhoneNumberValue(newValue)
      phoneNumber.value = formatted

      setTimeout(() => {
        if (inputRef.value) {
          inputRef.value.setSelectionRange(cursorPosition - 2, cursorPosition - 2)
        }
      }, 0)

      handleChange()
    }
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    phoneNumber.value = newValue
  }
)
</script>

<template>
  <label :for="inputName" class="font-text-light flex flex-col gap-1 w-full">
    <span>{{ label }}</span>
    <input
      ref="inputRef"
      type="tel"
      :name="inputName"
      :placeholder="placeholder"
      v-model="phoneNumber"
      @input="formatPhoneNumber"
      @keydown="handleKeyDown"
      :class="[
        'w-full text-input-light px-2 text-sm',
        showWrongPhoneNumber && 'input-warning-light'
      ]"
      maxlength="14"
      @blur="(e) => controlPhoneNumber((e.target as HTMLInputElement).value)"
    />
    <p
      class="text-warning-orange font-text-light flex gap-2 items-center"
      v-if="showWrongPhoneNumber"
    >
      <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />
      Ange ett giltigt telefonnummer!
    </p>
  </label>
</template>
