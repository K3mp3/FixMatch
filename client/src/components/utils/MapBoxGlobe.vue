<template>
  <div ref="mapContainer" class="w-full h-64 relative"></div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  address: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default:
      'pk.eyJ1IjoiazNtcDMiLCJhIjoiY202cGVrM2JmMWpraTJscXludXI1dzBwdiJ9.xq-xVzYxwOBGnH_KKs_ujA'
  }
})

const repairShopAddress = `${props.address}, ${props.postalCode}, ${props.location}`
const encodedAddress = encodeURIComponent(repairShopAddress)

const mapContainer = ref<HTMLDivElement | null>(null)
let map: mapboxgl.Map | null = null
let userInteracting = false

const geocodeAddress = async () => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${props.accessToken}`
    )
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center
      return { longitude, latitude }
    }

    throw new Error('Could not geocode address')
  } catch (error) {
    console.error('Geocoding error')
    return null
  }
}

const spinGlobe = () => {
  if (!map) return

  const zoom = map.getZoom()
  const spinEnabled = true
  const secondsPerRevolution = 240
  const maxSpinZoom = 5
  const slowSpinZoom = 3

  if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
    let distancePerSecond = 360 / secondsPerRevolution

    if (zoom > slowSpinZoom) {
      const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom)
      distancePerSecond *= zoomDif
    }

    const center = map.getCenter()
    center.lng -= distancePerSecond

    map.easeTo({
      center,
      duration: 1000,
      easing: (n) => n
    })
  }
}

onMounted(async () => {
  if (!mapContainer.value) return

  mapboxgl.accessToken = props.accessToken

  const coordinates = await geocodeAddress()

  if (coordinates) {
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/k3mp3/cm6per8e300ug01r57lakfcjy',
      zoom: 13,
      center: [coordinates.longitude, coordinates.latitude]
    })

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl())

    // Disable scroll zoom
    map.scrollZoom.disable()

    // Add a marker
    new mapboxgl.Marker().setLngLat([coordinates.longitude, coordinates.latitude]).addTo(map)

    // Set fog effect
    map.on('style.load', () => {
      map?.setFog({})
    })

    // Pause spinning on interaction
    map.on('mousedown', () => {
      userInteracting = true
    })

    map.on('dragstart', () => {
      userInteracting = true
    })

    // When animation is complete, start spinning if there is no ongoing interaction
    map.on('moveend', () => {
      userInteracting = false
      spinGlobe()
    })

    // Initial spin
    spinGlobe()
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
.mapboxgl-canvas {
  border-radius: 0.5rem;
}
</style>
