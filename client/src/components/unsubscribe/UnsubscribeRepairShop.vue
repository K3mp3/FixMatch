<script setup lang="ts">
import { unsubscribe } from '@/services/unsubscribe'
import { nextTick, ref } from 'vue'
import LoadingSpinner from '../assets/LoadingSpinner.vue'
import ResponseDialog from '../dialogs/ResponseDialog.vue'
import TextInput from '../utils/TextInput.vue'

const email = ref('')

const isEmailValid = ref(true)
const isBtnDisabled = ref(true)

const isEmailWrong = ref(false)
const isLoading = ref(false)
const showResponseDialog = ref(false)
const isConfirmationSuccess = ref(false)

const responseDialogText = ref('')

const checkInputsData = () => {
  nextTick(() => {
    if (email.value === '') {
      isBtnDisabled.value = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      isBtnDisabled.value = true
    } else {
      isBtnDisabled.value = false
      isEmailValid.value = true
    }
  })
}

const checkEmail = () => {
  if (email.value === '') {
    isEmailValid.value = true
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    isEmailValid.value = false
  } else {
    isEmailValid.value = true
  }
}

const handleSend = async () => {
  isLoading.value = true

  const user = {
    email: email.value
  }

  try {
    await unsubscribe(user)

    responseDialogText.value = 'Du är nu avregistrerad'

    isConfirmationSuccess.value = true
    showResponseDialog.value = true

    isLoading.value = false

    setTimeout(() => {
      showResponseDialog.value = false
    }, 4000)
  } catch (error) {
    isLoading.value = false
    isConfirmationSuccess.value = false
    responseDialogText.value = 'Kunde ej avregistrera'
    showResponseDialog.value = true

    setTimeout(() => {
      showResponseDialog.value = false
      isLoading.value = false
    }, 4000)
  }
}
</script>

<template>
  <div class="spinner-component" v-if="isLoading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <ResponseDialog
    v-if="showResponseDialog"
    :isConfirmationSuccess="isConfirmationSuccess"
    :text="responseDialogText"
  />

  <main class="p-4 h-screen flex items-center justify-center">
    <form @submit.prevent="handleSend">
      <label for="email" class="font-text-light flex flex-col gap-1 w-full"
        ><span>E-mailadress</span>
        <TextInput
          :checkInputData="checkInputsData"
          :inputData="(e: string) => (email = e)"
          :inputType="'email'"
          :inputName="'isEmail'"
          :isDataCorrect="isEmailValid"
          :dataError="'server'"
          @blur="checkEmail"
          placeholder="namn@dinmail.se"
          class="min-w-[275px]"
        />
        <p
          v-if="!isEmailValid || isEmailWrong"
          :class="[!isEmailValid && 'text-warning-orange', isEmailWrong && 'text-error-red-full']"
        >
          <fontAwesome :icon="['fas', 'triangle-exclamation']" class="mr-1" /><span
            >Vänligen kontrollera email adressen!</span
          >
        </p>
      </label>

      <button
        type="submit"
        :disabled="isBtnDisabled"
        :class="[
          'mt-4 mb-2 text-secondary w-full',
          isBtnDisabled ? 'main-btn-disabled' : 'secondary-btn-white-hover'
        ]"
        aria-label="avregistrera"
      >
        Avregistrera
      </button>
    </form>
  </main>
</template>
