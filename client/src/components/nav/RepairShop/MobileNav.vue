<script setup lang="ts">
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { onMounted, onUnmounted, ref } from 'vue'

const animateMenuBtn = ref(false)
const isScrolled = ref(false)

const maxHeight = ref('0px')

const authStore = useAuthStore()

const showMobileNav = () => {
  animateMenuBtn.value = !animateMenuBtn.value
  // const showMobileNavMenu = useShowMobileNavMenu()
  // showMobileNavMenu.showNavMenu(!isNavOpen.value)
  if (animateMenuBtn.value) {
    maxHeight.value = '100%' // Expand the height to full
  } else {
    maxHeight.value = '0px' // Collapse the height to 0
  }
}

const checkScroll = () => {
  isScrolled.value = window.scrollY >= 40
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
  checkScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>
<template>
  <section class="w-screen fixed bottom-0 flex flex-col justify-end shadow-top">
    <div class="w-full h-screen flex items-end backdrop-blur-sm bg-main" v-if="animateMenuBtn">
      <ul class="flex flex-col gap-8 pt-4 p-4 w-full">
        <li>
          <RouterLink to="/repair-shop" class="text-main flex gap-2 items-center"
            ><fontAwesome :icon="['fas', 'house']" aria-hidden="true" focusable="false" />
            <span>Hem</span></RouterLink
          >
        </li>

        <li v-if="!authStore.isAuthenticated">
          <RouterLink to="/register-repair-shop" class="text-main flex gap-2 items-center"
            ><fontAwesome :icon="['fas', 'fa-pen']" aria-hidden="true" focusable="false" />
            <span>Registrera</span></RouterLink
          >
        </li>

        <li>
          <RouterLink to="/contact" class="text-main flex gap-2 items-center"
            ><fontAwesome :icon="['fas', 'address-book']" aria-hidden="true" focusable="false" />
            <span>Kontakta oss</span></RouterLink
          >
        </li>

        <li>
          <RouterLink to="/about-us" class="text-main flex gap-2 items-center"
            ><fontAwesome :icon="['fas', 'people-group']" aria-hidden="true" focusable="false" />
            <span>Om oss</span></RouterLink
          >
        </li>

        <!-- <li>
          <RouterLink to="/news" class="flex items-center gap-2"
            ><fontAwesome :icon="['fas', 'newspaper']" aria-hidden="true" focusable="false" />
            Nyheter</RouterLink
          >
        </li> -->

        <li v-if="authStore.isAuthenticated">
          <RouterLink to="/my-jobs" class="text-main flex gap-2 items-center"
            ><fontAwesome :icon="['fas', 'folder-open']" aria-hidden="true" focusable="false" />
            <span>Mina jobb</span></RouterLink
          >
        </li>

        <div class="gray-line mt-1"></div>
        <li v-if="authStore.isAuthenticated">
          <button
            type="button"
            class="text-main flex gap-2 items-center mb-4"
            @click="authStore.signOut()"
          >
            <fontAwesome :icon="['fas', 'right-to-bracket']" aria-hidden="true" focusable="false" />
            <span>Logga ut</span>
          </button>
        </li>

        <li v-else>
          <RouterLink to="sign-in" class="text-main flex gap-2 items-center mb-4"
            ><fontAwesome
              :icon="['fas', 'right-to-bracket']"
              aria-hidden="true"
              focusable="false"
            />
            <span>Logga in</span></RouterLink
          >
        </li>
      </ul>
    </div>

    <div class="flex items-center justify-between w-full bottom-0 p-4 bg-main">
      <RouterLink to="/" class="text-deco-none"
        ><img src="../../assets/Fixmatch_logotyp_svart.png" alt="FixMatch logo" width="140px"
      /></RouterLink>
      <div class="nav-hamburger-icon">
        <button
          type="button"
          @click="showMobileNav"
          aria-label="Visa mobil navigering"
          :aria-expanded="animateMenuBtn"
        >
          <span :class="animateMenuBtn && 'span-nr1'"></span>
          <span :class="animateMenuBtn && 'span-nr2'"></span>
          <span :class="animateMenuBtn && 'span-nr3'"></span>
        </button>
      </div>
    </div>
  </section>
</template>
