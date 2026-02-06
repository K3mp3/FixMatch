<script setup lang="ts">
const emit = defineEmits<{
  (e: 'closeAgreement'): void
  (e: 'acceptAgreement'): void
}>()
</script>

<template>
  <section class="fixed inset-0 bg-main-20 z-50 flex items-center justify-center p-4">
    <div class="bg-main rounded-lg max-h-[90vh] w-full max-w-2xl flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b flex justify-between items-center sticky top-0 bg-sky-white">
        <h2 class="text-xl font-semibold">Avtalsvillkor – Verkstäder (FixMatch)</h2>
        <button
          @click="emit('acceptAgreement')"
          class="text-gray-500 hover:text-gray-700"
          aria-label="Stäng"
        >
          ✕
        </button>
      </div>

      <div class="overflow-y-auto p-6 flex flex-col gap-6 bg-sky-white">
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

      <div class="p-4 border-t sticky bottom-0 bg-sky-white">
        <button @click="emit('acceptAgreement')" class="main-btn w-full">
          Jag accepterar villkoren
        </button>
      </div>
    </div>
  </section>
</template>
