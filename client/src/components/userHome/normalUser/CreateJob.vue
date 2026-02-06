<script setup lang="ts">
import SignedInNav from '@/components/nav/SignedInNav.vue'

import OfferForm from '@/components/offerForm/OfferForm.vue'
</script>

<template>
  <SignedInNav :repairShop="false" :highlight="'job'" />
  <OfferForm :signedIn="true" />
</template>
