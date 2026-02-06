<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { FloatingParticlesVisualization } from './globe'

const canvas = ref<HTMLCanvasElement | null>(null)
const fallbackVisible = ref(false)
let globe: FloatingParticlesVisualization | null = null

onMounted(() => {
  // Check for WebGL support directly in the component
  if (!isWebGLAvailable()) {
    console.warn('WebGL not available, showing fallback')
    fallbackVisible.value = true
    return
  }

  if (canvas.value) {
    try {
      globe = new FloatingParticlesVisualization(canvas.value)
    } catch (error) {
      console.error('Failed to initialize globe visualization:', error)
      fallbackVisible.value = true
    }
  }
})

onBeforeUnmount(() => {
  if (globe) {
    globe.dispose()
    globe = null
  }
})

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    return false
  }
}
</script>

<template>
  <div
    class="globe-container absolute top-0 mt-[70px] md:mt-[100px] lg:mt-[133px] left-0 w-full h-full"
  >
    <!-- Only show canvas if WebGL is supported -->
    <canvas v-if="!fallbackVisible" ref="canvas" class="w-full h-full"></canvas>

    <!-- Show fallback when WebGL is not available -->
    <div v-if="fallbackVisible" class="fallback-container">
      <!-- Static decorative element as fallback -->
      <div class="static-globe">
        <div class="glow-effect"></div>
        <div class="static-particles"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.globe-container {
  position: absolute;
  z-index: 0;
  overflow: hidden;
}

.fallback-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.static-globe {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: rgba(33, 218, 107, 0.05);
  position: relative;
  overflow: hidden;
}

.glow-effect {
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  background: radial-gradient(
    circle at center,
    rgba(33, 218, 107, 0.2) 0%,
    rgba(33, 218, 107, 0.1) 30%,
    rgba(33, 218, 107, 0) 70%
  );
  animation: pulse 3s infinite alternate;
}

.static-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(rgba(33, 218, 107, 0.7) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}
</style>
