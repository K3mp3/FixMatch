<script setup lang="ts">
const emit = defineEmits<{
  (e: 'closeAgreement'): void
  (e: 'acceptAgreement'): void
}>()
</script>

<template>
  <section class="fixed inset-0 bg-main-20 bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-main rounded-lg max-h-[90vh] w-full max-w-2xl flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b flex justify-between items-center sticky top-0 bg-sky-white">
        <h2 class="text-xl font-semibold">Användaravtal</h2>
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
          <h2 class="font-semibold mb-4">Användaravtal – FixMatch (Privatpersoner)</h2>
          <div class="flex flex-col gap-4">
            <strong>1. Allmänt</strong>
            <p>
              Detta användaravtal gäller för användning av plattformen FixMatch, som tillhandahålls
              av Melvin Kempe (enskild firma, nedan kallad "FixMatch"). Genom att skapa ett konto
              godkänner du ("Användaren") dessa villkor.
            </p>

            <strong>2. Tjänstebeskrivning</strong>
            <p>
              FixMatch är en digital förmedlingstjänst där Användare kan beskriva fordonsrelaterade
              problem, ta emot offerter från anslutna verkstäder och boka tid. Tjänsten är
              kostnadsfri för privatpersoner.
            </p>

            <strong>3. Registrering och Konto</strong>
            <ul class="flex flex-col gap-1 text-main">
              <li class="text-main">Registrering kräver namn, e-postadress och lösenord.</li>
              <li>
                Användaren ansvarar för att hålla sina kontouppgifter konfidentiella och bör använda
                ett starkt lösenord.
              </li>
              <li>
                FixMatch använder säkra tekniska lösningar för att skydda all data, inklusive
                kryptering och säker autentisering via Firebase.
              </li>
              <li>
                Vid misstanke om obehörig åtkomst ska Användaren omedelbart kontakta FixMatch.
              </li>
              <li>
                FixMatch förbehåller sig rätten att stänga av konton vid brott mot detta avtal.
              </li>
            </ul>

            <strong>4. Användning av Plattformen</strong>
            <ul class="flex flex-col gap-1 text-main">
              <li>Innehåll som skickas ska vara relevant för fordonsproblem.</li>
              <li>Hot, kränkande språk eller olämpligt beteende kan leda till avstängning.</li>
              <li>
                Användaren kan inte skicka meddelanden direkt till verkstäder via Plattformen, men
                har möjlighet att skicka med ett meddelande på varje valt jobb.
              </li>
            </ul>

            <strong>5. Ansvarsbegränsning</strong>
            <ul class="flex flex-col gap-1 text-main">
              <li>
                FixMatch är endast en förmedlare och ansvarar inte för tjänster, arbeten eller
                garantier som tillhandahålls av verkstäder.
              </li>
              <li>
                Tvister mellan Användare och verkstad löses direkt mellan parterna. FixMatch
                erbjuder ingen tvistelösning.
              </li>
            </ul>

            <strong>6. Behandling av personuppgifter</strong>
            <ul class="flex flex-col gap-1 text-main">
              <li>
                FixMatch lagrar följande i Firebase: namn, e-post, IP-adress (i 40 minuter),
                offertuppgifter (jobbtyp, kommun, reg.nr, växellåda).
              </li>
              <li>Personuppgifter delas inte med tredje part.</li>
              <li>
                Uppgifter kopplade till uppdrag och bokningar sparas i 5 år, därefter raderas de
                permanent.
              </li>
            </ul>

            <strong>7. Kontoavslut</strong>
            <ul class="flex flex-col gap-1 text-main">
              <li>Konton raderas automatiskt efter 12 månaders inaktivitet.</li>
              <li>Användare kommer att kunna begära radering inom kort via kontoinställningar.</li>
              <li>
                Användaren kan när som helst begära radering av samtliga personuppgifter kopplade
                till sitt konto genom att kontakta FixMatch. Radering sker i enlighet med tillämplig
                dataskyddslagstiftning (inklusive GDPR).
              </li>
            </ul>

            <strong>8. Ändringar av villkor</strong>
            <ul class="flex flex-col gap-1 text-main">
              <p>
                FixMatch kan uppdatera dessa villkor. Vid väsentliga ändringar meddelas Användaren
                via e-post eller på plattformen. Fortsatt användning innebär godkännande.
              </p>
            </ul>

            <strong>9. Kontakt</strong>
            <ul class="flex flex-col gap-1 text-main">
              <li>E-post: <a href="mailto:info@fixmatch.se">info@fixmatch.se</a></li>
            </ul>

            <p>Senast uppdaterat: 2025-03-20</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t sticky bottom-0 bg-sky-white">
        <button @click="emit('acceptAgreement')" class="main-btn w-full">
          Jag accepterar villkoren
        </button>
      </div>
    </div>
  </section>
</template>
