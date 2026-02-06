<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps<{
  showDialog: boolean
}>()

const emit = defineEmits<{
  accept: []
  decline: []
}>()

function handleAccept() {
  emit('accept')
}

function handleDecline() {
  emit('decline')
}
</script>

<template>
  <section
    v-if="showDialog"
    class="w-full h-screen fixed z-10 bg-main-90 top-0 left-0 flex items-center justify-center p-4"
  >
    <div class="box z-20 relative">
      <div class="w-full h-[68px] absolute top-0 flex items-center p-4 gap-4">
        <div class="pt-3 pb-2 px-3 rounded-[12px] border-main">
          <font-awesome-icon :icon="['fas', 'cookie']" class="text-main h-5" />
        </div>
        <h2 class="">Acceptera cookies</h2>
      </div>
      <div class="w-full flex flex-col gap-6 absolute bottom-0 p-4 items-center">
        <p class="text-third">
          Denna webbsida finansieras med reklam genom Google Adsense. För att visa reklam genom
          Google Adsense behöver vi din tillåtelse till det. Om du accepterar, klicka på acceptera
          knappen
        </p>
        <div class="flex gap-4 w-full justify-center">
          <button type="button" class="main-btn" @click="handleAccept">Acceptera</button>
          <button type="button" class="border-button rounded-full" @click="handleDecline">
            Avböj
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
