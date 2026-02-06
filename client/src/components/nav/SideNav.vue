<script setup lang="ts">
import type { PropType } from 'vue'
import StarVisualization from '../assets/StarVisualization.vue'

const props = defineProps({
  highlight: {
    type: String as PropType<
      'sent' | 'settings' | 'home' | 'signOut' | 'bookings' | 'job' | 'editor'
    >,
    required: true
  },
  repairShop: {
    type: Boolean
  },
  admin: {
    type: Boolean
  }
})

const emit = defineEmits<{
  (e: 'signOut'): void
}>()
</script>

<template>
  <section class="flex flex-col gap-6 items-center h-full py-2 overscroll-y-auto">
    <div class="p-4">
      <img src="../../assets/Fixmatch_logotyp_svart.png" alt="FixMatch logo" width="220px" />
    </div>

    <div class="gray-line"></div>

    <ul class="p-4 w-full flex flex-col justify-center gap-4 h-[calc(100%-168px)]">
      <li class="relative">
        <RouterLink
          :to="props.admin ? '/admin' : props.repairShop ? '/repair-shop-garage-home' : '/my-jobs'"
          :class="[
            'flex gap-3 justify-start items-center p-4 w-full rounded-[10px] ',
            props.highlight === 'home' ? 'blue-100 text-sky-blue' : 'text-third'
          ]"
          aria-label="Gå till hem"
          ><fontAwesome :icon="['fas', 'message']" />Förfrågningar
        </RouterLink>
      </li>
      <li class="relative" v-if="props.repairShop && !props.admin">
        <RouterLink
          to="/repair-shop-settings"
          :class="[
            'flex gap-3 justify-start items-center p-4 w-full rounded-[10px]',
            props.highlight === 'settings' ? 'blue-100 text-sky-blue' : 'text-third'
          ]"
          aria-label="Gå till inställningar"
        >
          <fontAwesome :icon="['fas', 'gear']" />Inställningar
        </RouterLink>
      </li>
      <li class="relative">
        <RouterLink
          :to="props.repairShop ? '/repair-shop-garage-bookings' : '/user-garage-bookings'"
          v-if="!props.admin"
          :class="[
            'flex gap-3 justify-start items-center p-4 w-full rounded-[10px] ',
            props.highlight === 'bookings' ? 'blue-100 text-sky-blue' : 'text-third'
          ]"
          aria-label="Gå till bokningar"
          ><fontAwesome :icon="['fas', 'calendar']" />Bokningar
        </RouterLink>
      </li>

      <li class="relative" v-if="!props.repairShop && !props.admin">
        <RouterLink
          to="/user-garage-new"
          :class="[
            'flex gap-2 justify-start items-center p-4 w-full rounded-[10px]',
            props.highlight === 'job' && 'text-sky-green star-btn'
          ]"
          aria-label="Gå till skapa uppdrag"
          ><fontAwesome :icon="['fas', 'plus']" />Skapa uppdrag
          <StarVisualization v-if="props.highlight === 'job'" />
        </RouterLink>
      </li>

      <li class="relative" v-if="props.admin">
        <RouterLink
          to="/text-editor"
          :class="[
            'flex gap-2 justify-start items-center p-4 w-full rounded-[10px]',
            props.highlight === 'editor' && 'text-sky-green star-btn'
          ]"
          aria-label="Gå till text editor"
          ><fontAwesome :icon="['fas', 'plus']" />Text editor
          <StarVisualization v-if="props.highlight === 'editor'" />
        </RouterLink>
      </li>
    </ul>
    <div class="gray-line m-0"></div>
    <div class="p-4 w-full">
      <button
        type="button"
        :class="[
          'main-btn w-full font-text-light flex flex-row items-center justify-center gap-2 p-4'
        ]"
        @click="() => emit('signOut')"
      >
        Logga ut
        <fontAwesome :icon="['fas', 'right-from-bracket']" />
      </button>
    </div>
  </section>
</template>
