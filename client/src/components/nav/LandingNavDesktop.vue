<script setup lang="ts">
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  backgroundColor: {
    type: Boolean
  },
  landing: {
    type: Boolean,
    default: false
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
    <div class="flex p-4 px-10 gap-4 z-20 items-center">
      <div class="">
        <RouterLink to="/" v-if="navScroll || props.backgroundColor">
          <img
            src="/src/assets/Vayme_logo_blue.webp
            "
            alt="FixMatch logo"
            width="160px"
            class="w-44"
          />
        </RouterLink>
      </div>
      <div class="w-full text-main flex gap-10 justify-end">
        <RouterLink
          to="/"
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
