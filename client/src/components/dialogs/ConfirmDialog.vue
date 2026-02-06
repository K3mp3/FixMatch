<!-- ConfirmDialog.vue with fixed z-index -->
<script setup lang="ts">
import type { PropType } from 'vue'
const props = defineProps({
  type: {
    type: String as PropType<'warning' | 'success' | 'error'>,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  headline: {
    type: String,
    required: false
  },
  acceptText: {
    type: String,
    required: true
  },
  cancelText: {
    type: String,
    required: true
  },
  icon: {
    type: Array as unknown as PropType<[string, string]>,
    required: true
  }
})
const emit = defineEmits(['confirm', 'cancel'])
</script>
<template>
  <Teleport to="body">
    <section
      class="w-full h-screen fixed bg-main-40 z-[9999] top-0 left-0 flex items-center justify-center p-4 text-center"
    >
      <div
        :class="[
          'p-4 bg-main rounded-lg flex flex-col gap-4 max-w-[750px]',
          props.type === 'success' && 'border-gr-success',
          props.type === 'warning' && 'border-gr-warning',
          props.type === 'error' && 'border-gr-error'
        ]"
      >
        <fontAwesome
          :icon="props.icon"
          :class="[
            'h-10',
            props.type === 'success' && 'text-sky-green',
            props.type === 'warning' && 'text-warning-orange',
            props.type === 'error' && 'text-error-red-full'
          ]"
        />
        <div>
          <strong>{{ props.headline }}</strong>
          <p>{{ props.message }}</p>
        </div>
        <button
          type="button"
          :class="[
            'text-secondary',
            props.type === 'success' && 'main-btn',
            props.type === 'warning' && 'warning-btn',
            props.type === 'error' && 'error-btn'
          ]"
          @click="emit('confirm')"
        >
          {{ props.acceptText }}
        </button>
        <button type="button" class="border-button rounded-[50px]" @click="emit('cancel')">
          {{ props.cancelText }}
        </button>
      </div>
    </section>
  </Teleport>
</template>
