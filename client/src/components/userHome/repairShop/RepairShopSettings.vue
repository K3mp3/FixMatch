<script setup lang="ts">
import LoadingSpinner from '@/components/assets/LoadingSpinner.vue'
import AlertDialog from '@/components/dialogs/AlertDialog.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import ErrorDialog from '@/components/dialogs/ErrorDialog.vue'
import ResponseDialog from '@/components/dialogs/ResponseDialog.vue'
import SignedInNav from '@/components/nav/SignedInNav.vue'
import OpeningHours from '@/components/utils/OpeningHours.vue'
import TextInput from '@/components/utils/TextInput.vue'
import type { ITimeSlot } from '@/models/ITimeSlot'
import { cancelDelete, checkTrialPeriod, deleteAccount } from '@/services/account'
import { saveRepairShopInfoSettings } from '@/services/repairShopInfo'
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)

const userData = computed(() => {
  if (!user.value) {
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
    paymentOptions: user.value.paymentOptions,
    selectedTimes: user.value.selectedTimes as unknown as ITimeSlot[],
    workWarranty: user.value.workWarranty,
    partsWarranty: user.value.partsWarranty,
    isRentalCar: user.value.isRentalCar,
    whenIsPayment: user.value.whenIsPayment,
    dropOffTime: user.value.dropOffTime,
    deleted: user.value.deleted,
    newPaymentDate: user.value.newPaymentDate,
    subscriptionType: user.value.subscriptionType,
    nextFeeDate: user.value.nextFeeDate,
    createdAt: user.value.createdAt,
    sessionId: user.value.sessionId
  }
  return data
})

interface FormFields {
  workWarranty: string
  partsWarranty: string
}

const formFields = ref<FormFields>({
  workWarranty: userData.value?.workWarranty || '',
  partsWarranty: userData.value?.partsWarranty || ''
})

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Kontant' },
  { id: 'creditCard', label: 'Kreditkort' },
  { id: 'invoice', label: 'Faktura' },
  { id: 'financing', label: 'Finansiering' },
  { id: 'swish', label: 'Swish' }
]

const inputFields = computed(() => [
  {
    key: 'workWarranty' as const,
    type: 'string',
    label: 'Garanti på arbete',
    placeholder: '36 (antal månader)',
    value: userData.value?.workWarranty || ''
  },
  {
    key: 'partsWarranty' as const,
    type: 'string',
    label: 'Garanti på reservdelar',
    placeholder: '36 (antal månader)',
    value: userData.value?.partsWarranty || ''
  }
])

const formatDate = (dateString: Date) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE')
}

const errors = ref<{
  [key in keyof FormFields]?: { message: string; type: 'validation' | 'server' }
}>({})

const whenIsPayment = ref('after')

const responseText = ref('')
const dropOffTime = ref('')
const isSubscriptionType = ref('')
const signOutText = ref('')

const isBtnDisabled = ref(false)
const isAlertDialog = ref(false)
const isLoading = ref(false)
const isConfirmationSuccess = ref(false)
const showErrorDialog = ref(false)
const isRentalCar = ref(false)
const isConfirmDialog = ref(false)
const isConfirmation = ref(false)
const isConfirmationError = ref(false)
const hasShownWarning = ref(false)
const showSignOut = ref(false)

const isKeepAccountDisabled = ref(true)
const navMobile = ref(true)

const selectedTimes = ref<ITimeSlot[]>([])
const deletionCheckInterval = ref<number | null>(null)
const trialCheckInterval = ref<number | null>(null)
const newPaymentDate = ref<Date>()

const inputsArray: { key: string; value: boolean; valid?: boolean; match?: boolean }[] = [
  { key: 'workWarranty', value: true, valid: true, match: true },
  { key: 'partsWarranty', value: true, valid: true, match: true }
]

const paymentOptions = ref<string[]>([])

let resizeTimeout: ReturnType<typeof setTimeout> | null = null

window.addEventListener('resize', resizeThrottler, false)

function updateScreenSize() {
  const width = document.documentElement.clientWidth

  navMobile.value = width <= 1023
}

function resizeThrottler() {
  if (!resizeTimeout) {
    resizeTimeout = setTimeout(function () {
      resizeTimeout = null
      updateScreenSize()
    }, 66)
  }
}

function signOutUser() {
  authStore.signOut()
}

