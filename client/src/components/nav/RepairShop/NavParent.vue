<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DesktopNav from './DesktopNav.vue'
import MobileNav from './MobileNav.vue'

const props = defineProps({
  backgroundColor: {
    type: Boolean,
    default: true
  }
})

const navMobile = ref(true)
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

const currentNav = computed(() => {
  if (navMobile.value) {
    return 'LandingNavMobile'
  } else {
    return 'LandingNavDesktop'
  }
})

function updateScreenSize() {
  const width = document.documentElement.clientWidth
  navMobile.value = width <= 1023
}

function resizeThrottler() {
  if (!resizeTimeout) {
    resizeTimeout = setTimeout(function () {
      resizeTimeout = null
      updateScreenSize()
    }, 66)
  }
}

onMounted(() => {
  resizeThrottler()
  window.addEventListener('resize', resizeThrottler, false)
})

onUnmounted(() => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  window.removeEventListener('resize', resizeThrottler, false)
})
</script>

<template>
  <component :is="navMobile ? MobileNav : DesktopNav" :backgroundColor="props.backgroundColor" />
</template>
