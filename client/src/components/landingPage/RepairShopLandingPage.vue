<script setup lang="ts">
import { useSEO } from '@/composables/useSeo'
import type { IMessage } from '@/models/IMessage'
import { contactFromRepairShop } from '@/services/contactUs'
import Cookies from 'js-cookie'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import GeneralFooter from '../footer/GeneralFooter.vue'
import NavParent from '../nav/RepairShop/NavParent.vue'
import PricingPlans from '../pricing/PricingPlans.vue'
import VisualGraph from '../styling/VisualGraph.vue'
import SwedishPhoneInput from '../utils/SwedishPhoneInput.vue'
import FaqParent from './FaqParent.vue'

useSEO({
  title: 'Väx din verkstad med Vayme - Få fler kunder till lägre kostnad',
  description:
    'Få fler kunder, optimera er kapacitet och öka er omsättning med vår kostnadseffektiva plattform som kopplar samman fordonägare med verkstäder. Gratis de första 4 månaderna.',
  url: 'https://vayme.se/repair-shop',
  keywords:
    'bilverkstad, verkstadskunder, bilreparation, verkstadspartner, vayme, bilservice, verkstadstjänster, fordonreparation',
  image: 'https://vayme.se/repair_shop_seo.webp'
})

const isCookieAccepted = ref(false)
const isLoading = ref(false)

const mobile = ref(true)
const phoneNumberValid = ref(true)

const repairShopName = ref('')
const userName = ref('')
const userEmail = ref('')
const phoneNumber = ref('')

if (Cookies.get('acceptedCookies') === 'true') isCookieAccepted.value = true

const updateScreenSize = () => {
  window.addEventListener('resize', updateScreenSize)

  if (document.documentElement.clientWidth < 640) mobile.value = true
  else mobile.value = false
}

