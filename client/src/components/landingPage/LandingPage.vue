<script setup lang="ts">
import { useSEO } from '@/composables/useSeo'
import type { IArticleData } from '@/models/IArticleData'
import { fetchEditorContent } from '@/services/admin'
import Cookies from 'js-cookie'
import { onMounted, ref } from 'vue'
import GeneralFooter from '../footer/GeneralFooter.vue'
import LandingNav from '../nav/LandingNav.vue'

useSEO({
  title: 'Hem - Vayme',
  description:
    'Hitta rätt verkstad för ditt fordon eller få nya kunder som verkstad. Vayme förenklar processen med professionella verkstäder, prisvärda tjänster och enkel bokning. Gratis de första 4 månaderna för verkstäder. Helt kostnadsfritt för fordonsägare',
  url: 'https://vayme.se/',
  keywords:
    'vayme, bilverkstad, verkstadskunder, bilreparation, hitta verkstad, verkstadspartner, bilservice, verkstadstjänster, fordonreparation, bilreparationer, verkstadsbooking, bilunderhåll, fordonsservice, verkstadsplattform',
  image: 'https://vayme.se/landing_page_seo.png'
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
})
</script>

<template>
  <header class="flex flex-col gap-8 items-center bg-sky-light-blue-gr">
    <nav class="w-full fixed z-10">
      <LandingNav :landing="true" />
    </nav>

    <section
      class="gap-4 sm:gap-5 xl:gap-8 p-4 sm:p-6 xl:p-8 flex flex-col text-center items-center w-full max-w-[750px] lg:mt-[202px] z-[1] mt-4"
    >
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black">
        Kopplar samman <br />
        <span class="text-sky-blue font-bold">fordon & verkstäder</span>
      </h1>

      <p
        class="text-third text-lg max-w-[400px] sm:max-w-[450px] md:max-w-[500px] lg:max-w-[550px] font-medium"
      >
        Vayme förenklar processen att hitta rätt verkstad för ditt fordon eller att nå nya kunder
        som verkstad.
      </p>
    </section>

    <section
      class="flex flex-col gap-6 lg:gap-8 w-full max-w-[450px] lg:max-w-[950px] mb-8 lg:mb-44 lg:flex-row p-4"
    >
      <RouterLink
        to="/repair-shop"
        class="rounded-2xl bg-sky-white drop-shadow-lg p-4 flex flex-col gap-8 w-full items-center text-center"
      >
        <div
          class="min-w-16 max-w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center"
        >
          <fontAwesome :icon="['fas', 'wrench']" class="h-6 text-blue-600" />
        </div>

        <h2 class="font-bold text-3xl">Jag äger en verkstad</h2>

        <p class="text-third">
          Få fler kunder, optimera er kapacitet och väx er verkstad med våra verktyg
        </p>

        <p class="text-blue-600 font-medium text-lg">Kom igång som verkstad -></p>
      </RouterLink>

      <RouterLink
        to="/vehicle-owner"
        class="rounded-2xl bg-sky-white drop-shadow-lg p-4 flex flex-col gap-8 w-full items-center text-center"
      >
        <div
          class="min-w-16 max-w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center"
        >
          <fontAwesome :icon="['fas', 'car']" class="h-6 text-orange-600" />
        </div>

        <h2 class="font-bold text-3xl">Jag äger ett fordon</h2>

        <p class="text-third">Hitta den perfekta verkstaden för ditt fordon snabbt och enkelt</p>

        <p class="text-orange-600 font-medium text-lg">Hitta en verkstad -></p>
      </RouterLink>
    </section>
  </header>
  <main class="mt-28 sm:mt-20 lg:mt-28 flex flex-col gap-20 lg:gap-28 items-center relative">
    <section class="flex flex-col gap-4 items-center p-4">
      <h2 class="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-black">Varför FixMatch?</h2>

      <p class="text-third text-xl font-medium text-center">
        Vi förenklar processen för både fordonsägare och verkstäder
      </p>

      <article class="flex flex-col lg:flex-row gap-16 mt-12 items-center">
        <div class="flex flex-col gap-4 text-center items-center max-w-[350px]">
          <div
            class="min-w-14 max-w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center"
          >
            <fontAwesome :icon="['fas', 'wrench']" class="h-5 text-blue-600" />
          </div>

          <h3 class="text-xl md:text-2xl font-black">Professionella verkstäder</h3>
          <p class="text-third">Anslut dig till vårt nätverk av professionella verkstäder</p>
        </div>

        <div class="flex flex-col gap-4 text-center items-center max-w-[350px]">
          <div
            class="min-w-14 max-w-14 h-14 rounded-full bg-orange-200 flex items-center justify-center"
          >
            <fontAwesome :icon="['fas', 'money-bill-wave']" class="h-5 text-orange-600" />
          </div>

          <h3 class="text-xl md:text-2xl font-black">Prisvärda</h3>
          <p class="text-third">
            Vi har medvetet valt lägre priser än konkurrenterna då det gynnar alla
          </p>
        </div>

        <div class="flex flex-col gap-4 text-center items-center max-w-[350px]">
          <div
            class="min-w-14 max-w-14 h-14 rounded-full bg-green-200 flex items-center justify-center"
          >
            <fontAwesome :icon="['fas', 'arrow-right']" class="h-5 text-green-600" />
          </div>

          <h3 class="text-xl md:text-2xl font-black">Enkel process</h3>
          <p class="text-third">Från beskrivning till bokning - allt på ett ställe</p>
        </div>
      </article>
    </section>

    <!-- <section class="flex flex-col w-full p-4 sm:p-6 xl:p-8 gap-8 items-center max-w-full">
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
          /> -->

    <!-- <a href="https://www.freepik.com/search">Image by freepik</a> -->

    <!-- <strong class="px-4 text-xl">AC-service</strong>

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
          /> -->

    <!-- <a href="https://www.freepik.com/search">Image by freepik</a> -->

    <!-- <strong class="px-4 text-xl">Rekond</strong>

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
          /> -->

    <!-- <a href="https://www.freepik.com/search">Image by freepik</a> -->

    <!-- <strong class="px-4 text-xl">Fordons service</strong>

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
      <FaqParent />
    </div>

    <div class="w-full max-w-[410px] sm:max-w-[510px] lg:max-w-[610px] p-4">
      <VisualGraph />

      <RouterLink
        to="/price-plans"
        class="main-btn text-secondary flex justify-center items-center max-w-40 m-auto mt-8"
        aria-label="Registrera verkstad"
        >Bli partner</RouterLink
      >
    </div> -->

    <!-- <section
      v-if="newsTitle"
      class="flex flex-col gap-4 w-full max-w-[410px] sm:max-w-[510px] lg:max-w-[610px] p-6 bg-sky-gray rounded-lg text-center border-main"
    >
      <h2 class="text-2xl font-title-bold sm:text-3xl xl:text-5xl">Senaste i nyheter</h2>
      <h3 class="text-xl font-bold text-sky-light-blue">{{ newsTitle }}</h3>

      <RouterLink
        :to="`/news/${formatUrlSlug(newsTitle)}`"
        class="secondary-btn-white-hover flex justify-center items-center mt-2"
      >
        Läs mer
      </RouterLink>
    </section> -->

    <!-- <GoogleAdsense adSlot="1234567890" /> -->
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
