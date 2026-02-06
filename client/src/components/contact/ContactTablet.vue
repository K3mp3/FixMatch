<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type Ref } from 'vue'
import TextArea from '../utils/TextArea.vue'
import TextInput from '../utils/TextInput.vue'

const emits = defineEmits<{
  (
    e: 'handleMessage',
    message: {
      userName: string
      userEmail: string
      userMessage: string
    }
  ): void
}>()

const mobile = ref(true)
const tablet = ref(false)
const desktop = ref(false)
const isBtnDisabled = ref(true)

const name = ref('')
const email = ref('')
const message = ref('')

const isNameValid = ref(true)
const showNameError = ref(false)
const isEmailValid = ref(true)
const showEmailError = ref(false)

const inputsArray: { key: string; value: boolean }[] = [
  { key: 'isName', value: false },
  { key: 'isEmail', value: false },
  { key: 'isMessage', value: false }
]

function updateScreenSize() {
  window.addEventListener('resize', updateScreenSize)

  if (document.documentElement.clientWidth > 1280) {
    desktop.value = true
    tablet.value = false
    mobile.value = false
  }

  if (document.documentElement.clientWidth > 699 && document.documentElement.clientWidth < 1281) {
    desktop.value = false
    tablet.value = true
    mobile.value = false
  }

  if (document.documentElement.clientWidth < 700) {
    desktop.value = false
    tablet.value = false
    mobile.value = true
  }
}

function checkInputData() {
  isBtnDisabled.value =
    !inputsArray.every((field) => field.value) ||
    !isNameValid.value ||
    !isEmailValid.value ||
    message.value.trim() === ''
}

function checkInputsData(confirmKey: string) {
  nextTick(() => {
    let refVariable: Ref<string> | null = null
    switch (confirmKey) {
      case 'isName':
        {
          const nameRegex = /^[^\s]+\s[^\s]+$/
          isNameValid.value = nameRegex.test(name.value)
        }
        refVariable = name
        break
      case 'isEmail':
        {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          isEmailValid.value = emailRegex.test(email.value.trim())
        }
        refVariable = email
        break
      case 'message':
        refVariable = message
        break
      default:
        break
    }

    if (refVariable?.value === '') {
      const index = inputsArray.findIndex((field) => field.key === confirmKey)

      if (index !== -1) {
        inputsArray[index].value = false
      } else {
        inputsArray.push({ key: confirmKey, value: false })
      }

      checkInputData()
      return
    } else {
      const index = inputsArray.findIndex((field) => field.key === confirmKey)

      if (index !== -1) {
        inputsArray[index].value = true
      } else {
        inputsArray.push({ key: confirmKey, value: true })
      }

      checkInputData()
    }
  })
}

function validateName() {
  if (!isNameValid.value) {
    showNameError.value = true
  } else showNameError.value = false
}

function validateEmail() {
  if (!isEmailValid.value) {
    showEmailError.value = true
  } else showEmailError.value = false
}

const messageData = computed(() => {
  return {
    userName: name.value,
    userEmail: email.value,
    userMessage: message.value
  }
})

function handleMessage() {
  emits('handleMessage', messageData.value)

  name.value = ''
  email.value = ''
  message.value = ''

  isBtnDisabled.value = true
}

onMounted(() => {
  updateScreenSize()
})
</script>

<template>
  <div class="flex flex-col gap-8 p-4 xl:p-8 items-center justify-center content-wrapper w-full">
    <div class="flex items-center gap-6 w-full max-w-[1200px] relative">
      <RouterLink to="/" class="btn-back-light z-10 drop-shadow-lg" aria-label="Gå tillbaka"
        ><fontAwesome :icon="['fas', 'chevron-left']"
      /></RouterLink>

      <div class="w-full absolute text-center">
        <h2 class="text-2xl">Kontakta oss</h2>
      </div>
    </div>
    <form class="flex gap-8 w-full max-w-[1200px]" @submit.prevent="handleMessage">
      <div class="w-full">
        <label for="email" class="font-text-light flex flex-col gap-1 text-start"
          ><span>Meddelande</span>
          <TextArea
            v-model="message"
            :checkInputData="(e: string) => checkInputsData(e)"
            :inputData="(e: string) => (message = e)"
            :inputName="'isMessage'"
            placeholder="Beskriv varför du kontaktar oss"
            class="h-56"
          ></TextArea>
        </label>
      </div>
      <div class="flex flex-col gap-6 w-full">
        <label for="name" class="font-text-light flex flex-col gap-1 text-start"
          ><span>För- och efternamn</span>
          <TextInput
            v-model="name"
            :checkInputData="(e: string) => checkInputsData(e)"
            :inputData="(e: string) => (name = e)"
            :inputType="'text'"
            :inputName="'isName'"
            :isDataCorrect="!showNameError"
            placeholder="För- och efternamn"
            :onBlur="validateName"
            :light="true"
          />
          <p
            class="text-warning-orange font-text-light flex gap-2 items-center"
            v-if="showNameError"
          >
            <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />Ange
            både för- och efternamn!
          </p>
        </label>

        <label for="email" class="font-text-light flex flex-col gap-1 text-start"
          ><span>E-mailadress</span>
          <TextInput
            v-model="email"
            :checkInputData="(e: string) => checkInputsData(e)"
            :inputData="(e: string) => (email = e)"
            :inputType="'email'"
            :inputName="'isEmail'"
            :isDataCorrect="!showEmailError"
            placeholder="namn@mail.se"
            :onBlur="validateEmail"
            :light="true"
          />
          <p v-if="showEmailError" class="text-warning-orange">
            <fontAwesome :icon="['fas', 'triangle-exclamation']" class="mr-1" /><span
              >Vänligen skriv en giltig e-mailadress!</span
            >
          </p>
        </label>

        <button
          type="submit"
          :disabled="isBtnDisabled"
          :class="[
            'mt-5',
            isBtnDisabled ? 'main-btn-disabled margin-16-0' : 'main-btn w-full margin-32-0'
          ]"
        >
          Skicka
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.content-wrapper {
  min-height: calc(100vh - 370px); /* Use calc() for the dynamic height calculation */
}
</style>
