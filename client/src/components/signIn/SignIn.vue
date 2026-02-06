<script setup lang="ts">
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '../assets/LoadingSpinner.vue'
import ConfirmDialog from '../dialogs/ConfirmDialog.vue'
import LandingFooter from '../footer/LandingFooter.vue'
import LandingNav from '../nav/LandingNav.vue'
import VerifyEmail from '../register/VerifyEmail.vue'
import TextInput from '../utils/TextInput.vue'

const email = ref('')
const password = ref('')
const confirmType = ref<'warning' | 'success' | 'error'>('warning')
const confirmIcon = ref('')
const confirmHeadline = ref('')
const confirmMessage = ref('')

const isEmailValid = ref(true)
const isPasswordValid = ref(true)
const isEmailWrong = ref(false)
const isPasswordWrong = ref(false)
const isBtnDisabled = ref(true)
const isLoading = ref(false)
const isConfirmDialog = ref(false)
const isVerifyDialog = ref(false)

const authStore = useAuthStore()
const { user, loading, verificationError, noUserError } = storeToRefs(authStore)

const userData = computed(() => {
  if (user.value) {
    return {
      email: user.value.email,
      uid: user.value.uid,
      location: user.value.location,
      name: user.value.name,
      phoneNumber: user.value.phoneNumber,
      repairShop: user.value.repairShop,
      admin: user.value.admin
    }
  }
  return null
})

const router = useRouter()

const inputsArray: { key: string; value: boolean }[] = [
  { key: 'isEmail', value: false },
  { key: 'isPassword', value: false }
]

const checkInputData = () => {
  isBtnDisabled.value = !inputsArray.every((field) => field.value)
}

const checkInputsData = (confirmKey: string) => {
  nextTick(() => {
    let refVariable: Ref<string> | null = null
    switch (confirmKey) {
      case 'isEmail':
        refVariable = email
        break
      case 'isPassword':
        refVariable = password
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

const handleSignIn = async () => {
  isBtnDisabled.value = true
  isLoading.value = true

  try {
    await authStore.customSignIn(email.value, password.value)
    if (!loading.value && userData.value?.admin) router.push(`/admin`)
    else if (!loading.value && userData.value?.repairShop) {
      router.push(`/repair-shop-garage-home`)
    } else router.push(`/`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (
        error.message.includes('auth/invalid-credential') ||
        error.message.includes('No user found')
      ) {
        isEmailWrong.value = true
        isPasswordWrong.value = true
      } else if (verificationError.value) {
        confirmType.value = 'error'
        confirmIcon.value = 'triangle-exclamation'
        confirmHeadline.value = 'Pågående registrering'
        confirmMessage.value =
          'Detta konto har redan en pågående registrering. Ett veriferingsmail har skickats till den angivna e-mailadressen.'
        isConfirmDialog.value = true
      } else if (noUserError.value) {
        confirmType.value = 'error'
        confirmIcon.value = 'triangle-exclamation'
        confirmHeadline.value = 'Inget konto'
        confirmMessage.value = 'Det finns inget konto kopplat till denna e-mailadress.'
        isConfirmDialog.value = true
      }
    } else {
      console.error('An unknown error occured during sign in')
      confirmType.value = 'error'
      confirmIcon.value = 'triangle-exclamation'
      confirmHeadline.value = 'Fel'
      confirmMessage.value =
        'Tyvärr gick det inte att logga in. Pröva gärna igen senare. Om problemet kvarstår, kontakta oss gärna.'
      isConfirmDialog.value = true
    }
  } finally {
    isLoading.value = false
    isBtnDisabled.value = false
  }
}

const handleConfirm = () => {
  isConfirmDialog.value = false
  isVerifyDialog.value = true
}
</script>

<template>
  <nav class="w-full fixed z-10 top-0">
    <LandingNav :backgroundColor="true" />
  </nav>

  <!-- <ResponseDialog
    :isConfirmationSuccess="false"
    :text="'Just nu går det tyvärr inte att logga in pågrund av underhåll'"
  /> -->
  <main class="p-4 lg:p-16 w-full mb-24">
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

    <VerifyEmail
      v-if="isVerifyDialog"
      @cancel="isVerifyDialog = !isVerifyDialog"
      :email="email"
      @confirm="isVerifyDialog = false"
    />

    <div class="flex max-w-[800px] m-auto mt-[116px] md:mt-[195px]">
      <div class="p-4 flex flex-col gap-8 text-main w-full">
        <div class="flex gap-4 items-center">
          <RouterLink to="/" class="btn-back-light" aria-label="Gå tillbaka"
            ><fontAwesome :icon="['fas', 'chevron-left']"
          /></RouterLink>
          <h2 class="text-xl sm:text-2xl">Logga in</h2>
        </div>
        <form @submit.prevent="handleSignIn" class="flex flex-col gap-6">
          <div class="flex flex-col gap-6 sm:flex-row sm:gap-16">
            <label for="email" class="font-text-light flex flex-col gap-1 w-full"
              ><span>E-mailadress</span>
              <TextInput
                :checkInputData="(e: string) => checkInputsData(e)"
                :inputData="(e: string) => (email = e)"
                :inputType="'email'"
                :inputName="'isEmail'"
                :isDataCorrect="isEmailValid"
                :dataError="'server'"
                placeholder="namn@dinmail.se"
              />
              <p
                v-if="!isEmailValid || isEmailWrong"
                :class="[
                  !isEmailValid && 'text-warning-orange',
                  isEmailWrong && 'text-error-red-full'
                ]"
              >
                <fontAwesome :icon="['fas', 'triangle-exclamation']" class="mr-1" /><span
                  >Vänligen kontrollera email adressen!</span
                >
              </p>
            </label>

            <label for="password" class="font-text-light flex flex-col gap-1 w-full"
              ><span>Lösenord</span>
              <TextInput
                :checkInputData="(e: string) => checkInputsData(e)"
                :inputData="(e: string) => (password = e)"
                :inputType="'password'"
                :inputName="'isPassword'"
                :isDataCorrect="isPasswordValid"
                :dataError="'server'"
                placeholder="lösenord"
              />

              <p
                v-if="!isPasswordValid || isPasswordWrong"
                :class="[
                  !isPasswordValid && 'text-warning-orange',
                  isPasswordWrong && 'text-error-red-full'
                ]"
              >
                <fontAwesome :icon="['fas', 'triangle-exclamation']" class="mr-1" />Vänligen
                kontrollera lösenordet!
              </p>
            </label>
          </div>

          <button
            type="submit"
            :disabled="isBtnDisabled"
            :class="['mt-4 mb-2', isBtnDisabled ? 'main-btn-disabled text-secondary' : 'main-btn']"
            aria-label="logga in"
          >
            Logga in
          </button>

          <div class="flex flex-col gap-2">
            <p>
              Glömt lösenord?
              <RouterLink to="/forgot-password" class="font-semibold">Klicka här</RouterLink>
            </p>

            <p>
              Har du inget konto?
              <RouterLink to="/register" class="font-semibold">Registrera dig</RouterLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  </main>

  <div class="spinner-component" v-if="isLoading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <footer>
    <LandingFooter />
  </footer>
</template>
