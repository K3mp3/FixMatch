<script setup lang="ts">
import LoadingSpinner from '@/components/assets/LoadingSpinner.vue'
import AlertDialog from '@/components/dialogs/AlertDialog.vue'
import ErrorDialog from '@/components/dialogs/ErrorDialog.vue'
import ResponseDialog from '@/components/dialogs/ResponseDialog.vue'
import OpeningHours from '@/components/utils/OpeningHours.vue'
import TextInput from '@/components/utils/TextInput.vue'
import type { ITimeSlot } from '@/models/ITimeSlot'
import router from '@/router'
import { saveRepairShopInfo } from '@/services/repairShopInfo'
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref } from 'vue'

const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)

const userData = computed(() => {
  if (!user.value) {
    console.warn('User data is null')
    return null
  }

  const data = {
    email: user.value.email,
    uid: user.value.uid,
    location: user.value.location,
    name: user.value.name,
    phoneNumber: user.value.phoneNumber,
    address: user.value.address,
    firstSignIn: user.value.firstSignIn,
    selectedTimes: user.value.selectedTimes,
    postalCode: user.value.postalCode,
    deleted: user.value.deleted
  }
  return data
})

interface FormFields {
  workWarranty: string
  partsWarranty: string
}

const formFields = ref<FormFields>({
  workWarranty: '',
  partsWarranty: ''
})

const errors = ref<{
  [key in keyof FormFields]?: { message: string; type: 'validation' | 'server' }
}>({})

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Kontant' },
  { id: 'creditCard', label: 'Kreditkort' },
  { id: 'invoice', label: 'Faktura' },
  { id: 'financing', label: 'Finansiering' },
  { id: 'swish', label: 'Swish' }
]

const inputFields = [
  {
    key: 'workWarranty' as const,
    type: 'string',
    label: 'Garanti på arbete',
    placeholder: '36 (antal månader)'
  },
  {
    key: 'partsWarranty' as const,
    type: 'string',
    label: 'Garanti på reservdelar',
    placeholder: '36 (antal månader)'
  }
]

const whenIsPayment = ref('after')

const dropOffTime = ref('')

const isBtnDisabled = ref(true)
const isAlertDialog = ref(false)
const isLoading = ref(false)
const isConfirmationSuccess = ref(false)
const showErrorDialog = ref(false)
const isRentalCar = ref(false)

const selectedTimes = ref<ITimeSlot[]>([])
const paymentOptions = ref<string[]>([])

const inputsArray: { key: string; value: boolean; valid?: boolean; match?: boolean }[] = [
  { key: 'workWarranty', value: false, valid: true, match: true },
  { key: 'partsWarranty', value: false, valid: true, match: true }
]

function checkInputData() {
  isBtnDisabled.value =
    !formFields.value.workWarranty ||
    !formFields.value.partsWarranty ||
    paymentOptions.value.length === 0 ||
    selectedTimes.value.length === 0 ||
    dropOffTime.value === ''
}

function checkInputsData(key: keyof FormFields, value: string) {
  const index = inputsArray.findIndex((field) => field.key === key)
  let valid = true

  nextTick(() => {
    switch (key) {
      case 'workWarranty':
      case 'partsWarranty':
        valid = /^[0-9]+$/.test(value.trim())
        break
    }

    if (index !== -1) {
      inputsArray[index].value = value !== '' // Update this line
      inputsArray[index].valid = valid
    } else {
      inputsArray.push({ key: key, value: value !== '', valid: valid })
    }

    nextTick(() => {
      checkInputData()
    })
  })
}

function updateFormField(key: keyof FormFields, value: string) {
  formFields.value[key] = value
  checkInputsData(key, value)
}

function validateInput(key: keyof FormFields) {
  const value = formFields.value[key]

  switch (key) {
    case 'workWarranty': {
      if (formFields.value.workWarranty === '') return
      else {
        if (!/^[0-9]+$/.test(value as string)) {
          errors.value[key] = {
            message: 'Vänligen skriv endast siffror!',
            type: 'validation'
          }
        } else {
          errors.value[key] = { message: '', type: 'validation' }
        }
        break
      }
    }
    case 'partsWarranty': {
      if (formFields.value.partsWarranty === '') return
      else {
        if (!/^[0-9]+$/.test(value as string)) {
          errors.value[key] = {
            message: 'Vänligen skriv endast siffror!',
            type: 'validation'
          }
        } else {
          errors.value[key] = { message: '', type: 'validation' }
        }
        break
      }
    }
  }
}

function handlePaymentOption(method: string, checked: boolean) {
  if (checked) {
    paymentOptions.value.push(method)
  } else {
    const index = paymentOptions.value.indexOf(method)
    if (index !== -1) {
      paymentOptions.value.splice(index, 1)
    }
  }

  checkInputData()
}

function saveSelectedTimes(e: ITimeSlot[]) {
  selectedTimes.value = e
  checkInputData()
}

