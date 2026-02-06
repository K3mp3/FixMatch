<script setup lang="ts"></script>

<template>
  <section class="flex flex-col gap-8 items-center w-full max-w-[1000px]">
    <h2 class="text-main text-2xl md:text-4xl font-title-black">Våra erbjudanden</h2>

    <div class="flex flex-col gap-10 sm:flex-row text-main relative justify-center p-4 w-full">
      <article
        class="top-0 flex flex-col justify-center p-4 gap-4 bg-sky-white rounded-[16px] w-full drop-shadow-lg"
      >
        <h2 class="text-xl sm:text-2xl xl:text-3xl w-full text-main font-title-bold">
          Verkstad core
        </h2>
        <p class="text-main">En bra plan för nybörjare</p>

        <p class="text-third"><strong class="text-xl sm:text-2xl text-main">SEK 0</strong> /mån</p>

        <div class="flex gap-4 w-full items-center">
          <fontAwesome :icon="['fas', 'check']" class="text-sky-green" />

          <p class="text-main">5% kommision av varje bokat jobb</p>
        </div>

        <div class="flex gap-4 w-full items-center">
          <fontAwesome :icon="['fas', 'check']" class="text-sky-green" />

          <p class="text-main">Obegränsat antal jobb</p>
        </div>

        <div class="flex gap-4 w-full items-center">
          <fontAwesome :icon="['fas', 'check']" class="text-sky-green" />

          <p class="text-main">4 månaders gratis testperiod</p>
        </div>

        <RouterLink
          to="/register-repair-shop?core"
          class="border-button flex items-center justify-center rounded-full"
          >Registrera</RouterLink
        >
      </article>

      <article
        class="w-full top-0 flex flex-col justify-center p-4 lg:px-6 gap-4 rounded-[16px] drop-shadow-md bg-sky-white"
      >
        <h2 class="text-xl sm:text-2xl xl:text-3xl w-full text-main font-title-bold">
          Verkstad premium
        </h2>
        <p class="text-main">För er med löpande uppdrag</p>

        <p class="text-third">
          <strong class="text-xl sm:text-2xl text-main">SEK 199</strong> /mån
        </p>

        <div class="flex gap-4 w-full items-center">
          <fontAwesome :icon="['fas', 'check']" class="text-sky-green" />

          <p class="text-main">Ingen extra avgift per jobb</p>
        </div>

        <div class="flex gap-4 w-full items-center">
          <fontAwesome :icon="['fas', 'check']" class="text-sky-green" />

          <p class="text-main">Obegränsat antal jobb</p>
        </div>

        <div class="flex gap-4 w-full items-center">
          <fontAwesome :icon="['fas', 'check']" class="text-sky-green" />

          <p class="text-main">4 månaders gratis testperiod</p>
        </div>

        <RouterLink
          to="/register-repair-shop?premium"
          class="main-btn text-secondary flex items-center justify-center"
          >Testa gratis</RouterLink
        >
      </article>
    </div>
  </section>
</template>
