<script setup lang="ts">
import LoadingSpinner from '@/components/assets/LoadingSpinner.vue'
import { useSEO } from '@/composables/useSeo'
import { contactRepairShops } from '@/services/userContact'
import type { SelectedJobType } from '@/types/selectedJobType'
import { computed, nextTick, onMounted, ref, watch, type Ref } from 'vue'
import ResponseDialog from '../dialogs/ResponseDialog.vue'
import LandingFooter from '../footer/LandingFooter.vue'
import NavParent from '../nav/VehicleOwnerNav/NavParent.vue'
import RegistrationNumberInput from '../utils/RegistrationNumberInput.vue'
import TextInput from '../utils/TextInput.vue'
import LocationSelect from './LocationSelect.vue'
import SelectedJobs from './SelectedJobs.vue'
import SelectedWorkType from './SelectedWorkType.vue'
import WorkTypeSelect from './WorkTypeSelect.vue'

useSEO({
  title: 'Skapa uppdrag - FixMatch',
  description: 'Skapa uppdrag till verkstäder över vad du behöver hjälp med på ditt fordon.',
  url: 'https://fixmatch.se/get-offers',
  keywords: 'bilverkstad, bilservice, reparation, offert, fixmatch'
})

const location = ref('')
const typeOfWork = ref('')
const registrationNumber = ref('')
const email = ref('')
const responseText = ref('')
const setGearType = ref('')
const responseTitle = ref('')

const isLoading = ref(false)
const isConfirmation = ref(false)
const isConfirmationError = ref(false)
const isBtnDisabled = ref(true)
const isLargeScreen = ref(false)
const showEmailError = ref(false)
const isEmailValid = ref(true)

const selectedWork = ref<SelectedJobType[]>([])
// const vehicleData = ref<VehicleData>()

const inputsArray: { key: string; value: boolean }[] = [
  { key: 'isLocation', value: false },
  { key: 'isRegistrationNumber', value: false },
  { key: 'isTypeOfWork', value: false },
  { key: 'isEmail', value: false },
  { key: 'isGearType', value: false }
]

let width = document.documentElement.clientWidth

function checkInputData() {
  isBtnDisabled.value = !(inputsArray.every((field) => field.value) && isEmailValid.value)
}

