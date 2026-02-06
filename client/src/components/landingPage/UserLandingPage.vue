<script setup lang="ts">
import { useSEO } from '@/composables/useSeo'
import type { IArticleData } from '@/models/IArticleData'
import { fetchEditorContent } from '@/services/admin'
import Cookies from 'js-cookie'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import LandingFooter from '../footer/LandingFooter.vue'
import NavParent from '../nav/VehicleOwnerNav/NavParent.vue'
import FaqParent from './FaqParent.vue'

useSEO({
  title: 'Fordonsägare - Vayme',
  description:
    'Spara pengar genom att få offerter från flera verkstäder samtidigt. Välj sedan det bästa alternativet.',
  url: 'https://vayme.se',
  keywords:
    'vayme, bilverkstad, bilreparation, hitta verkstad, bilservice, verkstadstjänster, fordonreparation, bilreparationer, verkstadsbooking, bilunderhåll, fordonsservice',
  image: 'https://vayme.se/vehicle_owner_seo.webp'
})

const isCookieAccepted = ref(false)

const newsTitle = ref('')
const latestArticle = ref<IArticleData | null>(null)

if (Cookies.get('acceptedCookies') === 'true') isCookieAccepted.value = true

async function fetchArticles() {
  try {
    const response = await fetchEditorContent()
    if (response?.data?.length > 0) {
      const sortedArticles = [...response.data].sort(
        (a, b) => b.createdAt._seconds - a.createdAt._seconds
      )

      latestArticle.value = sortedArticles[0]

      if (latestArticle.value?.content) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(latestArticle.value.content, 'text/html')
        const titleElement =
          doc.querySelector('h2 strong') || doc.querySelector('h2') || doc.querySelector('p strong')
        if (titleElement) newsTitle.value = titleElement.textContent || 'Senaste nytt'
      }
    }
  } catch (error) {
    console.error('Error fetching news content:', error)
  }
}

onMounted(async () => {
  await fetchArticles()
  loadAdSense()
})
</script>

