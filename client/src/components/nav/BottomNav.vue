<script setup lang="ts">
import { useAuthStore } from '@/stores/StoreSignedInUsers'
import type { PropType } from 'vue'

const props = defineProps({
  highlight: {
    type: String as PropType<
      'sent' | 'settings' | 'home' | 'job' | 'bookings' | 'signOut' | 'editor'
    >,
    required: true
  },
  repairShop: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()

function signOutUser() {
  authStore.signOut()
}
</script>

<template>
  <section class="w-full bg-sky-white shadow-top p-3 z-10">
    <ul
      class="text-main m-0 p-0 flex justify-evenly gap-10 relative"
      v-if="props.repairShop === false"
    >
      <li>
        <RouterLink to="my-jobs">
          <fontAwesome
            :icon="['fas', 'paper-plane']"
            :class="['h-4', props.highlight === 'sent' && 'text-sky-blue']"
          />
        </RouterLink>
      </li>
      <li>
        <RouterLink to="user-garage-new">
          <fontAwesome
            :icon="['fas', 'plus']"
            :class="['h-5', props.highlight === 'job' && 'text-sky-blue']"
          />
        </RouterLink>
      </li>
      <li>
        <RouterLink to="user-garage-bookings">
          <fontAwesome
            :icon="['fas', 'calendar']"
            :class="['h-5', props.highlight === 'bookings' && 'text-sky-blue']"
          />
        </RouterLink>
      </li>
      <li>
        <button type="button" @click="signOutUser">
          <fontAwesome
            :icon="['fas', 'right-from-bracket']"
            :class="['h-4', props.highlight === 'signOut' && 'text-sky-blue']"
          />
        </button>
      </li>
    </ul>
    <ul
      class="text-main m-0 p-0 flex justify-evenly gap-10 relative mt-1"
      v-if="props.repairShop === true"
    >
      <li>
        <RouterLink to="repair-shop-settings">
          <fontAwesome
            :icon="['fas', 'gear']"
            :class="['h-4', props.highlight === 'settings' && 'text-sky-blue']"
          />
        </RouterLink>
      </li>
      <li>
        <RouterLink to="repair-shop-garage-home">
          <fontAwesome
            :icon="['fas', 'house']"
            :class="['h-4', props.highlight === 'home' && 'text-sky-blue']"
          />
        </RouterLink>
      </li>
      <li>
        <RouterLink to="repair-shop-garage-bookings">
          <fontAwesome
            :icon="['fas', 'calendar']"
            :class="['h-4', props.highlight === 'bookings' && 'text-sky-blue']"
          />
        </RouterLink>
      </li>
      <li>
        <button type="button" @click="signOutUser">
          <fontAwesome
            :icon="['fas', 'right-from-bracket']"
            :class="['h-4', props.highlight === 'signOut' && 'text-sky-blue']"
          />
        </button>
      </li>
    </ul>
  </section>
</template>
