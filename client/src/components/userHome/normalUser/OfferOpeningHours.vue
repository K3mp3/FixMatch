<script setup lang="ts">
import type { ITimeSlot } from '@/models/ITimeSlot'
import { type PropType } from 'vue'

const props = defineProps({
  openingHours: {
    type: Object as PropType<ITimeSlot[]>,
    required: true
  }
})

const dayTranslations = {
  monday: 'Mån',
  tuesday: 'Tis',
  wednesday: 'Ons',
  thursday: 'Tors',
  friday: 'Fre',
  saturday: 'Lör',
  sunday: 'Sön'
} as const

function formatTime(time: string) {
  if (!time) return ''
  return `${time.slice(0, 2)}:${time.slice(2)}`
}
</script>

<template>
  <section class="w-full flex flex-col gap-4 mt-2 mb-2">
    <div class="grid grid-cols-[60px_1fr] gap-x-4">
      <template v-for="(time, index) in props.openingHours" :key="index">
        <span class="font-medium">{{
          dayTranslations[time.day as keyof typeof dayTranslations]
        }}</span>
        <div class="flex flex-col">
          <span>
            {{ time.isOpen ? `${formatTime(time.open)} - ${formatTime(time.close)}` : 'Stängt' }}
          </span>
          <span v-if="time.hasLunch" class="text-sm mb-2">
            Lunch: {{ formatTime(time.lunchStart) }} - {{ formatTime(time.lunchEnd) }}
          </span>
        </div>
      </template>
    </div>
  </section>
</template>
