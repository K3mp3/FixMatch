<script setup lang="ts">
const props = defineProps({
  success: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  heading: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'closeModal'): void
}>()
</script>

<template>
  <section
    class="w-screen h-screen bg-main-20 z-50 fixed flex text-main p-4 sm:p-8 md:p-16 items-center justify-center top-0 left-0"
  >
    <div
      class="p-4 rounded-lg bg-sky-white drop-shadow-lg flex flex-col gap-4 items-center max-w-[500px]"
    >
      <div class="flex justify-between gap-16 w-full">
        <h2 class="text-lg font-title-bold">{{ props.title }}</h2>

        <button type="button" class="text-third" @click="emit('closeModal')">
          <fontAwesome :icon="['fas', 'x']" />
        </button>
      </div>
      <div class="gray-line"></div>

      <div
        :class="[
          'w-12 h-12 flex items-center justify-center rounded-full',
          props.success ? 'green-100 text-sky-green' : 'red-100 text-error-red-full'
        ]"
      >
        <fontAwesome :icon="['fas', 'circle-check']" class="h-5" v-if="props.success" />
        <fontAwesome :icon="['fas', 'circle-exclamation']" class="h-5" v-else />
      </div>

      <p>{{ props.heading }}</p>
      <p class="text-third text-center">{{ props.text }}</p>

      <button type="button" class="main-btn rounded-lg" @click="emit('closeModal')">Stäng</button>
    </div>
  </section>
</template>