function checkInputData() {
  isBtnDisabled.value =
    inputsArray.some((field) => !field.value || !field.valid) ||
    paymentOptions.value.length === 0 ||
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
  if (
    !userData.value?.selectedTimes ||
    JSON.stringify(e) !== JSON.stringify(userData.value.selectedTimes)
  ) {
    selectedTimes.value = e
  }
}

async function handleSave() {
  isLoading.value = true

  try {
    const info = computed(() => ({
      selectedTimes:
        selectedTimes.value.length > 0 ? selectedTimes.value : userData.value?.selectedTimes || [],
      workWarranty: formFields.value.workWarranty || userData.value?.workWarranty || '',
      partsWarranty: formFields.value.partsWarranty || userData.value?.partsWarranty || '',
      whenIsPayment: whenIsPayment.value,
      isRentalCar: isRentalCar.value,
      paymentOptions: paymentOptions.value,
      email: userData.value?.email || '',
      dropOffTime: dropOffTime.value,
      subscriptionType: isSubscriptionType.value
    }))

    const response = await saveRepairShopInfoSettings(info.value)

    if (response.status === 201) {
      isLoading.value = false
      isConfirmationSuccess.value = true

      responseText.value =
        isSubscriptionType.value === 'core'
          ? 'Uppgifterna är nu sparade!'
          : 'Uppgifterna är nu sparade. Du loggas nu ut för att färdigställa allt'

      isConfirmation.value = true

      setTimeout(() => {
        isConfirmation.value = false
        isConfirmationSuccess.value = false

        if (isSubscriptionType.value === 'premium') authStore.signOut()
      }, 4000)
    } else {
      throw new Error('Registration failed')
    }
  } catch (err) {
    isLoading.value = false
    showErrorDialog.value = true
  }
}

const showConfirmationBox = (response: any) => {
  if (response === 201) {
    isConfirmation.value = true

    setTimeout(() => {
      isConfirmation.value = false
    }, 5000)
  } else if (response === 500 || response === 400 || response === 404) {
    isConfirmationError.value = true

    setTimeout(() => {
      isConfirmationError.value = false
    }, 5000)
  }
}

const handleDeleteAccount = async () => {
  isLoading.value = true

  const user = {
    uid: userData.value?.uid
  }

  const response = await deleteAccount(user)

  isConfirmDialog.value = false

  if (response === 201) {
    isLoading.value = false
    isConfirmationSuccess.value = true
    responseText.value = 'Konto raderat. Du loggas nu ut för att färdigställa allt'
    showConfirmationBox(response)
    isBtnDisabled.value = true

    setTimeout(() => {
      authStore.signOut()
    }, 4000)

    isKeepAccountDisabled.value = false
  } else {
    isLoading.value = false
    responseText.value = 'Konto kunde ej raderas'
    isConfirmationSuccess.value = false
    showConfirmationBox(response)
  }
}

const handleCancelDelete = async () => {
  isLoading.value = true

  const user = {
    uid: userData.value?.uid
  }

  const response = await cancelDelete(user)

  isConfirmDialog.value = false

  if (response.status === 201) {
    isLoading.value = false
    isConfirmationSuccess.value = true
    responseText.value = 'Konto kommer ej raderas. Du loggas nu ut för att färdigställa allt'
    showConfirmationBox(response.status)
    isBtnDisabled.value = true
    isKeepAccountDisabled.value = true

    setTimeout(() => {
      authStore.signOut()
    }, 5000)
  } else {
    isLoading.value = false
    responseText.value = 'Konto kunde ej ångra radering'
    isConfirmationSuccess.value = false
    showConfirmationBox(response.status)
  }
}

