<script setup lang="ts">
import { onMounted, ref } from 'vue'
const mobile = ref(true)
const tablet = ref(false)
let width = document.documentElement.clientWidth

function updateScreenSize() {
  window.addEventListener('resize', updateScreenSize)
  width = document.documentElement.clientWidth
  if (width < 700) {
    mobile.value = true
    tablet.value = false
  } else {
    mobile.value = false
    tablet.value = true
  }
}

onMounted(() => {
  updateScreenSize()
})
</script>

<template>
  <section class="flex flex-col gap-8 w-full">
    <h2 class="text-2xl sm:text-2xl text-center text-main font-title-bold">Öka antalet kunder</h2>

    <p class="text-third text-center">
      Med hjälp av FixMatch kan du som verkstadsägare nå ut till ännu fler kunder än tidigare.
    </p>

    <div
      class="-8 flex items-end gap-[6%] w-full max-w-[320px] justify-center m-auto graph-container min-h-[264px]"
    >
      <div class="relative w-full">
        <div class="graph h-[112px] graph-1"></div>
      </div>
      <div class="relative w-full">
        <div class="graph h-[144px] graph-2"></div>
      </div>
      <div class="relative w-full">
        <div class="graph h-[80px] graph-3"></div>
      </div>
      <div class="relative w-full">
        <div class="graph h-[208px] graph-4"></div>
      </div>
      <div class="relative w-full">
        <div class="graph h-[264px] graph-5"></div>
      </div>
    </div>
  </section>
</template>
