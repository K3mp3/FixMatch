<script setup lang="ts">
import LandingFooter from '@/components/footer/LandingFooter.vue'
import NavParent from '@/components/nav/RepairShop/NavParent.vue'
import PricingPlans from '@/components/pricing/PricingPlans.vue'
</script>

<template>
  <nav class="w-full fixed z-10">
    <NavParent />
  </nav>

  <main class="p-4 lg:p-16 w-full mb-24 flex flex-col items-center justify-center mt-[91px]">
    <PricingPlans />
  </main>

  <footer>
    <LandingFooter />
  </footer>
</template>
