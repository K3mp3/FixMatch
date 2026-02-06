<script setup lang="ts">
import LandingFooter from '@/components/footer/LandingFooter.vue';
import LandingNav from '@/components/nav/LandingNav.vue';
</script>

<template>
  <header class="flex flex-col gap-24 lg:gap-36 items-center">
    <nav class="w-full fixed z-10">
      <LandingNav :backgroundColor="true"/>
    </nav>
  </header>

  <main class="mt-28 sm:mt-20 lg:mt-28 px-4 flex flex-col gap-24 sm:gap-20 lg:gap-28 items-center">
    <div class="overflow-y-auto p-6 flex flex-col gap-6">
        <div>
          <h2 class="font-semibold mb-4">1. Offert och Bokning</h2>
          <div class="flex flex-col gap-4">
            <p>1.1 Offerten baseras på kundens beskrivning och fordonets information.</p>
            <p>1.2 Offerten är inte bindande förrän verkstaden och kunden bekräftar bokningstid.</p>
            <p>
              1.3 Ytterligare fel kan upptäckas vid fysisk inspektion. Verkstaden ska då informera
              kunden innan arbete påbörjas.
            </p>
            <p>1.4 Kunden kan kostnadsfritt avboka bokningen upp till 24 timmar innan bokad tid.</p>
            <p>1.5 Verkstaden har 48 timmar på sig att ge offert på ett uppdrag.</p>
          </div>
        </div>

        <div>
          <h2 class="font-semibold mb-4">2. Ansvar</h2>
          <div class="flex flex-col gap-4">
            <p>2.1 Verkstaden ansvarar för korrekt information i offerter.</p>
            <p>
              2.2 FixMatch ansvarar inte för fel eller missförstånd i offerter eller utfört arbete.
            </p>
            <p>
              2.3 Tvister mellan verkstad och kund löses mellan parterna. FixMatch är inte ansvarig
              part.
            </p>
          </div>
        </div>

        <div>
          <h2 class="font-semibold mb-4">3. Registrering och Avgifter</h2>
          <div class="flex flex-col gap-4">
            <p>
              3.1 Genom att skapa ett konto och lämna offerter godkänner verkstaden dessa villkor.
            </p>
            <p>
              3.2 Vid registrering aktiveras en kostnadsfri testperiod om tre (3) månader.
              Påminnelse skickas två (2) veckor innan testperiodens slut.
            </p>
            <p>
              3.3 Innan registrering kan verkstaden välja mellan:
              <ul class="text-main">
                <li ><strong>Premiumabonnemang:</strong> 199 kr/mån via Stripe.</li>
                <li><strong>Coreabonnemang:</strong> 5% avgift per bokning (exkl. moms) via Stripe.</li>
              </ul>
            </p>
          </div>
        </div>

        <div>
          <h2 class="font-semibold mb-4">4. Konto och Datahantering</h2>
          <div class="flex flex-col gap-4">
            <p>
              4.1 Konton kan avslutas när som helst. Vid avslut sparas kontot aktivt under testperioden eller 30 dagar, därefter raderas det.
            </p>
            <p>
              4.2 Inaktiva konton raderas automatiskt efter 12 månader.4.2 Inaktiva konton raderas automatiskt efter 12 månader.
            </p>
            <p>
              4.3 Vid radering av konto raderas även alla offerter och bokningar.
            </p>
            <p>
              4.4 Offert- och bokningsdata sparas i fem (5) år innan automatisk radering.
            </p>
          </div>
        </div>

        <div>
          <h2 class="font-semibold mb-4">5. Ändringar av Avtalet</h2>
          <div class="flex flex-col gap-4">
            <p>
              FixMatch kan ändra dessa villkor. Verkstaden informeras via e-post eller på plattformen. Fortsatt användning innebär godkännande.
            </p>
          </div>
        </div>

        <p>Senast uppdaterat: 2025-05-28</p>
      </div>

  </main>

  <footer class="mt-16 sm:mt-20 lg:mt-28">
    <LandingFooter />
  </footer>
</template>
