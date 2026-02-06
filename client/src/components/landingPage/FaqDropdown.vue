<script setup lang="ts">
import { ref } from 'vue'

const extendedDropDown = ref(false)

const props = defineProps({
  question: {
    type: Object,
    required: true
  }
})

function extendDropDown() {
  extendedDropDown.value = !extendedDropDown.value
}
</script>

<template>
  <div class="w-full rounded-[10px] p-2 flex flex-col justify-between relative text-main">
    <div class="w-full h-full flex items-center justify-between mt-2">
      <h3 class="font-title-bold w-full text-main">{{ props.question.title }}</h3>

      <button
        type="button"
        class="w-full text-end absolute pr-4"
        @click="extendDropDown"
        :aria-label="extendedDropDown ? 'Stäng FAQ' : 'Öppna FAQ'"
      >
        <fontAwesome
          :icon="['fas', 'chevron-down']"
          v-if="!extendedDropDown"
          class="text-sky-blue"
        />
        <fontAwesome :icon="['fas', 'chevron-up']" v-if="extendedDropDown" class="text-sky-blue" />
      </button>
    </div>

    <div class="mt-2" v-if="extendedDropDown">
      <p class="text-third">{{ props.question.text }}</p>
    </div>
    <div class="gray-line mt-6"></div>
  </div>
</template>