<template>
  <header class="flex flex-col gap-24 lg:gap-36 items-center bg-sky-blue-gr">
    <nav class="w-full fixed z-10">
      <NavParent />
    </nav>

    <!-- <CookieDialog v-if="!isCookieAccepted" @close-dialog="isCookieAccepted = true" /> -->

    <!-- <GlobeVisualization /> -->

    <section
      class="gap-4 sm:gap-5 xl:gap-8 p-4 sm:p-6 xl:p-8 sm:max-w-[510px] lg:max-w-[610px] flex flex-col text-center items-center w-full max-w-[410px] lg:mt-[202px] z-[1] mt-4 mb-6 lg:mb-40"
    >
      <h1 class="text-2xl font-title-bold sm:text-3xl xl:text-5xl text-secondary">
        Jämför och spara
      </h1>
      <p class="sm:text-lg xl:text-xl text-secondary">
        Jämför priser och spara pengar när bilen ska på verkstad
      </p>

      <RouterLink
        to="/get-offers"
        class="w-[50%] flex justify-center items-center secondary-btn-white-hover font-bold"
        aria-label="'Få offerter"
      >
        Få offerter
      </RouterLink>
    </section>
  </header>
  <main class="mt-28 sm:mt-20 lg:mt-28 flex flex-col gap-20 lg:gap-28 items-center relative">
    <section class="flex flex-col w-full p-4 gap-8 bg-main max-w-[1000px]">
      <h2 class="text-main text-2xl md:text-4xl font-title-black text-center">Hur fungerar det?</h2>
      <div class="w-24 rounded-full h-2 bg-sky-blue mt-[-24px] m-auto"></div>

      <p class="text-third text-center">
        Vi gör det enkelt att få hjälp med din bil. Följ bara dessa tre enkla steg.
      </p>

      <div class="flex flex-col gap-12 lg:flex-row w-full">
        <div
          class="flex flex-col items-start gap-2 px-6 pb-4 drop-shadow-lg bg-sky-white rounded-lg w-full relative"
        >
          <h2
            class="text-2xl font-title-bold text-secondary flex items-center justify-center absolute top-0 left-0 w-10 h-10 rounded-full bg-sky-blue mt-[-12px] ml-[-12px]"
          >
            1
          </h2>

          <fontAwesome :icon="['fas', 'user-plus']" class="text-sky-blue mt-8 h-5" />

          <h3 class="text-xl font-title-bold text-main">Skapa ett konto</h3>

          <p class="text-third">
            Börja med att registrera ett konto genom att klicka på registrera knappen. I formuläret
            fyller du i namn, e-mailadress samt lösenord. Efter registrering får du ett mail med 6
            siffrig kod som måste fyllas i. När det är gjort är du redo att logga in.
          </p>
        </div>

        <div
          class="flex flex-col gap-2 px-6 pb-4 drop-shadow-lg bg-sky-white rounded-lg w-full items-start relative"
        >
          <h2
            class="text-2xl font-title-bold text-secondary flex items-center justify-center absolute top-0 left-0 w-10 h-10 rounded-full bg-sky-blue mt-[-12px] ml-[-12px]"
          >
            2
          </h2>

          <fontAwesome :icon="['fas', 'paper-plane']" class="text-sky-blue mt-8 h-5" />

          <h3 class="text-xl font-title-bold text-main">Skicka iväg informationen</h3>

          <p class="text-third">
            Väl inloggad ser du i navigeringen en länk där det står få offerter. Klicka på den eller
            på knappen få offerter på startsidan. Då kommer du till ett formulär där du kan skapa
            ditt uppdrag som sedan skickas ut till verkstäder i den valda kommunen.
          </p>
        </div>

        <div
          class="flex flex-col gap-2 px-6 pb-4 drop-shadow-lg bg-sky-white rounded-lg w-full items-start relative"
        >
          <h2
            class="text-2xl font-extrabold text-secondary flex items-center justify-center absolute top-0 left-0 w-10 h-10 rounded-full bg-sky-blue mt-[-12px] ml-[-12px]"
          >
            3
          </h2>

          <fontAwesome :icon="['fas', 'message']" class="text-sky-blue mt-8 h-5" />

          <h3 class="text-xl font-title-bold text-main">Få svar</h3>

          <p class="text-third">
            Verkstäderna som har möjlighet att ge dig en offert svarar sedan genom att skicka ett
            e-mail till dig. Du måste alltså hålla koll på din e-mail för eventuella svar.
          </p>
        </div>
      </div>

      <RouterLink
        to="/register"
        class="main-btn text-secondary flex justify-center items-center max-w-40 m-auto"
        aria-label="Registrera verkstad"
        >Registrera dig</RouterLink
      >
    </section>

    <section class="flex flex-col w-full p-4 sm:p-6 xl:p-8 gap-8 items-center max-w-full">
      <h2 class="text-main text-2xl md:text-4xl font-title-black text-center">Populära uppdrag</h2>
      <div class="w-24 rounded-full h-2 bg-sky-blue mt-[-24px] m-auto"></div>

      <p class="text-third text-center">
        Utforska våra mest efterfrågade tjänster och få hjälp med din bil idag.
      </p>

      <div
        class="flex flex-col lg:flex-row w-full gap-12 max-w-[410px] sm:max-w-[510px] lg:max-w-[1200px]"
      >
        <div class="flex flex-col gap-4 rounded-lg w-full bg-sky-white drop-shadow-lg bg-sky-white">
          <img
            src="../../assets/ac_service.webp"
            alt="person som håller högra handen över fläktutblåset i bilen"
            class="w-full h-[200px] object-cover rounded-t-lg"
          />

          <!-- <a href="https://www.freepik.com/search">Image by freepik</a> -->

          <strong class="px-4 text-xl">AC-service</strong>

          <p class="px-4">
            Beställ AC-Service genom FixMatch. Du får en komplett genomgång av AC-systemet och
            köldmedlet byts ut.
          </p>

          <RouterLink
            to="get-offers?job=ac-service"
            type="button"
            class="main-btn flex justify-center items-center max-w-32 ml-4 mb-4"
            >Få offerter</RouterLink
          >
        </div>
        <div class="flex flex-col gap-4 rounded-lg w-full bg-sky-white drop-shadow-lg bg-sky-white">
          <img
            src="../../assets/exterior_detailing.webp"
            alt="person som håller högra handen över fläktutblåset i bilen"
            class="w-full h-[200px] object-cover rounded-t-lg"
          />

          <!-- <a href="https://www.freepik.com/search">Image by freepik</a> -->

          <strong class="px-4 text-xl">Rekond</strong>

          <p class="px-4">
            Dags att frächa upp bilen? Genom FixMatch kan du boka utvändig och invändig rengöring av
            din bil.
          </p>

          <RouterLink
            to="get-offers?job=ac-service"
            type="button"
            class="main-btn flex justify-center items-center max-w-32 ml-4 mb-4"
            >Få offerter</RouterLink
          >
        </div>
        <div class="flex flex-col gap-4 rounded-lg w-full bg-sky-white drop-shadow-lg bg-sky-white">
          <img
            src="../../assets/service.webp"
            alt="person som håller högra handen över fläktutblåset i bilen"
            class="w-full h-[200px] object-cover rounded-t-lg"
          />

          <!-- <a href="https://www.freepik.com/search">Image by freepik</a> -->

          <strong class="px-4 text-xl">Fordons service</strong>

          <p class="px-4">
            Boka din service genom FixMatch. Skriv vad du vill ha hjälp med och verkstaden gör då
            allt som behövs enligt tillverkarens beskrivning.
          </p>

          <RouterLink
            to="get-offers?job=ac-service"
            type="button"
            class="main-btn flex justify-center items-center max-w-32 ml-4 mb-4"
            >Få offerter</RouterLink
          >
        </div>
      </div>
    </section>

    <div class="flex flex-col gap-4 w-full max-w-[410px] sm:max-w-[510px] lg:max-w-[610px] p-4">
      <FaqParent :repairShop="false" />
    </div>
  </main>

  <footer class="mt-16 sm:mt-20 lg:mt-28">
    <LandingFooter />
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
