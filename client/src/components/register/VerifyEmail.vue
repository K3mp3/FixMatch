<script setup lang="ts">
import router from '@/router'
import { resendCode, verifyUser } from '@/services/registerUser'
import { computed, nextTick, onMounted, ref } from 'vue'
import LoadingSpinner from '../assets/LoadingSpinner.vue'
import ConfirmDialog from '../dialogs/ConfirmDialog.vue'

const props = defineProps({
  email: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['cancel', 'confirm'])

const digits = ref(Array(6).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])
const activeIndex = ref(0)
const isLoading = ref(false)
const isBtnDisabled = ref(false)
const isConfirmDialog = ref(false)
const confirmIcon = ref('')
const confirmHeadline = ref('')
const confirmMessage = ref('')
const confirmType = ref<'warning' | 'success' | 'error'>('warning')

// Resend cooldown functionality
const resendCooldown = ref(false)
const cooldownSeconds = ref(300) // 5 minutes = 300 seconds
const cooldownInterval = ref<number | null>(null)
const formattedCooldown = computed(() => {
  const minutes = Math.floor(cooldownSeconds.value / 60)
  const seconds = cooldownSeconds.value % 60
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
})

onMounted(() => {
  // Check if there's a stored cooldown timestamp
  const storedCooldownEnd = localStorage.getItem('resendCodeCooldownEnd')
  if (storedCooldownEnd) {
    const cooldownEndTime = parseInt(storedCooldownEnd)
    const currentTime = Date.now()

    if (cooldownEndTime > currentTime) {
      // Calculate remaining cooldown time
      const remainingTime = Math.ceil((cooldownEndTime - currentTime) / 1000)
      startCooldown(remainingTime)
    } else {
      // Cooldown has expired, remove from storage
      localStorage.removeItem('resendCodeCooldownEnd')
    }
  }
})

const startCooldown = (duration: number = 300) => {
  resendCooldown.value = true
  cooldownSeconds.value = duration

  // Store the cooldown end time
  const cooldownEndTime = Date.now() + duration * 1000
  localStorage.setItem('resendCodeCooldownEnd', cooldownEndTime.toString())

  // Clear any existing interval
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }

  // Start the countdown
  cooldownInterval.value = setInterval(() => {
    cooldownSeconds.value--

    if (cooldownSeconds.value <= 0) {
      resendCooldown.value = false
      clearInterval(cooldownInterval.value!)
      cooldownInterval.value = null
      localStorage.removeItem('resendCodeCooldownEnd')
    }
  }, 1000) as unknown as number
}

const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (value.length <= 1) {
    digits.value[index] = value

    if (value && index < 6 - 1) {
      activeIndex.value = index + 1
      inputRefs.value[index + 1]?.focus()
    }
  } else digits.value[index] = ''
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    activeIndex.value = index - 1
    inputRefs.value[index - 1]?.focus()

    const input = inputRefs.value[index - 1]
    if (input) {
      setTimeout(() => {
        const length = input.value.length
        input.setSelectionRange(length, length)
      }, 0)
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    activeIndex.value = index - 1
    inputRefs.value[index - 1]?.focus()

    const input = inputRefs.value[index - 1]
    if (input) {
      setTimeout(() => {
        const length = input.value.length
        input.setSelectionRange(length, length)
      }, 0)
    }
  } else if (event.key === 'ArrowRight' && index < 6 - 1) {
    activeIndex.value = index + 1
    inputRefs.value[index + 1]?.focus()

    const input = inputRefs.value[index + 1]
    if (input) {
      setTimeout(() => {
        const length = input.value.length
        input.setSelectionRange(length, length)
      }, 0)
    }
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')

  if (pastedData) {
    // Get characters from pasted content up to the code length
    const pastedChars = pastedData.split('').slice(0, 6)

    // Update the digits array with pasted characters
    for (let i = 0; i < 6; i++) {
      if (i < pastedChars.length) {
        digits.value[i] = pastedChars[i]
      }
    }

    // Focus the next empty input or the last one
    const nextEmptyIndex = digits.value.findIndex((d) => d === '')
    const focusIndex = nextEmptyIndex === -1 ? 6 - 1 : nextEmptyIndex
    activeIndex.value = focusIndex

    // Need to use nextTick to ensure DOM updates before focusing
    nextTick(() => {
      inputRefs.value[focusIndex]?.focus()
    })
  }
}

const isComplete = computed(() => {
  return digits.value.every((digit) => digit !== '')
})

const completeCode = computed(() => {
  return digits.value.join('')
})

