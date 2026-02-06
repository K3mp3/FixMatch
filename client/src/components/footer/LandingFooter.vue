<template>
  <div
    class="text-main flex flex-col items-center gap-4 sm:gap-8 p-4 sm:p-8 lg:p-16 relative bottom-0 bg-sky-blue-gr"
  >
    <div class="font-extrabold flex flex-col gap-4 w-full items-center sm:gap-8 max-w-[90%]">
      <h2 class="text-2xl font-extrabold sm:text-3xl xl:text-5xl text-secondary">
        Vill du spara pengar på dina reparationer?
      </h2>
      <p class="text-secondary">Skapa ditt uppdrag direkt och få svar inom 48 timmar</p>

      <RouterLink
        to="/get-offers"
        class="secondary-btn-white-hover flex items-center justify-center px-8 p-6 font-title-bold mb-20"
        >Skapa uppdrag</RouterLink
      >

      <img src="../../assets/vayme_white.webp" alt="FixMatch logo" width="288px" class="w-72" />
      <div class="white-line flex justify-center"></div>
    </div>
    <div class="text-center flex flex-col mb-20 lg:mb-0 gap-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl text-secondary font-title-bold">Kontakta oss</h2>
        <RouterLink to="contact" class="underline decoration-solid text-secondary"
          >Kontakta oss</RouterLink
        >
        <p class="text-secondary">info@fixmatch.se</p>
      </div>

      <div class="flex flex-col gap-1">
        <h2 class="text-2xl text-secondary font-title-bold">Användarvillkor</h2>

        <RouterLink
          to="/repair-shop-agreements"
          class="underline decoration-solid text-secondary mb-1"
          >Användarvillkor för verkstäder</RouterLink
        >

        <RouterLink to="/user-agreements" class="underline decoration-solid text-secondary"
          >Användarvillkor för fordonsägare</RouterLink
        >
      </div>

      <div class="flex flex-col gap-1">
        <h2 class="text-2xl text-secondary font-title-bold">Sekretesspolicy</h2>

        <RouterLink to="/privacy-policy" class="underline decoration-solid text-secondary"
          >Sekretesspolicy</RouterLink
        >
      </div>

      <div class="flex flex-col gap-2">
        <h2 class="text-2xl text-secondary font-title-bold">Logotyp av</h2>

        <div class="flex flex-col gap-1">
          <a
            href="https://www.linkedin.com/in/amanda-m%C3%A5rtensson-b05892259/"
            target="_blank"
            rel="noopener noreferrer"
            class="underline text-secondary"
            >Amanda Mårtensson</a
          >
        </div>
      </div>
    </div>
  </div>
</template>
