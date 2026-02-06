<script setup lang="ts">
import { useSEO } from '@/composables/useSeo'
import type { IMessage } from '@/models/IMessage'
import { contactUs } from '@/services/contactUs'
import { onMounted, ref } from 'vue'
import LoadingSpinner from '../assets/LoadingSpinner.vue'
import LandingFooter from '../footer/LandingFooter.vue'
import LandingNav from '../nav/LandingNav.vue'
import ContactMobile from './ContactMobile.vue'
import ContactTablet from './ContactTablet.vue'

useSEO({
  title: 'Kontakt - FixMatch',
  description: 'Kontakta oss på FixMatch om du har några funderingar, frågor eller kanske idéer.',
  url: 'https://fixmatch.se/contact',
  keywords: 'bilverkstad, bilservice, reparation, offert, fixmatch'
})

const mobile = ref(true)

const isConfirmationSuccess = ref(false)
const isLoading = ref(false)
const showResponseDialog = ref(false)

const responseDialogText = ref()

function updateScreenSize() {
  window.addEventListener('resize', updateScreenSize)

  if (document.documentElement.clientWidth < 640) mobile.value = true
  else mobile.value = false
}

const handleMessage = async (messageData: IMessage) => {
  isLoading.value = true
  const response = await contactUs(messageData)

  if (response === 201) {
    isLoading.value = false
    isConfirmationSuccess.value = true
    responseDialogText.value = 'Meddelandet har skickats'
    showResponseDialog.value = true

    setTimeout(() => {
      showResponseDialog.value = false
      isLoading.value = false
    }, 4000)
  } else if (response === 500) {
    isLoading.value = false
    isConfirmationSuccess.value = false
    responseDialogText.value = 'Meddelandet kunde ej skickas'
    showResponseDialog.value = true

    setTimeout(() => {
      showResponseDialog.value = false
      isLoading.value = false
    }, 4000)
  }
}

onMounted(() => {
  updateScreenSize()
})
</script>

<template>
  <header class="flex flex-col gap-24 lg:gap-36 items-center bg-blue-500">
    <nav class="w-full fixed z-10">
      <LandingNav :backgroundColor="true" />
    </nav>
  </header>

  <main class="flex justify-center">
    <section
      class="gap-4 sm:gap-5 xl:gap-8 p-4 sm:p-6 xl:p-8 w-[90vw] lg:h-[600px] flex flex-col text-center items-center lg:mt-[202px] z-[1] mt-4 mb-6 lg:mb-[120px] bg-sky-white rounded-2xl drop-shadow-lg"
    >
      <ContactMobile v-if="mobile" @handleMessage="handleMessage" />
      <ContactTablet v-else @handleMessage="handleMessage" />

      <div class="spinner-component" v-if="isLoading">
        <LoadingSpinner />
        <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
      </div>

      <!-- <ResponseDialog
        v-if="showResponseDialog"
        :isConfirmationSuccess="isConfirmationSuccess"
        :title="responseDialogTitle"
      /> -->
    </section>
  </main>

  <footer>
    <LandingFooter />
  </footer>
</template>
