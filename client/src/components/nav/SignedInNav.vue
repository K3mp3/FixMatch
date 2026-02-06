<script setup lang="ts">
import BottomNav from '@/components/nav/BottomNav.vue'
import SideNav from '@/components/nav/SideNav.vue' /* PartiallyEnd: #3632/scriptSetup.vue */
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import { onMounted, onUnmounted, ref, type PropType } from 'vue'

const props = defineProps({
  repairShop: {
    type: Boolean
  },
  highlight: {
    type: String as PropType<
      'sent' | 'settings' | 'home' | 'signOut' | 'bookings' | 'job' | 'editor'
    >,
    required: true
  },
  admin: {
    type: Boolean
  }
})

const navMobile = ref(true)
const authStore = useAuthStore()

let resizeTimeout: ReturnType<typeof setTimeout> | null = null

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

function signOutUser() {
  authStore.signOut()
}

onMounted(async () => {
  window.addEventListener('resize', resizeThrottler, false)
  resizeThrottler()
})

onUnmounted(() => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  window.removeEventListener('resize', resizeThrottler, false)
})
</script>

<template>
  <nav
    :class="[
      !navMobile
        ? 'fixed w-[205px] xl:w-[250px] 2xl:w-[300px] h-screen bg-sky-white drop-shadow-lg'
        : 'fixed bottom-0 w-full left-0 flex justify-center z-10'
    ]"
  >
    <SideNav
      :highlight="props.highlight"
      @signOut="signOutUser"
      :repairShop="props.repairShop"
      :admin="props.admin"
      v-if="!navMobile"
    />
    <BottomNav :highlight="props.highlight" :repairShop="props.repairShop" v-if="navMobile" />
    <div class="gray-line-vertical absolute top-0 right-0"></div>
  </nav>
</template>
