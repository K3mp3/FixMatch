<script setup lang="ts">
import type { IRepairShopAnswer } from '@/models/IRepairShopAnswer'
import type { PropType } from 'vue'

const props = defineProps({
  answer: {
    type: Object as PropType<IRepairShopAnswer>,
    required: true
  },
  customerMessage: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section class="w-full flex flex-col gap-4">
    <div>
      <strong>Meddelande:</strong>
      <p class="flex flex-col">
        {{ props.customerMessage[0].message }}
      </p>
    </div>

    <div>
      <strong>Typ av arbete:</strong>
      <p class="flex flex-col">
        {{ props.customerMessage.work ? props.customerMessage.work : props.answer.type }}
      </p>
    </div>
  </section>
</template>
