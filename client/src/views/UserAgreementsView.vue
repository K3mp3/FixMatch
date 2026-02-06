<script setup lang="ts">
import LandingFooter from '@/components/footer/LandingFooter.vue'
import LandingNav from '@/components/nav/LandingNav.vue'
</script>

<template>
  <header class="flex flex-col gap-24 lg:gap-36 items-center">
    <nav class="w-full fixed z-10">
      <LandingNav />
    </nav>
  </header>

  <main class="mt-28 sm:mt-20 lg:mt-28 px-4 flex flex-col gap-24 sm:gap-20 lg:gap-28 items-center">
    <div class="overflow-y-auto p-6 flex flex-col gap-6">
      <div>
        <h2 class="font-semibold mb-4">Användaravtal – FixMatch (Privatpersoner)</h2>
        <div class="flex flex-col gap-4">
          <strong>1. Allmänt</strong>
          <p>
            Detta användaravtal gäller för användning av plattformen FixMatch, som tillhandahålls av
            Melvin Kempe (enskild firma, nedan kallad "FixMatch"). Genom att skapa ett konto
            godkänner du ("Användaren") dessa villkor.
          </p>

          <strong>2. Tjänstebeskrivning</strong>
          <p>
            FixMatch är en digital förmedlingstjänst där Användare kan beskriva fordonsrelaterade
            problem, ta emot offerter från anslutna verkstäder och boka tid. Tjänsten är kostnadsfri
            för privatpersoner.
          </p>

          <strong>3. Registrering och Konto</strong>
          <ul class="flex flex-col gap-1">
            <li class="text-main">Registrering kräver namn, e-postadress och lösenord.</li>
            <li class="text-main">
              Användaren ansvarar för att hålla sina kontouppgifter konfidentiella och bör använda
              ett starkt lösenord.
            </li>
            <li class="text-main">
              FixMatch använder säkra tekniska lösningar för att skydda all data, inklusive
              kryptering och säker autentisering via Firebase.
            </li>
            <li class="text-main">
              Vid misstanke om obehörig åtkomst ska Användaren omedelbart kontakta FixMatch.
            </li>
            <li class="text-main">
              FixMatch förbehåller sig rätten att stänga av konton vid brott mot detta avtal.
            </li>
          </ul>

          <strong>4. Användning av Plattformen</strong>
          <ul class="flex flex-col gap-1">
            <li class="text-main">Innehåll som skickas ska vara relevant för fordonsproblem.</li>
            <li class="text-main">
              Hot, kränkande språk eller olämpligt beteende kan leda till avstängning.
            </li>
            <li class="text-main">
              Användaren kan inte skicka meddelanden direkt till verkstäder via Plattformen, men har
              möjlighet att skicka med ett meddelande på varje valt jobb.
            </li>
          </ul>

          <strong>5. Ansvarsbegränsning</strong>
          <ul class="flex flex-col gap-1">
            <li class="text-main">
              FixMatch är endast en förmedlare och ansvarar inte för tjänster, arbeten eller
              garantier som tillhandahålls av verkstäder.
            </li>
            <li class="text-main">
              Tvister mellan Användare och verkstad löses direkt mellan parterna. FixMatch erbjuder
              ingen tvistelösning.
            </li>
          </ul>

          <strong>6. Behandling av personuppgifter</strong>
          <ul class="flex flex-col gap-1">
            <li class="text-main">
              FixMatch lagrar följande i Firebase: namn, e-post, IP-adress (i 40 minuter),
              offertuppgifter (jobbtyp, kommun, reg.nr, växellåda).
            </li>
            <li class="text-main">Personuppgifter delas inte med tredje part.</li>
            <li class="text-main">
              Uppgifter kopplade till uppdrag och bokningar sparas i 5 år, därefter raderas de
              permanent.
            </li>
          </ul>

          <strong>7. Kontoavslut</strong>
          <ul class="flex flex-col gap-1">
            <li class="text-main">Konton raderas automatiskt efter 12 månaders inaktivitet.</li>
            <li class="text-main">
              Användare kommer att kunna begära radering inom kort via kontoinställningar.
            </li>
            <li class="text-main">
              Användaren kan när som helst begära radering av samtliga personuppgifter kopplade till
              sitt konto genom att kontakta FixMatch. Radering sker i enlighet med tillämplig
              dataskyddslagstiftning (inklusive GDPR).
            </li>
          </ul>

          <strong>8. Ändringar av villkor</strong>
          <ul class="flex flex-col gap-1">
            <p>
              FixMatch kan uppdatera dessa villkor. Vid väsentliga ändringar meddelas Användaren via
              e-post eller på plattformen. Fortsatt användning innebär godkännande.
            </p>
          </ul>

          <strong>9. Kontakt</strong>
          <ul class="flex flex-col gap-1">
            <p>E-post: <a href="mailto:info@fixmatch.se">info@fixmatch.se</a></p>
          </ul>

          <p>Senast uppdaterat: 2025-03-20</p>
        </div>
      </div>
    </div>
  </main>

  <footer class="mt-16 sm:mt-20 lg:mt-28">
    <LandingFooter />
  </footer>
</template>