watch(
  () => userData.value,
  (newUserData) => {
    if (newUserData) {
      formFields.value = {
        workWarranty: newUserData.workWarranty,
        partsWarranty: newUserData.partsWarranty
      }
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await authStore.initAuth()

  if (!loading.value && user.value) {
    isRentalCar.value = !!userData.value?.isRentalCar
    whenIsPayment.value = userData.value?.whenIsPayment as string
    paymentOptions.value = userData.value?.paymentOptions as string[]
    dropOffTime.value = userData.value?.dropOffTime || ''
    isSubscriptionType.value = userData.value?.subscriptionType as string

    if (userData.value?.newPaymentDate)
      newPaymentDate.value = new Date(
        new Date(userData.value?.newPaymentDate.seconds * 1000).setDate(
          new Date(userData.value?.newPaymentDate.seconds * 1000).getDate() + 1
        )
      )
  }

  resizeThrottler()

  const isScheduledForDeletion = computed(() => {
    return !!userData.value?.deleted
  })

  isKeepAccountDisabled.value = !isScheduledForDeletion.value

  deletionCheckInterval.value = setInterval(
    () => {
      if (userData.value?.deleted) {
        const deletionDate = new Date(userData.value?.deleted.seconds * 1000)

        if (new Date() >= deletionDate) {
          showSignOut.value = true
          hasShownWarning.value = true

          setTimeout(
            () => {
              authStore.signOut()
            },
            1000 * 60 * 1
          )
        }
      }
    },
    1000 * 60 * 1
  )

  const checkTrial = async () => {
    const user = {
      email: userData.value?.email
    }

    const response = await checkTrialPeriod(user)

    if (response.status === 403) authStore.signOut()
  }

  trialCheckInterval.value = setInterval(
    () => {
      checkTrial()
    },
    1000 * 60 * 10
  )
})

setInterval(
  () => {
    if (
      userData.value?.newPaymentDate ||
      (userData.value?.createdAt &&
        new Date() >= new Date(userData.value?.createdAt.seconds * 1000) &&
        userData.value?.sessionId === null &&
        userData.value.subscriptionType === 'premium')
    ) {
      const newPaymentDate = userData.value?.newPaymentDate
        ? new Date(userData.value?.newPaymentDate.seconds * 1000 - 60000)
        : null

      if (
        (newPaymentDate && new Date() >= newPaymentDate) ||
        (userData.value?.createdAt &&
          new Date() >= new Date(userData.value?.createdAt.seconds * 1000) &&
          userData.value?.sessionId === null &&
          userData.value.subscriptionType === 'premium')
      ) {
        showSignOut.value = true
        hasShownWarning.value = true

        signOutText.value =
          'Ditt konto kommer att loggas ut om 30 sekunder eftersom nästa betaldatum har passerat. För att fortsätta använda plattformen, vänligen logga in och betala för nästa period'

        setTimeout(
          () => {
            signOutUser()
          },
          1000 * 30 * 1
        )
      }
    }
  },
  1000 * 50 * 1
)

onUnmounted(() => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  window.removeEventListener('resize', resizeThrottler, false)

  if (deletionCheckInterval.value) {
    clearInterval(deletionCheckInterval.value)
  }

  if (trialCheckInterval.value) {
    clearInterval(trialCheckInterval.value)
  }
})
</script>
<template>
  <SignedInNav :repairShop="true" :highlight="'settings'" />

  <section
    class="fixed top-0 left-0 bg-main-90 h-screen w-screen flex items-center justify-center"
    v-if="showSignOut"
  >
    <div class="p-4 bg-main rounded-lg flex flex-col gap-4 border-gr-warning">
      <fontAwesome icon="warning" class="h-10 text-warning-orange" />
      <p>{{ signOutText }}</p>
    </div>
  </section>

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
    :text="responseText"
    v-if="isConfirmation || isConfirmationError"
  />

  <ConfirmDialog
    v-if="isConfirmDialog"
    :type="'warning'"
    :icon="['fas', 'triangle-exclamation']"
    :message="'Ditt konto kommer att raderas antingen när testperioden slutar eller inom 30 dagar. Vill du ångra raderingen måste du klicka på behåll konto senast kl. 23:45 dagen innan.'"
    :acceptText="'Avbryt'"
    :cancelText="'Radera'"
    @confirm="isConfirmDialog = false"
    @cancel="handleDeleteAccount"
  />

  <main class="p-4 mb-32 lg:mb-0 flex" v-if="!loading">
    <AlertDialog @closeDialog="() => (isAlertDialog = false)" v-if="isAlertDialog" />
    <div class="flex items-center min-w-full mt-6">
      <div class="flex flex-col items-center gap-8 text-main w-full md:gap-10">
        <form
          @submit.prevent=""
          class="max-w-[400px] xl:max-w-[500px] 2xl:max-w-[600px] flex flex-col gap-6 md:gap-16 w-full bg-sky-white drop-shadow-lg p-4 rounded-lg"
        >
          <OpeningHours
            @selectedTimes="(e) => saveSelectedTimes(e)"
            :firstSignIn="!!userData?.firstSignIn"
            :userData="userData?.selectedTimes"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl relative m-auto">
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
                  :predefinedValue="field.value"
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

              <span class="flex gap-2"
                ><button
                  type="button"
                  :class="[
                    'w-5 h-5 border-main rounded-full',
                    whenIsPayment === 'before' && 'border-blue'
                  ]"
                  @click="whenIsPayment = 'before'"
                  aria-label="Välj före jobb"
                ></button>
                <p>Före jobb</p></span
              >
              <span class="flex gap-2"
                ><button
                  type="button"
                  :class="[
                    'w-5 h-5 border-main rounded-full',
                    whenIsPayment === 'after' && 'border-blue'
                  ]"
                  @click="whenIsPayment = 'after'"
                  aria-label="Välj efter jobb"
                ></button>
                <p>Efter jobb</p></span
              >
            </label>
            <label for="addons" class="font-text-light flex flex-col gap-1"
              ><strong>Tillval</strong>
              <p>Erbjuds hyrbil?</p>

              <span class="flex gap-2"
                ><button
                  type="button"
                  :class="[
                    'w-5 h-5 border-main rounded-full',
                    isRentalCar === true && 'border-blue'
                  ]"
                  @click="isRentalCar = true"
                ></button>
                <p>ja</p></span
              >
              <span class="flex gap-2"
                ><button
                  type="button"
                  :class="[
                    'w-5 h-5 border-main rounded-full',
                    isRentalCar === false && 'border-blue'
                  ]"
                  @click="isRentalCar = false"
                ></button>
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
                  :checked="
                    paymentOptions.includes(method.id) ||
                    userData?.paymentOptions.includes(method.id)
                  "
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

            <label for="addons" class="font-text-light flex flex-col gap-1"
              ><strong>Abonnemang</strong>

              <span class="flex gap-2"
                ><button
                  type="button"
                  :class="[
                    'w-5 h-5 border-main rounded-full',
                    isSubscriptionType === 'core' && 'border-blue'
                  ]"
                  @click="isSubscriptionType = 'core'"
                ></button>
                <p>Core</p></span
              >
              <span class="flex gap-2"
                ><button
                  type="button"
                  :class="[
                    'w-5 h-5 border-main rounded-full',
                    isSubscriptionType === 'premium' && 'border-blue'
                  ]"
                  @click="isSubscriptionType = 'premium'"
                  :disabled="
                    !!userData?.nextFeeDate &&
                    new Date() <= new Date(userData?.nextFeeDate?.seconds * 1000)
                  "
                ></button>
                <p>
                  {{
                    !!userData?.nextFeeDate
                      ? `Låst till ${formatDate(new Date(userData?.nextFeeDate?.seconds * 1000))}`
                      : 'Premium'
                  }}
                </p></span
              >
            </label>

            <div class="relative">
              <button
                type="submit"
                :disabled="isBtnDisabled"
                :class="[
                  'mb-2 w-full absolute',
                  isBtnDisabled ? 'main-btn-disabled text-secondary' : 'main-btn'
                ]"
                @click="handleSave"
              >
                Spara
              </button>
            </div>
          </div>
        </form>

        <div
          class="max-w-[400px] xl:max-w-[500px] 2xl:max-w-[600px] flex flex-col gap-6 w-full mt-16 md:flex-row"
        >
          <button
            type="button"
            :class="[
              'w-full',
              !isKeepAccountDisabled || (newPaymentDate && new Date() < newPaymentDate)
                ? 'main-btn-disabled'
                : 'main-btn'
            ]"
            @click="isConfirmDialog = true"
            :disabled="!isKeepAccountDisabled || (newPaymentDate && new Date() < newPaymentDate)"
          >
            {{
              newPaymentDate && new Date() < newPaymentDate
                ? `Inaktiverad till ${formatDate(newPaymentDate)}`
                : 'Radera konto'
            }}
          </button>

          <button
            type="button"
            :class="[
              'w-full',
              isKeepAccountDisabled ? 'main-btn-disabled text-secondary' : 'main-btn'
            ]"
            @click="handleCancelDelete"
            :disabled="isKeepAccountDisabled"
          >
            Behåll konto
          </button>
        </div>

        <p>
          Behöver du akut hjälp? Kontakta oss på
          <a href="tel: +46703800102" class="underline">070 380 01 02</a>
        </p>
        <p class="flex gap-1">
          <strong>Kontakt:</strong>
          <a href="mailto:info@fixmatch.se" class="underline">info@fixmatch.se</a>
        </p>
      </div>
    </div>

    <div class="spinner-component" v-if="isLoading || loading">
      <LoadingSpinner />
      <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
    </div>
  </main>
</template>
