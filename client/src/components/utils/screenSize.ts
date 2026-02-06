import { onMounted, onUnmounted, ref } from 'vue'

const mobileScreen = ref(true)

let resizeTimeout: ReturnType<typeof setTimeout> | null = null

export const updateScreenSize = (width: number): boolean => {
  if (width > 1023) {
    return false
  } else {
    return true
  }
}

function resizeThrottler() {
  if (!resizeTimeout) {
    resizeTimeout = setTimeout(function () {
      resizeTimeout = null
      mobileScreen.value = updateScreenSize(document.documentElement.clientWidth)
    }, 66)
  }
}

onMounted(() => {
  window.addEventListener('resize', resizeThrottler, false)
  resizeThrottler()
})

onUnmounted(() => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  window.removeEventListener('resize', resizeThrottler, false)
})
