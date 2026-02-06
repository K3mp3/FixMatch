<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import FaqDropdown from './FaqDropdown.vue'

const props = defineProps({
  repairShop: {
    type: Boolean,
    default: false
  }
})

const mobile = ref(true)
const tablet = ref(false)
let width = document.documentElement.clientWidth

function updateScreenSize() {
  window.addEventListener('resize', updateScreenSize)
  width = document.documentElement.clientWidth
  if (width < 700) {
    mobile.value = true
    tablet.value = false
  } else {
    mobile.value = false
    tablet.value = true
  }
}

const faqTexts: { title: string; type: string; text: string; repairShop: boolean }[] = [
  {
    title: 'Vad är Vayme?',
    type: 'general question',
    text: 'Vayme är en plattform som gör det enklare för dig som fordonsägare att hitta verkstäder som passar din budget. Genom att fylla i ett formulär med information om din bil, såsom registreringsnummer, typ av fel, kontaktuppgifter samt vilken kommun du befinner dig i, skickas denna information ut till alla anslutna verkstäder i den valda kommunen. Verkstäderna svarar sedan tillbaka och svaren ser du på din profil.',
    repairShop: false
  },
  {
    title: 'Vad är Vayme?',
    type: 'general question',
    text: 'Vayme är en plattform som gör det enklare för verkstäder att nå ut till fler kunder genom att ta emot uppdrag.',
    repairShop: true
  },
  {
    title: 'Hur används min data?',
    type: 'user data',
    text: 'Vi använder din data för att kunna skicka med korrekta uppgifter i uppdrag, bokningar och jobb.',
    repairShop: false
  },
  {
    title: 'Hur används min data?',
    type: 'user data',
    text: 'Vi använder din data för att kunna skicka med korrekta uppgifter i uppdrag, bokningar och jobb.',
    repairShop: true
  },
  {
    title: 'Hur vet jag om ni sparar cookies?',
    type: 'user data',
    text: 'För tillfället använder vi oss inte av cookies. Däremot sparar Stripe, vår betalleverantör cookies för att plattformen ska fungera',
    repairShop: false
  },
  {
    title: 'Hur vet jag om ni sparar cookies?',
    type: 'user data',
    text: 'För tillfället använder vi oss inte av cookies. Däremot sparar Stripe, vår betalleverantör cookies för att plattformen ska fungera',
    repairShop: true
  },
  {
    title: 'Hur sparas min data?',
    type: 'user data',
    text: 'Din användardata sparas i vår databas med all information som du uppger vid registrering och offerter. Din IP-adress sparas också i 40 minuter för att skydda plattformen mot eventuella botattacker.',
    repairShop: false
  },
  {
    title: 'Hur sparas min data?',
    type: 'user data',
    text: 'Din användardata sparas i vår databas med all information som du uppger vid registrering och offerter. Din IP-adress sparas också i 40 minuter för att skydda plattformen mot eventuella botattacker.',
    repairShop: true
  },
  {
    title: 'Kostar tjänsten något?',
    type: 'pricing',
    text: 'Tjänsten är helt gratis för dig som fordonsägare. Verkstäderna betalar däremot en summa för varje månad eller en fast summa varje månad beroende på abonnemang',
    repairShop: false
  },
  {
    title: 'Kostar tjänsten något?',
    type: 'pricing',
    text: 'Tjänsten är helt gratis de första fyra månaderna, därefter träder det valda abonnemanget i kraft. Vilket betyder att ni antingen betalar 5% av det givna priset på varje bokat jobb, eller 199 SEK / månad.',
    repairShop: true
  },
  {
    title: 'Hur vet jag om jag fått svar?',
    type: 'general question',
    text: 'När du fyller i kontaktformuläret för att kontakta verkstäder, skickas ett e-mail till varje verkstad i den kommun du har valt. När verkstäderna har svarat med en offert får du inom kort ett mail som talar om att du har offerter att visa.',
    repairShop: false
  }
]

// Filter FAQ texts based on repairShop prop
const filteredFaqTexts = computed(() => {
  return faqTexts.filter((q) => q.repairShop === props.repairShop)
})

onMounted(() => {
  updateScreenSize()
})
</script>

<template>
  <h2 class="text-2xl sm:text-3xl text-main font-title-bold text-center">FAQ</h2>
  <p class="text-third text-center mb-4">
    Här hittar du svar på de vanligaste frågorna om vår tjänst.
  </p>
  <div class="bg-sky-white p-4 drop-shadow-lg rounded-lg">
    <FaqDropdown v-for="Q in filteredFaqTexts" :key="Q.title" :question="Q"></FaqDropdown>
  </div>
</template>
