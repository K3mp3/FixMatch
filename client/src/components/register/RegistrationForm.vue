<script setup lang="ts">
import type { InputField, RegistrationFormFields } from '@/models/IRegistrationFormFields'
import { registerRepairShop, registerUser } from '@/services/registerUser'
import { onMounted, ref } from 'vue'
import LoadingSpinner from '../assets/LoadingSpinner.vue'
import AlertDialog from '../dialogs/AlertDialog.vue'
import ErrorDialog from '../dialogs/ErrorDialog.vue'
import ResponseDialog from '../dialogs/ResponseDialog.vue'
import LandingFooter from '../footer/LandingFooter.vue'
import CustomSelect from '../utils/CustomSelect.vue'

import ConfirmDialog from '../dialogs/ConfirmDialog.vue'
import RepairShopNavParent from '../nav/RepairShop/NavParent.vue'
import VehicleOwnerNavParent from '../nav/VehicleOwnerNav/NavParent.vue'
import { updateScreenSize } from '../utils/screenSize'
import TextInput from '../utils/TextInput.vue'
import { useRegistration } from './userRegistration'
import VerifyEmail from './VerifyEmail.vue'

const props = defineProps<{
  title: string
  registrationType: 'user' | 'repairShop'
  inputFields: InputField[]
  initialFields: RegistrationFormFields
  hasLocation?: boolean
  locationOptions?: Array<{ value: string; label: string; disabled?: boolean }>
  additionalValidators?: Record<string, (value: string) => boolean>
  agreementComponent: any
  subscriptionType?: string
}>()

const location = ref('')

const mobileScreen = ref(true)

const {
  errors,
  formRef,
  isBtnDisabled,
  isAlertDialog,
  isLoading,
  isConfirmationSuccess,
  showErrorDialog,
  agreementAccepted,
  showAgreement,
  isConfirmDialog,
  isVerifyDialog,
  confirmType,
  confirmIcon,
  confirmHeadline,
  confirmMessage,
  verificationEmail,
  checkInputsData,
  updateFormField,
  validateInput,
  acceptAgreement,
  handleRegistration,
  handleConfirm,
  addFieldToTrack
} = useRegistration(
  props.initialFields,
  props.inputFields,
  props.registrationType === 'user' ? registerUser : registerRepairShop,
  props.additionalValidators,
  props.registrationType // Pass the registration type here
)

if (props.hasLocation) {
  addFieldToTrack('location')
}

async function submitForm() {
  await handleRegistration({
    repairShop: props.registrationType === 'repairShop',
    ...(props.hasLocation ? { location: location.value } : {}),
    ...(props.subscriptionType ? { subscriptionType: props.subscriptionType } : {})
  })
}

const fetchScreenSize = () => {
  mobileScreen.value = updateScreenSize(document.documentElement.clientWidth)
}

onMounted(() => {
  fetchScreenSize()
  window.addEventListener('resize', fetchScreenSize, false)
})
</script>

