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
  }
})

// const emit = defineEmits<{
//   (
//     e: 'vechicleData',
//     fuelType: string,
//     transmission: string,
//     make: string,
//     modelDescription: string
//   ): void
// }>()

const registrationNumber = ref(props.modelValue || '')
// const errorMessage = ref('')

const isRegistrationNumberValid = ref(true)
const showWrongRegistrationNumber = ref(false)
// const isLoading = ref(false)

// const vehicleData = ref<VehicleData>()

function controlRegistrationNumber(value: string) {
  const registrationRegex = /^[A-Z]{3}\s?([0-9]{3}|[0-9]{2}[A-Z])$/
  showWrongRegistrationNumber.value = !registrationRegex.test(value)

  // if (!showWrongRegistrationNumber.value) fetchVehicleData()
}

function handleChange() {
  const registrationRegex = /^[A-Z]{3}\s?([0-9]{3}|[0-9]{2}[A-Z])$/
  isRegistrationNumberValid.value = registrationRegex.test(registrationNumber.value)

  props.checkInputData('isRegistrationNumber')
  props.inputData(isRegistrationNumberValid.value ? registrationNumber.value : '')
}

const formatRegistrationNumber = () => {
  let formattedValue = registrationNumber.value.replace(/\s/g, '').toUpperCase()

  if (formattedValue.length > 3) {
    formattedValue = formattedValue.slice(0, 3) + ' ' + formattedValue.slice(3)
  }

  registrationNumber.value = formattedValue

  handleChange()
}

// const fetchVehicleData = async () => {
//   if (!registrationNumber.value) return

//   isLoading.value = true
//   errorMessage.value = ''

//   try {
//     const response = await fetch('http://localhost:3000/vehicle/fetchVehicleData', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         registrationNumber: registrationNumber.value
//       })
//     })

//     const data = await response.json()

//     if (!data.success) {
//       throw new Error(data.error || 'Failed to fetch vehicle data')
//     }

//     vehicleData.value = data.data

//     emit(
//       'vechicleData',
//       vehicleData.value?.fuelType as string,
//       vehicleData.value?.transmission as string,
//       vehicleData.value?.make as string,
//       vehicleData.value?.modelDescription as string
//     )

//   } catch (error) {
//     console.error('Error:', error)
//     errorMessage.value = error instanceof Error ? error.message : 'Failed to fetch vehicle data'
//   } finally {
//     isLoading.value = false
//   }
// }

watch(
  () => props.modelValue,
  (newValue) => {
    registrationNumber.value = newValue
  }
)
</script>

<template>
  <label for="registrationNumber" class="font-text-light flex flex-col gap-1 w-full"
    ><span>Registreringsnummer</span>
    <input
      type="text"
      name="registrationNumber"
      placeholder="ABC 123"
      v-model="registrationNumber"
      @input="formatRegistrationNumber"
      :class="[
        'w-full text-input-light px-2 text-sm',
        showWrongRegistrationNumber && 'input-warning-light'
      ]"
      maxlength="7"
      @blur="(e) => controlRegistrationNumber((e.target as HTMLInputElement).value)"
    />
    <p
      class="text-warning-orange font-text-light flex gap-2 items-center"
      v-if="showWrongRegistrationNumber"
    >
      <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />Ange ett
      giltigt registreringsnummer!
    </p>
  </label>

  <!-- <div class="w-full rounded-[10px] border-gr-blue p-4" v-if="vehicleData && !errorMessage">
    <strong>{{ vehicleData.make }}</strong>

    <div class="flex gap-2">
      <p v-if="vehicleData.modelDescription">{{ vehicleData.modelDescription }}</p>
      <p v-if="registrationNumber && vehicleData.modelDescription">|</p>
      <p v-if="registrationNumber">{{ registrationNumber }}</p>
      <p v-if="vehicleData.fuelType">|</p>
      <p v-if="vehicleData.fuelType">{{ vehicleData.fuelType }}</p>
      <p v-if="vehicleData.transmission">|</p>
      <p v-if="vehicleData.transmission">{{ vehicleData.transmission }}</p>
    </div>
  </div> -->
</template>
