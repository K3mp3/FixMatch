<script setup lang="ts">
import { ref } from 'vue'

const particles = ref([
  { marginRight: '6px', marginTop: '-39px' },
  { marginRight: '7px', marginTop: '38px' },
  { marginRight: '50px', marginTop: '10px' },
  { marginRight: '100px', marginTop: '-10px' },
  { marginRight: '90px', marginTop: '-10px' },
  { marginRight: '10px', marginTop: '-20px' },
  { marginRight: '20px', marginTop: '-10px' },
  { marginRight: '30px', marginTop: '-30px' },
  { marginRight: '20px', marginTop: '-35px' },
  { marginRight: '40px', marginTop: '-10px' },
  { marginRight: '50px', marginTop: '-20px' },
  { marginRight: '70px', marginTop: '-39px' },
  { marginRight: '80px', marginTop: '20px' },
  { marginRight: '90px', marginTop: '-30px' },
  { marginRight: '10px', marginTop: '20px' },
  { marginRight: '15px', marginTop: '40px' },
  { marginRight: '20px', marginTop: '30px' },
  { marginRight: '30px', marginTop: '10px' },
  { marginRight: '40px', marginTop: '30px' },
  { marginRight: '60px', marginTop: '-10px' },
  { marginRight: '100px', marginTop: '20px' },
  { marginRight: '65px', marginTop: '30px' },
  { marginRight: '118px', marginTop: '0px' },
  { marginRight: '130px', marginTop: '-30px' }
])
</script>

<template>
  <div
    v-for="(particle, index) in particles"
    :key="index"
    class="w-[1px] h-[1px] bg-sky-green rounded-full absolute right-0 particle1"
    :style="{
      marginRight: particle.marginRight,
      marginTop: particle.marginTop,
      animationDuration: `${Math.random() * 3 + 3}s` /* Random duration between 3s and 6s */,
      animationDelay: `${Math.random()}s` /* Random delay for variation */
    }"
  ></div>
</template>

<style scoped>
/* Common styles for particles */
.particle1 {
  animation: shimmer infinite ease-in-out;
}

/* Keyframes for the shimmer effect */
@keyframes shimmer {
  0% {
    opacity: 0.8;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.8;
    transform: scale(0.8);
  }
}
</style>
