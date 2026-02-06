<script setup lang="ts">
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { ref, watch } from 'vue'
import LoadingSpinner from '../assets/LoadingSpinner.vue'
import ResponseDialog from '../dialogs/ResponseDialog.vue'
import LandingNav from '../nav/LandingNav.vue'
import TextInput from '../utils/TextInput.vue'

const isBtnDisabled = ref(true)
const isEmailValid = ref(true)
const isLoading = ref(false)
const isConfirmation = ref(false)
const isConfirmationError = ref(false)
const responseText = ref('')
const email = ref('')

function checkInputData() {
  checkInputDataEmail()
  if (email.value === '' || !isEmailValid.value) {
    isBtnDisabled.value = true
    return false
  } else {
    isBtnDisabled.value = false
    return true
  }
}

function checkInputDataEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  isEmailValid.value = emailRegex.test(email.value.trim())
}

const showConfirmationBox = (response: any) => {
  if (response === 201) {
    isConfirmation.value = true
    setTimeout(() => {
      isConfirmation.value = false
    }, 4000)
  } else if (response === 500 || response === 400) {
    isConfirmationError.value = true
    setTimeout(() => {
      isConfirmationError.value = false
    }, 4000)
  }
}

async function handleReset() {
  isLoading.value = true
  const auth = getAuth()
  isBtnDisabled.value = true

  try {
    await sendPasswordResetEmail(auth, email.value)
    isLoading.value = false
    responseText.value = 'Återställningslänk skickad!'
    showConfirmationBox(201)
    isBtnDisabled.value = true
  } catch (error: any) {
    isLoading.value = false
    // Handle specific Firebase error codes
    switch (error.code) {
      case 'auth/user-not-found':
        responseText.value = 'Ingen användare hittades med denna email!'
        break
      case 'auth/invalid-email':
        responseText.value = 'Ogiltig email adress!'
        break
      case 'auth/too-many-requests':
        responseText.value = 'För många försök. Försök igen senare!'
        break
      default:
        responseText.value = 'Återställningslänk kunde ej skickas!'
    }
    showConfirmationBox(500)
  }
}

watch(email, (newEmail) => {
  checkInputDataEmail()
  if (newEmail === '' || !isEmailValid.value) {
    isBtnDisabled.value = true
  } else {
    isBtnDisabled.value = false
  }
})
</script>

<template>
  <nav class="w-full fixed z-10 top-0">
    <LandingNav :backgroundColor="true" />
  </nav>

  <main>
    <div class="spinner-component" v-if="isLoading">
      <LoadingSpinner />
    </div>

    <ResponseDialog
      v-if="isConfirmation || isConfirmationError"
      :isConfirmationSuccess="isConfirmation"
      :text="responseText"
    />

    <div class="flex items-center justify-center h-screen">
      <div class="p-4 flex flex-col gap-8 text-main w-full max-w-[340px]">
        <div class="flex gap-4 items-center">
          <RouterLink to="/sign-in" class="btn-back-light">
            <fontAwesome :icon="['fas', 'chevron-left']" />
          </RouterLink>
          <h2 class="text-xl sm:text-2xl">Återställ ditt lösenord</h2>
        </div>
        <form @submit.prevent="handleReset" class="flex flex-col gap-6">
          <div class="display-flex flex-dir-col text-align-left gap-4">
            <label for="email" class="font-text-light flex flex-col gap-1">
              <span>Email adress</span>
              <TextInput
                :checkInputData="checkInputData"
                :inputData="(e: string) => (email = e)"
                :inputType="'email'"
                :inputName="'isEmail'"
                :isDataCorrect="isEmailValid"
                :placeholder="'namn@dinmail.se'"
              />
              <p v-if="!isEmailValid" class="text-warning-orange">
                <fontAwesome :icon="['fas', 'triangle-exclamation']" class="mr-1" />
                <span>Vänligen kontrollera email adressen!</span>
              </p>
            </label>
          </div>

          <button
            type="submit"
            :disabled="isBtnDisabled"
            :class="['margin-tp-16', isBtnDisabled ? 'main-btn-disabled' : 'main-btn w-full']"
          >
            Återställ lösenord
          </button>
        </form>
      </div>
    </div>
  </main>
</template>
