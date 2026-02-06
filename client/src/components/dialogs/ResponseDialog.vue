<script setup lang="ts">
const props = defineProps({
  isConfirmationSuccess: {
    type: Boolean,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div
    class="w-screen h-screen bg-main-20 z-50 fixed flex text-main p-4 sm:p-8 md:p-16 items-center justify-center top-0 left-0"
  >
    <div
      :class="[
        'z-[60]',
        props.isConfirmationSuccess ? 'response-dialog-success' : 'response-dialog-fail'
      ]"
    >
      <fontAwesome
        v-if="props.isConfirmationSuccess"
        :icon="['fas', 'check']"
        class="text-main font-title-bold O35rem"
      />

      <fontAwesome
        v-else
        :icon="['fas', 'triangle-exclamation']"
        class="text-main font-title-bold O35rem"
      />
      <p class="text-main font-title-bold O1rem">{{ props.text }}</p>
    </div>
  </div>
</template>
