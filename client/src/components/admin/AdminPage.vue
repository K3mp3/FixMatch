<script setup lang="ts">
import type { IRepairShop } from '@/models/IRepairShop'
import { deleteRepairShop, fetchRepairShops, saveRepairShop } from '@/services/admin'
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'
import LoadingSpinner from '../assets/LoadingSpinner.vue'
import ConfirmDialog from '../dialogs/ConfirmDialog.vue'
import ResponseDialog from '../dialogs/ResponseDialog.vue'
import SignedInNav from '../nav/SignedInNav.vue'
import CustomSelect from '../utils/CustomSelect.vue'
import { swedishKommunes } from '../utils/SwedishKommunes'
import TextInput from '../utils/TextInput.vue'

const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)

const isLoading = ref(true)
const isEmailValid = ref(true)
const isBtnDisabled = ref(true)

const showResponseDialog = ref(false)
const isConfirmationSuccess = ref(false)
const isConfirmDialog = ref(false)
const showEmailError = ref(false)
const islocationValid = ref(false)
const showIsDuplicateEmail = ref(false)
const showInputWarning = ref(false)

const responseDialogText = ref('')
const repairShopToDelete = ref('')
const email = ref('')
const name = ref('')
const location = ref('')

const repairShops = ref<IRepairShop[]>([])

const userData = computed(() => {
  if (user.value) {
    return {
      admin: user.value.admin
    }
  }
  return null
})

async function handleDelete() {
  isLoading.value = true
  isConfirmDialog.value = false

  const user = {
    email: repairShopToDelete.value
  }

  try {
    const response = await deleteRepairShop(user)

    if (response === 200) {
      isLoading.value = false

      isConfirmationSuccess.value = true
      responseDialogText.value = 'Verkstad raderad'
      showResponseDialog.value = true
    }
  } catch (error) {
    isLoading.value = false

    isConfirmationSuccess.value = false
    responseDialogText.value = 'Verkstad kunde ej raderas'
    showResponseDialog.value = true
  } finally {
    await fetchRepairShops()

    repairShops.value = repairShops.value.filter((shop) => shop.email !== repairShopToDelete.value)

    setTimeout(() => {
      showResponseDialog.value = false
    }, 4000)
  }
}

function checkInputData() {
  const isDuplicate = repairShops.value.some(
    (shop) => shop.email.toLowerCase() === email.value.trim().toLowerCase()
  )

  isBtnDisabled.value =
    !isEmailValid.value ||
    email.value.trim() === '' ||
    !islocationValid.value ||
    isDuplicate ||
    name.value.trim() === ''
}

function checkInputsData(key: string, value?: string) {
  nextTick(() => {
    if (key === 'isEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      isEmailValid.value = emailRegex.test(email.value.trim())

      const isDuplicate = repairShops.value.some(
        (shop) => shop.email.toLowerCase() === email.value.trim().toLowerCase()
      )

      showIsDuplicateEmail.value = isDuplicate
      showInputWarning.value = isDuplicate
    } else if (key === 'isLocation') {
      if (value !== undefined) {
        location.value = value
      }
      islocationValid.value = location.value.trim() !== ''
    }

    checkInputData()
  })
}

function validateEmail() {
  if (email.value === '') isEmailValid.value = false
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showEmailError.value = true
    isEmailValid.value = false
    showInputWarning.value = true
  } else {
    showEmailError.value = false
    isEmailValid.value = true
    showInputWarning.value = false
  }

  const isDuplicate = repairShops.value.some(
    (shop) => shop.email.toLowerCase() === email.value.trim().toLowerCase()
  )

  showInputWarning.value = isDuplicate

  checkInputData()
}

async function handleSave() {
  isLoading.value = true

  const repairShop = {
    email: email.value,
    name: name.value,
    location: location.value
  }

  try {
    const response = await saveRepairShop(repairShop)

    if (response === 201) {
      isLoading.value = false

      isConfirmationSuccess.value = true
      responseDialogText.value = 'Verkstad sparad'
      showResponseDialog.value = true
    }
  } catch (error) {
    isLoading.value = false

    isConfirmationSuccess.value = false
    responseDialogText.value = 'Verkstad kunde ej raderas'
    showResponseDialog.value = true
  } finally {
    const response = await fetchRepairShops()
    repairShops.value = response.data

    setTimeout(() => {
      showResponseDialog.value = false
    }, 4000)
  }
}