const scrollToContact = () => {
  const contactSection = document.getElementById('contact-section')

  if (contactSection) {
    contactSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

const checkPhoneInputData = (inputName: string, value: string) => {
  if (inputName === 'phoneNumber') {
    phoneNumberValid.value = value !== ''
  }
}

const handlePhoneInputData = (value: string) => {
  phoneNumber.value = value
}

const handleMessage = async () => {
  isLoading.value = true

  const data: IMessage = {
    repairShopName: repairShopName.value,
    userName: userName.value,
    userEmail: userEmail.value,
    phoneNumber: phoneNumber.value
  }

  try {
    const response = await contactFromRepairShop(data)
    if (response === 201) isLoading.value = false
    ;(repairShopName.value = ''),
      (userName.value = ''),
      (userEmail.value = ''),
      (phoneNumber.value = '')
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  updateScreenSize()
})
</script>

<template>
  <header class="flex flex-col bg-sky-blue-gr">
    <nav class="w-full fixed z-10">
      <NavParent />
    </nav>

    <!-- <CookieDialog v-if="!isCookieAccepted" @close-dialog="isCookieAccepted = true" /> -->

    <!-- <GlobeVisualization /> -->

    <section
      class="gap-4 sm:gap-5 xl:gap-8 p-4 sm:p-6 xl:p-8 flex flex-col items-center m-auto w-full max-w-[700px] lg:mt-[134px] z-[1] mt-4 mb-6 lg:mb-[134px] text-center"
    >
      <h1 class="text-2xl font-title-bold sm:text-4xl xl:text-6xl text-secondary r">
        Väx din verkstad med FixMatch
      </h1>
      <p class="sm:text-lg xl:text-xl text-secondary font-medium">
        Få fler kunder, optimera er kapacitet och öka er omsättning med vår kostnadseffektiva
        plattform som kopplar samman fordonägare med verkstäder.
      </p>

      <div class="flex flex-col lg:flex-row gap-4 w-full">
        <RouterLink
          to="/register-repair-shop"
          class="w-full flex justify-center items-center secondary-btn-white-hover font-bold rounded-lg py-7 text-sky-blue"
          aria-label="Testa gratis i 4 månader"
        >
          Testa gratis i 4 månader
        </RouterLink>

        <button
          @click="scrollToContact"
          class="w-full flex justify-center items-center border-button text-secondary font-bold rounded-lg py-3 text-sky-blue"
          aria-label="Boka en demo"
        >
          Boka en demo
        </button>
      </div>
    </section>
  </header>
  <main class="mt-28 sm:mt-20 lg:mt-28 flex flex-col gap-20 lg:gap-28 items-center relative">
    <section class="flex flex-col w-full p-4 gap-4 bg-main max-w-[1200px]">
      <h2 class="text-main text-2xl md:text-4xl font-title-black text-center">
        Varför FixMatch för verkstäder?
      </h2>

      <p class="text-third text-center text-lg mb-8">
        Vi hjälper verkstäder att växa med lägre kostnader
      </p>

      <article class="flex flex-col lg:flex-row gap-16 mt-12 items-top">
        <div class="flex flex-col gap-4 text-center items-center w-full">
          <div
            class="min-w-16 max-w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center"
          >
            <fontAwesome :icon="['fas', 'money-bill-wave']" class="h-6 text-blue-600" />
          </div>

          <h3 class="text-xl md:text-2xl font-black">Låga kostnader</h3>
          <p class="text-third">
            Betala mindre än hos våra konkurrenter. Dessutom gratis de fyra första månaderna
          </p>
        </div>

        <div class="flex flex-col gap-4 text-center items-center w-full">
          <div
            class="min-w-16 max-w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center"
          >
            <fontAwesome :icon="['fas', 'user-group']" class="h-6 text-orange-600" />
          </div>

          <h3 class="text-xl md:text-2xl font-black">Fler kunder</h3>
          <p class="text-third">Nå ut till fler kunder utan extra kostnader</p>
        </div>

        <div class="flex flex-col gap-4 text-center items-center w-full">
          <div
            class="min-w-16 max-w-16 h-16 rounded-full bg-green-200 flex items-center justify-center"
          >
            <fontAwesome :icon="['fas', 'user-group']" class="h-6 text-green-600" />
          </div>

          <h3 class="text-xl md:text-2xl font-black">Direkta förfrågningar</h3>
          <p class="text-third">
            Få kvalificerade förfrågningar direkt från kunder som behöver er service
          </p>
        </div>
      </article>
    </section>

    <PricingPlans />

    <div class="flex flex-col gap-4 w-full max-w-[410px] sm:max-w-[510px] lg:max-w-[610px] p-4">
      <FaqParent :repairShop="true" />
    </div>

    <div class="w-full max-w-[410px] sm:max-w-[510px] lg:max-w-[610px] p-4">
      <VisualGraph />

      <RouterLink
        to="/price-plans"
        class="main-btn text-secondary flex justify-center items-center max-w-40 m-auto mt-8"
        aria-label="Registrera verkstad"
        >Bli partner</RouterLink
      >
    </div>

    <section id="contact-section" class="p-4 flex flex-col gap-2 w-full max-w-[750px]">
      <h2 class="text-main text-2xl md:text-4xl font-title-black text-center">Kontakta oss</h2>

      <p class="text-third text-center text-lg mb-4">Vi hjälper er att komma igång</p>

      <section class="flex flex-col lg:flex-row gap-4 lg:gap-16 mt-2">
        <div class="w-full">
          <strong class="text-lg mb-2">Få mer information</strong>

          <form @submit.prevent="handleMessage" class="flex flex-col min-w-full gap-6">
            <label for="isName" class="font-text-light flex flex-col gap-1 text-start min-w-full"
              ><span>Verkstadens namn</span>
              <input
                type="text"
                placeholder="Min verkstad AB"
                class="text-input-light p-2"
                v-model="repairShopName"
                required
              />
            </label>

            <label for="isName" class="font-text-light flex flex-col gap-1 text-start"
              ><span>Ditt namn</span>
              <input
                type="text"
                placeholder="Andrey Johansson"
                class="text-input-light p-2"
                v-model="userName"
                required
              />
            </label>

            <label for="isName" class="font-text-light flex flex-col gap-1 text-start"
              ><span>E-mail</span>
              <input
                type="email"
                placeholder="minverkstad@mail.se"
                class="text-input-light p-2"
                v-model="userEmail"
                required
              />
            </label>

            <SwedishPhoneInput
              :checkInputData="checkPhoneInputData"
              :inputData="handlePhoneInputData"
              :modelValue="phoneNumber"
              placeholder="070 000 11 22"
              label="Telefonnummer"
              inputName="phoneNumber"
            />

            <button type="submit" class="main-btn rounded-lg">Skicka</button>
          </form>
        </div>

        <div class="flex flex-col gap-2 mt-4 w-full">
          <strong class="text-lg mb-2">Kontaktuppgifter</strong>

          <a href="mailto:info@fixmatch.se" class="text-main flex gap-2 items-center mb-2 underline"
            ><fontAwesome :icon="['fas', 'envelope']" class="text-blue-600" />info@vayme.se</a
          >

          <strong class="text-lg mt-2">Kontakt för verkstäder</strong>
          <p class="text-third">
            Vi svarar på e-mail inom 24 timmar <br />
            Skicka gärna era frågor via formuläret
          </p>
        </div>
      </section>
    </section>
  </main>

  <footer class="mt-16 sm:mt-20 lg:mt-28">
    <GeneralFooter />
  </footer>
</template>

<style scoped>
:deep(.news-content h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

:deep(.news-content p) {
  margin-bottom: 1rem;
  line-height: 1.6;
}

:deep(.news-content strong) {
  font-weight: 700;
}

:deep(.news-content em) {
  font-style: italic;
}
</style>
