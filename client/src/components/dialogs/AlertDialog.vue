<script setup lang="ts">
const emit = defineEmits<{
  (e: 'closeDialog'): void
}>()

function closeDialog() {
  emit('closeDialog')
}
</script>

<template>
  <div
    class="w-full h-screen bg-main-20 top-0 z-10 fixed p-4 md:p-6 flex items-center justify-center"
  >
    <div
      class="w-full p-4 bg-sky-white md:p-6 rounded-lg flex flex-col items-center text-center gap-2 response-dialog-fail relative max-w-96"
    >
      <button
        type="button"
        @click="closeDialog"
        class="btn-back-light absolute top-2 left-2 md:left-6 md:top-6"
      >
        <fontAwesome :icon="['fas', 'x']" />
      </button>
      <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-error-red-full h-5" />
      <p class="font-title-bold text-lg">Redan registrerad</p>
      <p class="text-xs text-third">
        Har det skett av misstag? Kontakta oss genom att klicka på knappen nedanför.
      </p>
      <RouterLink to="contact" class="main-btn w-36 flex gap-2 items-center justify-center mt-2">
        Kontakta oss</RouterLink
      >
    </div>
  </div>
</template>