<template>
  <!-- Template remains exactly the same as your original -->
  <nav class="w-full fixed z-10 top-0">
    <VehicleOwnerNavParent :backgroundColor="true" v-if="registrationType === 'user'" />
    <RepairShopNavParent :backgroundColor="true" v-else-if="registrationType === 'repairShop'" />
  </nav>
  <main>
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
      :email="verificationEmail"
    />

    <component
      :is="agreementComponent"
      v-if="showAgreement"
      @closeAgreement="showAgreement = false"
      @acceptAgreement="acceptAgreement"
    />

    <AlertDialog v-if="isAlertDialog" @closeDialog="() => (isAlertDialog = false)" />

    <div v-if="mobileScreen" class="flex flex-col gap-2 p-4 md:px-8 max-w-[800px] m-auto">
      <p>
        Har du redan ett konto?
        <RouterLink to="/sign-in" class="font-semibold">Logga in här</RouterLink>
      </p>
      <p v-if="registrationType === 'user'">
        Har du en verkstad och vill registrera dig?
        <RouterLink to="/register-repair-shop" class="font-semibold">Registrera dig här</RouterLink>
      </p>
      <p v-else>
        Har du ingen verkstad?
        <RouterLink to="/register" class="font-semibold">Registrera dig här</RouterLink>
      </p>
    </div>

    <div class="flex items-center max-w-[800px] m-auto w-full sm:mt-20 lg:mt-28">
      <div class="p-4 flex flex-col gap-8 text-main w-full md:gap-10 md:p-8">
        <div class="flex gap-4 items-center">
          <RouterLink
            v-if="registrationType === 'repairShop'"
            to="/repair-shop"
            class="btn-back-light"
            aria-label="Gå tillbaka"
            ><fontAwesome :icon="['fas', 'chevron-left']"
          /></RouterLink>
          <RouterLink v-else to="/vehicle-owner" class="btn-back-light" aria-label="Gå tillbaka"
            ><fontAwesome :icon="['fas', 'chevron-left']"
          /></RouterLink>
          <h2 class="text-xl sm:text-2xl font-title-bold">{{ title }}</h2>
        </div>
        <form
          ref="formRef"
          @submit.prevent="submitForm"
          class="flex flex-col gap-6 md:flex-row md:gap-16"
        >
          <section class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl relative">
            <div v-for="field in inputFields" :key="field.key" class="input-container">
              <label :for="field.key" class="font-text-light flex flex-col gap-1">
                <span>{{ field.label }}</span>
                <TextInput
                  :checkInputData="(value: string) => checkInputsData(field.key, value)"
                  :inputData="(value: string) => updateFormField(field.key, value)"
                  :inputType="field.type"
                  :inputName="field.key"
                  :isDataCorrect="!errors[field.key]?.message"
                  :dataError="errors[field.key]?.type || ''"
                  :placeholder="field.placeholder"
                  @blur="() => validateInput(field.key)"
                />
                <span
                  v-if="errors[field.key]?.message"
                  :class="{
                    'text-warning-orange': errors[field.key]?.type === 'validation',
                    'text-error-red-full': errors[field.key]?.type === 'server'
                  }"
                >
                  {{ errors[field.key]?.message }}
                </span>
              </label>
            </div>

            <label v-if="hasLocation" for="location" class="font-text-light flex flex-col gap-1">
              <span>Kommun</span>
              <CustomSelect
                :checkInputData="(value: string) => checkInputsData('location', value)"
                :inputData="
                  (e: string) => {
                    location = e
                    updateFormField('location', e)
                  }
                "
                :inputName="'isLocation'"
                :options="locationOptions || []"
                class="select"
              />
            </label>

            <label for="addons" class="font-text-light flex flex-col gap-1">
              <strong>Användaravtal</strong>
              <p>
                Här med bekräftar jag att jag har läst igenom användaravtalet
                <button type="button" class="underline" @click="showAgreement = true">här</button>
              </p>
              <span class="flex gap-2">
                <input
                  type="checkbox"
                  class="bg-main h-5 w-5"
                  v-model="agreementAccepted"
                  @change="checkInputsData('agreement', agreementAccepted ? 'accepted' : '')"
                />
                <p>Jag accepterar villkoren</p>
              </span>
            </label>

            <div class="relative mb-2">
              <button
                type="submit"
                :disabled="isBtnDisabled"
                :class="[
                  'mb-2 w-full mt-6',
                  isBtnDisabled ? 'main-btn-disabled text-secondary' : 'main-btn'
                ]"
              >
                Registrera
              </button>
            </div>
          </section>
        </form>
        <div v-if="!mobileScreen" class="flex flex-col gap-2">
          <p>
            Har du redan ett konto?
            <RouterLink to="/sign-in" class="font-semibold">Logga in här</RouterLink>
          </p>
          <p v-if="registrationType === 'user'">
            Har du en verkstad och vill registrera dig?
            <RouterLink to="/register-repair-shop" class="font-semibold"
              >Registrera dig här</RouterLink
            >
          </p>
          <p v-else>
            Har du ingen verkstad?
            <RouterLink to="/register" class="font-semibold">Registrera dig här</RouterLink>
          </p>
        </div>
      </div>
      <ErrorDialog
        v-if="showErrorDialog"
        :showErrorDialog="showErrorDialog"
        :title="'Whoops! Tyvärr kunde inte ditt konto registreras just nu.'"
        :text="'Vänligen försök igen senare. Om problemet kvarstår ber vi dig att kontakta support.'"
        :btnText="'Kontakta support'"
        :closeDialog="() => (showErrorDialog = false)"
      />
      <ResponseDialog
        :isConfirmationSuccess="isConfirmationSuccess"
        :text="'Ditt konto är nu skapat!'"
        v-if="isConfirmationSuccess"
      />
    </div>
    <div class="spinner-component" v-if="isLoading">
      <LoadingSpinner />
    </div>
  </main>
  <footer>
    <LandingFooter />
  </footer>
</template>