function checkInputsData(confirmKey: string) {
  nextTick(() => {
    let refVariable: Ref<string> | null = null
    switch (confirmKey) {
      case 'selectedWork':
        refVariable = typeOfWork
        break
      case 'isLocation':
        refVariable = location
        break
      case 'isRegistrationNumber':
        refVariable = registrationNumber
        break
      case 'isEmail':
        {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          isEmailValid.value = emailRegex.test(email.value.trim())
        }
        refVariable = email
        break
      case 'isGearType':
        {
          const index = inputsArray.findIndex((field) => field.key === 'isGearType')

          if (index !== -1) {
            inputsArray[index].value = setGearType.value !== ''
          }
        }
        refVariable = setGearType
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

function validateEmail() {
  if (email.value === '') return
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showEmailError.value = true
    isEmailValid.value = false
  } else {
    showEmailError.value = false
    isEmailValid.value = true
  }
}

function updateScreenSize() {
  window.addEventListener('resize', updateScreenSize)
  width = document.documentElement.clientWidth

  if (width > 699) {
    isLargeScreen.value = true
  } else {
    isLargeScreen.value = false
  }
}

const messageData = computed(() => {
  const currentDate = new Date()
  let validDate = new Date(currentDate.getTime() + 48 * 60 * 60 * 1000)

  const dayOfWeek = currentDate.getDay()

  if (dayOfWeek === 5) {
    validDate = new Date(currentDate.setDate(currentDate.getDate() + (8 - dayOfWeek)))
    validDate.setHours(0, 0, 0, 0)
    validDate.setHours(validDate.getHours() + 48)
  } else if (dayOfWeek === 6) {
    validDate = new Date(currentDate.setDate(currentDate.getDate() + (8 - dayOfWeek)))
    validDate.setHours(0, 0, 0, 0)
    validDate.setHours(validDate.getHours() + 48)
  } else if (dayOfWeek === 0) {
    validDate = new Date(currentDate.setDate(currentDate.getDate() + (8 - dayOfWeek)))
    validDate.setHours(0, 0, 0, 0)
    validDate.setHours(validDate.getHours() + 48)
  }

  return {
    email: email.value,
    location: location.value,
    registrationNumber: registrationNumber.value,
    gearType: setGearType.value,
    customerMessage: selectedWork.value.map((work) => ({
      id: '',
      work: work[0].join(', '),
      message: work[1],
      type: work[2],
      mileage: work[4],
      selectedBrakes: work[3]
    })),
    date: new Date(),
    validDate
  }
})

function deleteWork(work: string) {
  const updatedArray = selectedWork.value.filter((entry) => entry[2] !== work)
  selectedWork.value = updatedArray

  if (updatedArray.length === 0) typeOfWork.value = ''
}

function showConfirmationBox(response: any) {
  if (response.status === 201) {
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

// const saveVehicleData = (
//   fuelType: string,
//   transmission: string,
//   make: string,
//   modelDescription: string
// ) => {
//   const data: VehicleData = {
//     fuelType: fuelType,
//     transmission: transmission,
//     make: make,
//     modelDescription: modelDescription
//   }

//   vehicleData.value = data
// }

const handleMessage = async () => {
  isLoading.value = true

  try {
    const response = await contactRepairShops(messageData.value)

    isLoading.value = false
    inputsArray.forEach((field) => {
      field.value = false
    })
    isBtnDisabled.value = true
    responseTitle.value = 'Förfrågan skickad'
    responseText.value =
      'Ditt uppdrag skickas nu till verkstäder som inom kort svarar med en offert'
    showConfirmationBox(response)
  } catch (error) {
    setTimeout(() => {
      isLoading.value = false
      responseTitle.value = 'Förfrågan kunde ej skickas!'
      responseText.value =
        'Tyvärr kunde inte din förfrågan skickas. Vi ber om ursäkt för det. Testa gärna igen om en stund'
      showConfirmationBox(500)
    }, 5000)
  } finally {
    selectedWork.value = []
    setGearType.value = ''
    location.value = ''
    registrationNumber.value = ''
    email.value = ''
  }
}

function checkWorkTypeArray(
  values: string[],
  textInput: string,
  mileage: number,
  type: string,
  selectedBrakes: string,
  key: string[]
) {
  checkInputsData('isTypeOfWork')
  typeOfWork.value = type

  nextTick(() => {
    typeOfWork.value = ''
    const index = selectedWork.value.findIndex((entry) => entry[2] === type)

    if (index !== -1) {
      if (key.includes('radio')) {
        selectedWork.value[index][0] = values
        selectedWork.value[index][1] = textInput
      }

      const newValues = values.filter((value) => !selectedWork.value[index][0].includes(value))
      selectedWork.value[index][0].push(...newValues)
    } else {
      selectedWork.value.push([values, textInput, type, selectedBrakes, mileage])
    }
  })
}

watch(
  selectedWork,
  (newValue) => {
    const hasSelectedJobs = newValue.length > 0

    const typeOfWorkIndex = inputsArray.findIndex((field) => field.key === 'isTypeOfWork')

    if (typeOfWorkIndex !== -1) inputsArray[typeOfWorkIndex].value = hasSelectedJobs

    checkInputData()
  },
  { deep: true }
)

onMounted(() => {
  updateScreenSize()
})
</script>

<template>
  <header class="flex flex-col gap-24 lg:gap-36 items-center">
    <nav class="w-full fixed z-10">
      <NavParent :backgroundColor="true" />
    </nav>

    <!-- <CookieDialog v-if="!isCookieAccepted" @close-dialog="isCookieAccepted = true" /> -->

    <!-- <GlobeVisualization /> -->

    <section
      class="gap-4 sm:gap-5 xl:gap-8 p-4 sm:p-6 lg:p-16 flex flex-col text-center items-center lg:mt-[202px] z-[1] mt-4 mb-6 rounded-2xl bg-sky-white drop-shadow-lg"
    >
      <div class="new-request-surrounding-container text-start flex flex-col items-center w-full">
        <div class="w-full max-w-[500px] m-auto">
          <div class="flex gap-4 items-center">
            <RouterLink to="/" class="btn-back-light z-10" aria-label="Gå tillbaka"
              ><fontAwesome :icon="['fas', 'chevron-left']"
            /></RouterLink>

            <h2 class="text-xl sm:text-2xl">Kontakta verkstäder</h2>
          </div>

          <form @submit.prevent="handleMessage" class="flex flex-col gap-4 max-w-full lg:mb-2">
            <div class="flex flex-col gap-4 mb-2">
              <div class="grid grid-cols-1 gap-4 mt-8">
                <SelectedJobs
                  v-for="(work, index) in selectedWork"
                  :key="index"
                  :work="work"
                  @deleteWork="deleteWork"
                />
              </div>

              <WorkTypeSelect
                :selectData="(e: string) => (typeOfWork = e)"
                :selectedWork="selectedWork"
              />

              <SelectedWorkType
                v-if="typeOfWork !== ''"
                :key="typeOfWork"
                :selectedWorkType="typeOfWork"
                :selectedWork="selectedWork"
                @selectedWorkTypeArray="checkWorkTypeArray"
              />
            </div>

            <p class="text-main">Typ av växellåda</p>
            <div class="flex gap-2">
              <button
                type="button"
                :class="[
                  'w-5 h-5 border-main rounded-full',
                  setGearType === 'auto' && 'border-light-blue'
                ]"
                @click="(setGearType = 'auto'), checkInputsData('isGearType')"
              ></button>
              <p>Automatisk</p>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                :class="[
                  'w-5 h-5 border-main rounded-full',
                  setGearType === 'manual' && 'border-light-blue'
                ]"
                @click="(setGearType = 'manual'), checkInputsData('isGearType')"
              ></button>
              <p>Manuell</p>
            </div>

            <LocationSelect
              :checkInputData="(e: string) => checkInputsData(e)"
              :selectData="(e: string) => (location = e)"
              :selectedLocation="location"
            />

            <RegistrationNumberInput
              :checkInputData="(e: string) => checkInputsData(e)"
              :inputData="(e: string) => (registrationNumber = e)"
              :modelValue="registrationNumber"
            />
            <!-- @vehicleData="saveVehicleData" -->

            <label for="email" class="font-text-light flex flex-col gap-1"
              ><span>E-mailadress</span>
              <TextInput
                :checkInputData="(e: string) => checkInputsData(e)"
                :inputData="(e: string) => (email = e)"
                :inputType="'email'"
                :inputName="'isEmail'"
                :isDataCorrect="!showEmailError"
                :dataError="'validation'"
                placeholder="namn@dinmail.se"
                @blur="validateEmail"
                :modelValue="email"
                :light="true"
              />
              <p v-if="showEmailError" class="text-warning-orange">
                <fontAwesome :icon="['fas', 'triangle-exclamation']" class="mr-1" /><span
                  >Vänligen ange en giltig email adress!</span
                >
              </p>
            </label>

            <p class="text-third">
              OBS! För att kunna se historiken över alla skickade uppdrag måste du skapa ett konto
              med samma e-mailadress som du angivit vid uppdragen.
            </p>

            <p class="text-third">
              Du ser dina svar som tidigast 48 timmar efter under fliken mina jobb när du är
              inloggad.
            </p>

            <p class="text-third">
              OBS!! När du skapar ett uppdrag godkänner du våra användavilkor. Du kan läsa mer om
              dessa
              <RouterLink to="/user-agreement" class="underline font-title-bold">här</RouterLink>
            </p>

            <button
              type="submit"
              :disabled="isBtnDisabled"
              :class="[
                isBtnDisabled ? 'main-btn-disabled mt-5 mb-9 text-secondary' : 'main-btn mt-5 mb-9'
              ]"
            >
              Skicka
            </button>
          </form>
        </div>
      </div>
    </section>
  </header>
  <main>
    <div class="spinner-component" v-if="isLoading">
      <LoadingSpinner />
      <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
    </div>

    <ResponseDialog
      v-if="isConfirmation || isConfirmationError"
      :isConfirmationSuccess="isConfirmation"
      :title="responseTitle"
      :text="responseText"
    />
  </main>
  <footer>
    <LandingFooter />
  </footer>
</template>
