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
        <h2 class="font-semibold mb-4">Sekretesspolicy – FixMatch</h2>
        <div class="flex flex-col gap-4">
          <strong>1. Inledning</strong>
          <p>
            FixMatch värnar om din integritet. Denna sekretesspolicy förklarar hur vi samlar in,
            använder och skyddar dina personuppgifter när du använder vår plattform.
          </p>

          <strong>2. Personuppgifter vi samlar in</strong>
          <p>När du använder vår tjänst kan vi samla in följande information:</p>
          <ul class="flex flex-col gap-1">
            <li>Namn</li>
            <li>E-postadress</li>
            <li>IP-adress (lagras i max 40 minuter)</li>
            <li>
              Information om bil och ärende (t.ex. registreringsnummer, växellåda, kommun, typ av
              jobb)
            </li>
            <li>Tekniska loggar och webbläsarinformation</li>
          </ul>
          <p>Vi lagrar personuppgifter i säkra databaser via Firebase (Google).</p>

          <strong>3. Användning av information</strong>
          <p>Vi använder insamlad data för att:</p>
          <ul class="flex flex-col gap-1">
            <li>Leverera vår tjänst (matcha verkstäder och användare)</li>
            <li>Skicka e-postaviseringar</li>
            <li>Förbättra och analysera användarupplevelsen</li>
            <li>Förhindra missbruk och säkerställa säkerhet</li>
            <li>Visa annonser (via Google AdSense)</li>
          </ul>

          <strong>4. Cookies och spårning</strong>
          <p>Vi använder cookies för att:</p>
          <ul class="flex flex-col gap-1">
            <li>Komma ihåg användarinställningar</li>
            <li>Visa personanpassade annonser via Google AdSense</li>
          </ul>
          <p>
            Tredjepartscookies kan placeras av våra annonspartners, t.ex. Google, för att visa
            relevanta annonser baserat på dina tidigare besök på denna och andra webbplatser.
          </p>
          <strong>Dina val:</strong>
          <ul class="flex flex-col gap-1">
            <li>Du kan neka eller radera cookies via webbläsarinställningar.</li>
            <li>
              Du kan välja bort personanpassade annonser här:
              <a
                href="https://myadcenter.google.com/personalizationoff?sasb=true&ref=ad-settings"
                rel="noreferrer noopener"
                target="_blank"
                >Google ads settings</a
              >
            </li>
            <li>
              För mer information om hur Google använder data:
              <a href="https://policies.google.com/" rel="noreferrer noopener" target="_blank"
                >Google ads settings</a
              >
            </li>
          </ul>

          <strong>5. Lagringstid</strong>
          <p>
            Vi sparar användarkonton och offertuppgifter i upp till 5 år. Konton raderas automatiskt
            efter 12 månaders inaktivitet. Du kan när som helst begära att få dina uppgifter
            raderade.
          </p>

          <strong>6. Dela data med tredje part</strong>
          <p>
            Vi delar aldrig din personliga information med tredje part, förutom när det krävs enligt
            lag.
          </p>

          <strong>7. Dina rättigheter</strong>
          <p>Enligt GDPR har du rätt att:</p>
          <ul class="flex flex-col gap-1">
            <li>Begära ett utdrag av dina personuppgifter</li>
            <li>Begära rättelse eller radering</li>
            <li>Återkalla samtycke till viss behandling</li>
          </ul>

          <strong>8. Säkerhet</strong>
          <ul class="flex flex-col gap-1">
            <p>
              Vi använder moderna tekniska lösningar för att skydda din information, inklusive
              autentisering via Firebase och kryptering.
            </p>
          </ul>

          <strong>9. Kontakt</strong>
          <ul class="flex flex-col gap-1">
            <p>E-post: <a href="mailto:info@fixmatch.se">info@fixmatch.se</a></p>
          </ul>

          <p>Senast uppdaterat: 2025-04-12</p>
        </div>
      </div>
    </div>
  </main>

  <footer class="px-4 mt-16 sm:mt-20 lg:mt-28">
    <LandingFooter />
  </footer>
</template>
