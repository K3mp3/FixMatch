<!-- src/components/GoogleAdSense.vue -->
<template>
  <div class="ad-container">
    <ins
      class="adsbygoogle"
      :style="{ display: 'block' }"
      :data-ad-client="adClient"
      :data-ad-slot="adSlot"
      :data-ad-format="adFormat"
      data-full-width-responsive="true"
    ></ins>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted } from 'vue'

const props = defineProps({
  adClient: {
    type: String,
    default: 'ca-pub-6485247997045508'
  },
  adSlot: {
    type: String,
    required: true
  },
  adFormat: {
    type: String,
    default: 'auto'
  }
})

onMounted(() => {
  try {
    // @ts-ignore
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (error) {
    console.error('AdSense error:', error)
  }
})
</script>

<style scoped>
.ad-container {
  margin: 20px 0;
  text-align: center;
  min-height: 100px;
}
</style>
