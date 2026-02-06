<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  backgroundColor: {
    type: Boolean
  }
})

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
      <div class="w-full">
        <RouterLink to="/repair-shop" v-if="navScroll || props.backgroundColor">
          <img
            src="/src/assets/Fixmatch_logo_blue.webp
            "
            alt="FixMatch logo"
            width="220px"
            class="max-w-96"
          />
        </RouterLink>
        <RouterLink to="/repair-shop" v-else>
          <img
            src="/src/assets/Fixmatch_logotyp_vit.png"
            alt="FixMatch logo"
            width="220px"
            class="max-w-96"
          />
        </RouterLink>
      </div>
      <div class="w-full text-main flex gap-10 justify-center w-full">
        <RouterLink
          to="/repair-shop"
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
          to="/price-plans"
          :class="[
            'gap-2',
            navScroll || props.backgroundColor
              ? 'text-third router-link'
              : 'text-secondary text-[1rem]'
          ]"
        >
          Priser</RouterLink
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
      <div class="w-full flex gap-4 items-center justify-end text-secondary w-full">
        <RouterLink
          to="/register-repair-shop"
          :class="[
            'w-32 flex items-center justify-center',
            navScroll || props.backgroundColor ? 'main-btn' : 'secondary-btn-white-hover'
          ]"
        >
          Registrera
        </RouterLink>

        <RouterLink
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