const handleResend = async () => {
  isLoading.value = true
  isBtnDisabled.value = true

  const user = {
    email: props.email
  }

  try {
    const response = await resendCode(user)

    if (response.status === 200) {
      confirmType.value = 'success'
      confirmIcon.value = 'check'
      confirmHeadline.value = 'Kod skickad'
      confirmMessage.value = 'Vi har nu skickat en ny kod till din angivna e-mailadress'

      // Start the cooldown timer after successful resend
      startCooldown()
    } else {
      confirmType.value = 'error'
      confirmIcon.value = 'triangle-exclamation'
      confirmHeadline.value = 'Kod kunde ej skickas'
      confirmMessage.value =
        'Tyvärr kunde ej en ny kod skickas. Testa gärna igen om en stund. Kvarstår problemet, kontakta kundsupport'
    }
  } catch (error) {
    confirmIcon.value = 'triangle-exclamation'
    confirmHeadline.value = 'Kod kunde ej skickas'
    confirmMessage.value =
      'Tyvärr kunde ej en ny kod skickas. Testa gärna igen om en stund. Kvarstår problem, kontakta kundsupport'
  } finally {
    isLoading.value = false
    isConfirmDialog.value = true
    isBtnDisabled.value = false
  }
}

const handleSend = async () => {
  isLoading.value = true
  isBtnDisabled.value = true

  const code = {
    code: digits.value.toString()
  }

  try {
    const response = await verifyUser(code)

    if (response.status === 201) {
      confirmType.value = 'success'
      confirmIcon.value = 'check'
      confirmHeadline.value = 'Verifiering lyckades'
      confirmMessage.value =
        'Din verifiering lyckades. Klicka på okej för att komma till inloggning'
    } else {
      confirmType.value = 'error'
      confirmIcon.value = 'triangle-exclamation'
      confirmHeadline.value = 'Verifiering misslyckades'
      confirmMessage.value =
        'Tyvärr misslyckades verifieringen. Testa gärna igen om en stund. Kvarstår problemet, kontakta kundsupport'
    }
  } catch (error) {
    confirmIcon.value = 'triangle-exclamation'
    confirmHeadline.value = 'Verifiering misslyckades'
    confirmMessage.value =
      'Tyvärr misslyckades verifieringen. Testa gärna igen om en stund. Kvarstår problem, kontakta kundsupport'
  } finally {
    isLoading.value = false
    isConfirmDialog.value = true
  }
}

const handleConfirm = () => {
  if (confirmType.value === 'success' && confirmHeadline.value === 'Verifiering lyckades') {
    router.push('/sign-in')
  }

  isLoading.value = false
  isConfirmDialog.value = false
  emit('confirm')
}
</script>

<template>
  <ConfirmDialog
    v-if="isConfirmDialog"
    :type="confirmType"
    :icon="['fas', confirmIcon]"
    :headline="confirmHeadline"
    :message="confirmMessage"
    :acceptText="'Okej'"
    :cancelText="'Avbryt'"
    @confirm="handleConfirm"
    @cancel="isConfirmDialog = !isConfirmDialog"
  />

  <div class="spinner-component" v-if="isLoading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <section
    v-if="!isConfirmDialog"
    class="w-full h-screen fixed bg-main-40 z-20 top-0 left-0 flex items-center justify-center p-4 text-center"
  >
    <div class="p-4 bg-main rounded-lg flex flex-col gap-4 border-main max-w-md w-full">
      <div class="flex justify-center mb-2">
        <div class="w-12 h-12 flex items-center justify-center">
          <fontAwesome :icon="['fas', 'user']" class="h-6 text-main" />
        </div>
      </div>

      <h2 class="text-xl font-bold mb-2">Verifiera ditt konto</h2>

      <p class="text-sm mb-4">Ange koden som vi har skickat till din angivna e-mailadress</p>

      <div class="flex justify-center gap-2 mb-6" @paste="handlePaste">
        <div v-for="(digit, index) in digits" :key="index" class="w-14 h-14 relative">
          <input
            type="text"
            maxlength="1"
            :value="digit"
            :ref="
              (el) => {
                if (el) inputRefs[index] = el as HTMLInputElement
              }
            "
            class="w-full h-full bg-transparent border-main rounded-lg text-center text-2xl font-bold focus:border-blue focus:outline-none text-main"
            :class="{ 'border-blue': index === activeIndex }"
            @input="handleInput(index, $event)"
            @keydown="handleKeyDown(index, $event)"
            @focus="activeIndex = index"
          />
        </div>
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-2 text-sm mb-4"
        :class="[
          resendCooldown ? 'text-gray-400 cursor-not-allowed' : 'text-third hover-sky-green'
        ]"
        @click="!resendCooldown && handleResend()"
        :disabled="resendCooldown"
      >
        <fontAwesome :icon="['fas', 'rotate-right']" />
        <span v-if="resendCooldown">Skicka igen ({{ formattedCooldown }})</span>
        <span v-else>Skicka igen</span>
      </button>

      <button
        type="button"
        :class="[isComplete || isBtnDisabled ? 'main-btn' : 'main-btn-disabled']"
        @click="handleSend"
      >
        Okej
      </button>

      <button type="button" class="border-button rounded-full mb-3" @click="emit('cancel')">
        Avbryt
      </button>
    </div>
  </section>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