watch(
  [loading, userData],
  async ([newLoading, newUserData]) => {
    if (!newLoading && newUserData) {
      if (!newUserData?.admin) {
        authStore.signOut()
      } else {
        try {
          const response = await fetchRepairShops()

          if (response === 404) {
            isLoading.value = false
            return
          }

          repairShops.value = response.data

          isLoading.value = false
        } catch (error) {
          console.error('Error fetching repair shops:', error)
          isLoading.value = false
        }
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <SignedInNav :admin="true" highlight="home" />

  <div class="spinner-component" v-if="isLoading || loading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <main class="p-4 lg:p-16 w-full min-h-screen mb-24" v-else>
    <ResponseDialog
      v-if="showResponseDialog"
      :isConfirmationSuccess="isConfirmationSuccess"
      :text="responseDialogText"
    />

    <ConfirmDialog
      v-if="isConfirmDialog"
      :type="'warning'"
      :icon="['fas', 'triangle-exclamation']"
      :headline="'Varning'"
      :message="'Vill du verkligen radera denna verkstad?'"
      :acceptText="'Ja'"
      :cancelText="'Avbryt'"
      @confirm="handleDelete"
      @cancel="isConfirmDialog = !isConfirmDialog"
    />

    <section
      class="w-full max-w-[710px] 2xl:max-w-[820px] m-auto flex flex-col xl:flex-row gap-10 justify-center items-start"
    >
      <form
        @submit.prevent="handleSave"
        class="rounded-lg border-main p-4 flex flex-col gap-4 w-full max-w-[450px] bg-sky-gray"
      >
        <strong>Lägg till verkstad</strong>

        <label for="location" class="font-text-light flex flex-col gap-1">
          <span>E-mailadress</span>
          <TextInput
            :checkInputData="checkInputsData"
            :inputData="(e: string) => (email = e)"
            :inputType="'email'"
            :inputName="'isEmail'"
            :isDataCorrect="!showInputWarning"
            :dataError="'validation'"
            placeholder="namn@dinmail.se"
            @blur="validateEmail"
          />

          <p v-if="showEmailError" class="text-warning-orange">
            <fontAwesome :icon="['fas', 'triangle-exclamation']" class="mr-1" /><span
              >Vänligen skriv en giltig e-mailadress!</span
            >
          </p>

          <p v-if="showIsDuplicateEmail" class="text-warning-orange">
            <fontAwesome :icon="['fas', 'triangle-exclamation']" class="mr-1" /><span
              >Denna e-mailadress finns redan sparad</span
            >
          </p>
        </label>

        <label for="location" class="font-text-light flex flex-col gap-1">
          <span>Namn</span>
          <TextInput
            :checkInputData="checkInputsData"
            :inputData="(e: string) => (name = e)"
            :inputType="'text'"
            :inputName="'isName'"
            :isDataCorrect="!showInputWarning"
            :dataError="'validation'"
            placeholder="verkstadsnamn"
          />
        </label>

        <label for="location" class="font-text-light flex flex-col gap-1">
          <span>Kommun</span>
          <CustomSelect
            :checkInputData="checkInputsData"
            :inputData="
              (e: string) => {
                location = e
                checkInputsData('isLocation', e)
              }
            "
            :inputName="'isLocation'"
            :options="swedishKommunes || []"
            class="select"
          />
        </label>

        <button
          type="submit"
          :class="['mt-6', isBtnDisabled ? 'main-btn-disabled' : 'main-btn']"
          :disabled="isBtnDisabled"
        >
          Spara
        </button>
      </form>

      <div
        v-if="repairShops.length > 0"
        class="p-4 rounded-lg border-main w-full max-w-[450px] bg-sky-gray"
      >
        <strong>Verkstäder</strong>
        <ul class="text-main flex flex-col gap-4 mt-4">
          <li v-for="shop in repairShops" :key="shop.id">
            <div class="flex flex-col gap-2">
              <p>
                {{ shop.email }}
              </p>
              <p>{{ shop.name }}</p>
              <p class="text-third">{{ shop.location }}</p>
            </div>
            <button
              type="button"
              class="border-button w-full mt-4"
              @click="
                () => {
                  isConfirmDialog = true
                  repairShopToDelete = shop.email
                }
              "
            >
              Radera
            </button>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
