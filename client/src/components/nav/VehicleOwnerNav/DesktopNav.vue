<script setup lang="ts">
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  backgroundColor: {
    type: Boolean
  }
})

const authStore = useAuthStore()
const navScroll = ref(false)

function changeNavColor() {
  if (document.documentElement.scrollTop > 67) navScroll.value = true
  else {
    navScroll.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', changeNavColor)
  changeNavColor()
})

onUnmounted(() => {
  window.removeEventListener('scroll', changeNavColor)
})
</script>

<template>
  <div
    class="w-screen z-20 fixed top-0 transition-all duration-300"
    :class="[navScroll || props.backgroundColor ? 'bg-main drop-shadow-md' : 'bg-transparent']"
  >
    <div class="flex p-4 xl:p-6 gap-4 z-20 items-center">
      <div class="">
        <RouterLink to="/vehicle-owner" v-if="navScroll || props.backgroundColor">
          <img
            src="/src/assets/Fixmatch_logo_blue.webp
            "
            alt="FixMatch logo"
            width="220px"
            class="w-96"
          />
        </RouterLink>
        <RouterLink to="/vehicle-owner" v-else>
          <img
            src="/src/assets/Fixmatch_logotyp_vit.png"
            alt="FixMatch logo"
            width="220px"
            class="w-96"
          />
        </RouterLink>
      </div>
      <div class="w-full text-main flex gap-10 justify-start ml-24">
        <RouterLink
          to="/vehicle-owner"
          :class="[
            'gap-2',
            navScroll || props.backgroundColor
              ? 'text-third router-link'
              : 'text-secondary text-[1rem]'
          ]"
        >
          Hem</RouterLink
        >
        <RouterLink
          to="contact"
          :class="[
            'gap-2',
            navScroll || props.backgroundColor
              ? 'text-third router-link'
              : 'text-secondary text-[1rem]'
          ]"
        >
          Kontakt</RouterLink
        >
        <RouterLink
          to="/get-offers"
          :class="[
            'gap-2',
            navScroll || props.backgroundColor
              ? 'text-third router-link'
              : 'text-secondary text-[1rem]'
          ]"
        >
          Få offerter</RouterLink
        >
        <RouterLink
          to="/about-us"
          :class="[
            'gap-2',
            navScroll || props.backgroundColor
              ? 'text-third router-link'
              : 'text-secondary text-[1rem]'
          ]"
        >
          Om oss</RouterLink
        >
      </div>
      <div class="w-full flex gap-4 items-center justify-end text-secondary">
        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/my-jobs"
          :class="[
            'w-32 flex items-center justify-center',
            navScroll || props.backgroundColor ? 'main-btn' : 'secondary-btn-white-hover'
          ]"
        >
          Mina jobb
        </RouterLink>
        <RouterLink
          v-else
          to="register"
          :class="[
            'w-32 flex items-center justify-center',
            navScroll || props.backgroundColor ? 'main-btn' : 'secondary-btn-white-hover'
          ]"
        >
          Registrera
        </RouterLink>
        <button
          v-if="authStore.isAuthenticated"
          type="button"
          :class="[
            'flex justify-center text-main w-32',
            navScroll || props.backgroundColor ? 'text-main router-link' : 'text-secondary'
          ]"
          @click="authStore.signOut()"
        >
          Logga ut
        </button>
        <RouterLink
          v-else
          to="sign-in"
          :class="[
            'flex justify-center text-main w-32',
            navScroll || props.backgroundColor ? 'text-main router-link' : 'text-secondary'
          ]"
        >
          Logga in
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transition-all {
  transition-property: all;
}
.duration-300 {
  transition-duration: 300ms;
}
</style>
