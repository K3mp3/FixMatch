<script setup lang="ts">
import { useSEO } from '@/composables/useSeo'
import { RouterLink } from 'vue-router'
import LandingFooter from '../footer/LandingFooter.vue'
import LandingNav from '../nav/LandingNav.vue'

useSEO({
  title: 'Om oss - FixMatch',
  description: 'Nyfiken på vad FixMatch är? Kolla in "Om oss" sektionen för att veta mer.',
  url: 'https://fixmatch.se/about-us',
  keywords: 'bilverkstad, bilservice, reparation, offert, fixmatch'
})
</script>

<template>
  <header class="flex flex-col gap-24 lg:gap-36 items-center min-h-screen">
    <nav class="w-full fixed z-10">
      <LandingNav :backgroundColor="true" />
    </nav>

    <section
      class="gap-4 sm:gap-5 lg:gap-8 p-6 sm:p-6 lg:p-10 w-[90vw] max-w-[750px] flex flex-col text-center items-center lg:mt-[202px] z-[1] mt-4 mb-6 bg-sky-white rounded-2xl drop-shadow-lg lg:mb-[120px]"
    >
      <h2 class="text-2xl font-extrabold sm:text-3xl xl:text-5xl">Vad är FixMatch?</h2>

      <div class="flex flex-col gap-2 max-w-[550px]">
        <p>
          <strong>FixMatch</strong> är tjänsten som gör det enkelt att hitta rätt verkstad – utan
          krångel. Vi matchar din bil med seriösa verkstäder i din närhet, så att du slipper ringa
          runt, gissa priser eller fundera på vad som egentligen ingår.
        </p>

        <p>
          Du beskriver vad som är fel, vi fixar resten. Inom kort får du personliga offerter direkt
          från verkstäder som är redo att hjälpa dig. Jämför pris och välj det som passar dig bäst –
          allt samlat på ett ställe. Svaren kommer direkt till ditt konto, så att du alltid har dem
          nära till hands.
        </p>

        <p>
          Vi tror på en bilvärld där transparens och kontroll är standard, inte bonus. Därför gör vi
          det enkelt att fatta smarta beslut, utan att vara bilmekaniker själv.
        </p>

        <strong
          >FixMatch – för dig som vill lägga mindre tid på att jaga offerter, och mer tid på att
          bara köra.</strong
        >
      </div>

      <RouterLink to="/get-offers" class="flex items-center justify-center main-btn">
        Få offerter
      </RouterLink>

      <RouterLink to="/register" class="flex items-center justify-center border-button">
        Registrera
      </RouterLink>
    </section>
  </header>

  <footer>
    <LandingFooter />
  </footer>
</template>
