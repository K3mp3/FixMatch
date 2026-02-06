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
  // Check scroll position initially
  checkScroll()
})

// Remove event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>
<template>
  <section class="w-screen fixed bottom-0 flex flex-col justify-end border-top-main">
    <div class="w-full h-screen flex items-end backdrop-blur-sm bg-main-90" v-if="animateMenuBtn">
      <ul class="flex flex-col gap-8 pt-4 p-4 w-full">
        <li>
          <RouterLink to="/" class="text-main flex gap-2 items-center"
            ><fontAwesome :icon="['fas', 'house']" aria-hidden="true" focusable="false" />
            <span>Hem</span></RouterLink
          >
        </li>

        <li>
          <RouterLink to="/my-jobs" class="text-main flex gap-2 items-center"
            ><fontAwesome :icon="['fas', 'fa-pen']" aria-hidden="true" focusable="false" />
            <span>Mina jobb</span></RouterLink
          >
        </li>

        <li>
          <RouterLink to="/contact" class="text-main flex gap-2 items-center"
            ><fontAwesome :icon="['fas', 'address-book']" aria-hidden="true" focusable="false" />
            <span>Kontakta oss</span></RouterLink
          >
        </li>

        <li>
          <RouterLink to="/get-offers" class="text-main flex gap-2 items-center"
            ><fontAwesome :icon="['fas', 'plus']" aria-hidden="true" focusable="false" />
            <span>Få offerter</span></RouterLink
          >
        </li>

        <div class="white-line mt-1"></div>

        <li>
          <button
            type="button"
            class="text-main flex items-center justify-center"
            @click="authStore.signOut()"
          >
            Logga ut
          </button>
        </li>
      </ul>
    </div>

    <div class="flex items-center justify-between w-full bottom-0 backdrop-blur-sm bg-main-90 p-4">
      <RouterLink to="/" class="text-deco-none"
        ><img src="../../assets/Fixmatch_logotyp_vit.png" alt="FixMatch logo" width="140px"
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
