<template>
  <canvas ref="particleCanvas"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const particleCanvas = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number
  y: number
  radius: number
  opacity: number
  fade: number
}

let particles: Particle[] = []
const particleCount = 200 // Adjust the number of particles as needed
let animationFrameId: number

const createParticles = (canvas: HTMLCanvasElement) => {
  const width = canvas.width
  const height = canvas.height

  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 0.5, // Particle size
    opacity: Math.random(),
    fade: Math.random() * 0.02 + 0.005 // Speed of shimmer
  }))
}

const animateParticles = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach((particle) => {
    // Update particle opacity for shimmering effect
    particle.opacity += particle.fade
    if (particle.opacity <= 0 || particle.opacity >= 1) {
      particle.fade = -particle.fade // Reverse fading direction
    }

    // Draw the particle
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})` // White with opacity
    ctx.fill()
  })

  // Request the next animation frame
  animationFrameId = requestAnimationFrame(() => animateParticles(canvas, ctx))
}

const setupCanvas = () => {
  const canvas = particleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Create and animate particles
  createParticles(canvas)
  animateParticles(canvas, ctx)

  // Handle window resizing
  const handleResize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    createParticles(canvas)
  }
  window.addEventListener('resize', handleResize)

  // Cleanup event listener
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationFrameId) // Stop animation loop
  })
}

onMounted(setupCanvas)
</script>

<style>
/* Style to ensure the canvas fills the viewport */
canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black; /* Background color */
  z-index: -1; /* Ensure it stays behind other content */
}
</style>
