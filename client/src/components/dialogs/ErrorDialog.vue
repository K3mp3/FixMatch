<script setup lang="ts">
import router from '@/router'

const props = defineProps({
  closeDialog: {
    type: Function,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  btnText: {
    type: String,
    required: true
  }
})

function directUser() {
  router.push('/contact')
}
</script>

<template>
  <div
    class="w-screen h-screen bg-main-20 z-50 flex text-main p-4 sm:p-8 md:p-16 items-center justify-center fixed top-0 left-0"
  >
    <div
      class="w-full max-w-[500px] radius-10 bg-main z-50 absolute flex flex-col gap-6 text-main p-8 items-center justify-center rounded-lg"
    >
      <div class="flex gap-4 w-full items-center">
        <button
          type="button"
          class="btn-back-light"
          aria-label="Stäng popup rutan"
          @click="() => props.closeDialog(false)"
        >
          <fontAwesome :icon="['fas', 'chevron-left']" />
        </button>
      </div>

      <div class="flex flex-col gap-4 justify-center items-center">
        <fontAwesome
          :icon="['fas', 'circle-exclamation']"
          class="w-12 h-12 text-error-red-full mb-2"
        />
        <h2 class="text-lg font-title-bold text-center">{{ title }}</h2>
        <button type="button" class="main-btn" @click="directUser">
          {{ btnText }}
        </button>
      </div>
    </div>
  </div>
</template>