async function handleSave() {
  isLoading.value = true

  try {
    const info = computed(() => ({
      selectedTimes: selectedTimes.value,
      workWarranty: formFields.value.workWarranty,
      partsWarranty: formFields.value.partsWarranty,
      whenIsPayment: whenIsPayment.value,
      isRentalCar: isRentalCar.value,
      paymentOptions: paymentOptions.value,
      email: userData.value?.email || '',
      dropOffTime: dropOffTime.value
    }))

    const response = await saveRepairShopInfo(info.value)

    if (response.status === 201) {
      isLoading.value = false
      isConfirmationSuccess.value = true

      setTimeout(() => {
        isConfirmationSuccess.value = false
        router.push('/repair-shop-garage-home')
      }, 4000)
    } else {
      throw new Error('Registration failed')
    }
  } catch (err) {
    isLoading.value = false
    showErrorDialog.value = true
  }
}
</script>

<template>
  <div class="spinner-component" v-if="loading || isLoading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <main v-if="!loading && !isLoading && userData" class="p-4">
    <AlertDialog @closeDialog="() => (isAlertDialog = false)" v-if="isAlertDialog" />

    <div class="max-w-[800px] m-auto">
      <h2>Hejsan,</h2>
      <p>Eftersom att det är första gången du loggar in behöver vi lite information</p>
    </div>

    <div class="flex items-center max-w-[800px] m-auto w-full mt-6">
      <div class="flex flex-col gap-8 text-main w-full md:gap-10">
        <OpeningHours
          @selectedTimes="(e) => saveSelectedTimes(e)"
          :firstSignIn="userData.firstSignIn"
        />

        <form @submit.prevent="" class="flex flex-col gap-6 md:flex-row md:gap-16 mb-12">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl relative">
            <div v-for="field in inputFields" :key="field.key" class="input-container">
              <label :for="field.key" class="font-text-light flex flex-col gap-1">
                <strong>{{ field.label }}</strong>
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

            <label for="payment" class="font-text-light flex flex-col gap-1"
              ><strong>Betalning</strong>

              <span class="flex gap-2">
                <input
                  type="radio"
                  :checked="whenIsPayment === 'before'"
                  @click="whenIsPayment = 'before'"
                />
                <p>Före jobb</p></span
              >
              <span class="flex gap-2"
                ><input
                  type="radio"
                  :checked="whenIsPayment === 'after'"
                  @click="whenIsPayment = 'after'"
                />
                <p>Efter jobb</p></span
              >
            </label>
            <label for="addons" class="font-text-light flex flex-col gap-1"
              ><strong>Tillval</strong>
              <p>Erbjuds hyrbil?</p>

              <span class="flex gap-2">
                <input type="radio" :checked="isRentalCar === true" @click="isRentalCar = true" />
                <p>ja</p></span
              >
              <span class="flex gap-2"
                ><input
                  type="radio"
                  :checked="isRentalCar === false"
                  @click="isRentalCar = false"
                />
                <p>nej</p></span
              >
            </label>
            <label for="addons" class="font-text-light flex flex-col gap-1"
              ><strong>Betalalternativ</strong>
              <p>Vilka betalalternativ erbjuder ni?</p>

              <span v-for="method in PAYMENT_METHODS" :key="method.id" class="flex gap-2"
                ><input
                  type="checkbox"
                  class="form-checkbox h-5 w-5"
                  :checked="paymentOptions.includes(method.id)"
                  @change="
                    (e) => handlePaymentOption(method.id, (e.target as HTMLInputElement).checked)
                  "
                />
                <p>{{ method.label }}</p></span
              >
            </label>

            <label for="addons" class="font-text-light flex flex-col gap-1"
              ><strong>Inlämningstid</strong>
              <p>Vilken tid vill ni att kunder ska lämna in sina fordon?</p>

              <input
                type="time"
                class="text-input-light p-2 w-full"
                v-model="dropOffTime"
                @change="checkInputData"
              />
            </label>

            <div class="relative">
              <button
                type="submit"
                :disabled="isBtnDisabled"
                :class="[
                  'mb-10 w-full absolute',
                  isBtnDisabled ? 'main-btn-disabled text-secondary' : 'main-btn'
                ]"
                @click="handleSave"
              >
                Spara
              </button>
            </div>
          </div>
        </form>
      </div>
      <ErrorDialog
        v-if="showErrorDialog"
        :showErrorDialog="showErrorDialog"
        :title="'Whoops! Tyvärr kunde inte ditt uppgifterna registreras just nu.'"
        :text="'Vänligen försök igen senare. Om problemet kvarstår ber vi dig att kontakta support.'"
        :btnText="'Kontakta support'"
        :closeDialog="() => (showErrorDialog = false)"
      />
      <ResponseDialog
        :isConfirmationSuccess="isConfirmationSuccess"
        :text="'Uppgifterna är nu sparade!'"
        v-if="isConfirmationSuccess"
      />
    </div>
  </main>
</template>
