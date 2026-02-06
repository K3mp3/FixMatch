import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class FloatingParticlesVisualization {
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private renderer: THREE.WebGLRenderer | null = null
  private particlesGeometry: THREE.BufferGeometry | null = null
  private controls: OrbitControls | null = null
  private mouse: THREE.Vector2 | null = null
  private raycaster: THREE.Raycaster | null = null
  private originalPosArray: Float32Array | null = null
  private animationFrameId: number | null = null
  private tempVector: THREE.Vector3 | null = null
  private particleOpacities: Float32Array | null = null
  private originalColors: Float32Array | null = null
  private initialized: boolean = false
  private particleVelocities: Float32Array | null = null

  constructor(canvas: HTMLCanvasElement) {
    if (!this.isWebGLAvailable()) {
      console.warn('WebGL is not available in this browser. Showing fallback.')
      this.showWebGLError(canvas)
      return
    }

    try {
      this.initializeScene(canvas)
      this.initialized = true

      // Start animation only if everything initialized successfully
      if (this.initialized) {
        this.animate()
      }
    } catch (error) {
      console.error('Failed to initialize Three.js scene:', error)
      this.showWebGLError(canvas)
      this.cleanupPartialInitialization()
    }
  }

  private isWebGLAvailable(): boolean {
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

  private showWebGLError(canvas: HTMLCanvasElement): void {
    const fallbackElement = document.createElement('div')
    fallbackElement.style.position = 'absolute'
    fallbackElement.style.top = '0'
    fallbackElement.style.left = '0'
    fallbackElement.style.width = '100%'
    fallbackElement.style.height = '100%'
    fallbackElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'
    fallbackElement.style.backdropFilter = 'blur(5px)'
    fallbackElement.style.display = 'flex'
    fallbackElement.style.alignItems = 'center'
    fallbackElement.style.justifyContent = 'center'

    const messageElement = document.createElement('div')
    messageElement.style.color = '#d9d9d9'
    messageElement.style.fontWeight = 'bold'
    messageElement.style.padding = '20px'
    messageElement.style.borderRadius = '10px'
    messageElement.style.textAlign = 'center'
    messageElement.style.maxWidth = '80%'
    messageElement.innerText =
      'WebGL is not supported by your browser or system. Please try a different browser or update your graphics drivers.'

    fallbackElement.appendChild(messageElement)

    // Make sure we replace the canvas rather than just appending
    if (canvas.parentElement) {
      canvas.style.display = 'none' // Hide the canvas
      canvas.parentElement.appendChild(fallbackElement)
    }
  }

  private cleanupPartialInitialization(): void {
    // Clean up any resources that might have been created before the error
    if (this.particlesGeometry) {
      this.particlesGeometry.dispose()
    }

    if (this.renderer) {
      this.renderer.dispose()
    }

    if (this.controls) {
      this.controls.dispose()
    }

    // Remove event listeners if they were added
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('mousemove', this.handleMouseMove)

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }

  private initializeScene(canvas: HTMLCanvasElement): void {
    // Scene
    this.scene = new THREE.Scene()

    // Initial sizes - Use clientWidth instead of innerWidth
    const containerElement = canvas.parentElement
    const sizes = {
      width: containerElement?.clientWidth || window.innerWidth,
      height: 500
    }

    // Set the canvas size explicitly
    canvas.width = sizes.width
    canvas.height = sizes.height

    // Camera
    this.camera = new THREE.PerspectiveCamera(100, sizes.width / sizes.height, 1, 1000)
    this.camera.position.z = 20
    this.scene.add(this.camera)

    // Particles - REDUCED count from 4000 to 1000
    this.particlesGeometry = new THREE.BufferGeometry()
    const particlesCnt = 1000

    const posArray = new Float32Array(particlesCnt * 3)
    this.originalPosArray = new Float32Array(particlesCnt * 3)
    const colorArray = new Float32Array(particlesCnt * 3)
    this.originalColors = new Float32Array(particlesCnt * 3)
    this.particleOpacities = new Float32Array(particlesCnt)
    // Add velocities for floating movement
    this.particleVelocities = new Float32Array(particlesCnt * 3)

    // Convert hex color #d9d9d9 to RGB values (normalized to 0-1 range)
    const r = 0xd9 / 255
    const g = 0xd9 / 255
    const b = 0xd9 / 255

    // Calculate container dimensions
    const containerWidth = containerElement?.clientWidth || window.innerWidth
    const containerHeight = sizes.height

    for (let i = 0; i < particlesCnt; i++) {
      const i3 = i * 3

      // Random positions throughout the container volume instead of a sphere
      posArray[i3] = this.originalPosArray[i3] = (Math.random() - 0.5) * containerWidth * 0.5
      posArray[i3 + 1] = this.originalPosArray[i3 + 1] =
        (Math.random() - 0.5) * containerHeight * 0.5
      posArray[i3 + 2] = this.originalPosArray[i3 + 2] = (Math.random() - 0.5) * 20

      // Store original colors
      this.originalColors[i3] = colorArray[i3] = r
      this.originalColors[i3 + 1] = colorArray[i3 + 1] = g
      this.originalColors[i3 + 2] = colorArray[i3 + 2] = b

      // Initialize random opacity for twinkling effect
      this.particleOpacities[i] = 0.3 + Math.random() * 0.7

      // Set random velocities (much smaller values for slower movement)
      this.particleVelocities[i3] = (Math.random() - 0.5) * 0.0011 // Reduced from 0.02 to 0.005
      this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.0011
      this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.0011
    }

    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    this.particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1, // Increased from 0.05 to 0.12 for larger particles
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false
    })

    const particlesMesh = new THREE.Points(this.particlesGeometry, particlesMaterial)
    this.scene.add(particlesMesh)

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'default'
    })

    this.renderer.setSize(sizes.width, sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(new THREE.Color('#000'), 0)

    // Mouse
    this.mouse = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.tempVector = new THREE.Vector3()

    // Controls
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.enablePan = false
    this.controls.enableZoom = false
    this.controls.enableRotate = false
    this.controls.autoRotate = false

    // Event listeners
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('mousemove', this.handleMouseMove)
  }

  private handleResize = () => {
    if (!this.initialized || !this.renderer || !this.camera) return

    // Use parent container width instead of window width
    const containerWidth = this.renderer.domElement.parentElement?.clientWidth || window.innerWidth
    const sizes = {
      width: containerWidth,
      height: 362
    }

    this.camera.aspect = sizes.width / sizes.height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(sizes.width, sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.initialized || !this.renderer || !this.mouse) return

    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  private animate = () => {
    if (
      !this.initialized ||
      !this.renderer ||
      !this.scene ||
      !this.camera ||
      !this.controls ||
      !this.particlesGeometry ||
      !this.originalColors ||
      !this.particleVelocities
    ) {
      return
    }

    this.controls.update()

    const colors = this.particlesGeometry.attributes.color.array as Float32Array
    const positions = this.particlesGeometry.attributes.position.array as Float32Array
    const time = Date.now() * 0.0005 // Slowed down the twinkling effect slightly

    // Get container bounds for keeping particles inside
    const containerElement = this.renderer.domElement.parentElement
    const containerWidth = (containerElement?.clientWidth || window.innerWidth) * 0.5 // Half-width as we're using -width/2 to width/2
    const containerHeight = 362 * 0.5 // Half-height
    const containerDepth = 20 // Depth of our viewing volume

    for (let i = 0; i < positions.length; i += 3) {
      const particleIndex = i / 3

      // Update position based on velocity (already slowed down in initialization)
      positions[i] += this.particleVelocities[i]
      positions[i + 1] += this.particleVelocities[i + 1]
      positions[i + 2] += this.particleVelocities[i + 2]

      // Boundary check and bounce - X axis
      if (positions[i] > containerWidth || positions[i] < -containerWidth) {
        this.particleVelocities[i] *= -1
      }

      // Boundary check and bounce - Y axis
      if (positions[i + 1] > containerHeight || positions[i + 1] < -containerHeight) {
        this.particleVelocities[i + 1] *= -1
      }

      // Boundary check and bounce - Z axis
      if (positions[i + 2] > containerDepth || positions[i + 2] < -containerDepth) {
        this.particleVelocities[i + 2] *= -1
      }

      // Update opacity/brightness with subtle pulsing effect
      const opacity = 0.3 + 0.7 * Math.abs(Math.sin(time + particleIndex * 0.1))

      colors[i] = this.originalColors[i] * opacity
      colors[i + 1] = this.originalColors[i + 1] * opacity
      colors[i + 2] = this.originalColors[i + 2] * opacity
    }

    this.particlesGeometry.attributes.position.needsUpdate = true
    this.particlesGeometry.attributes.color.needsUpdate = true

    this.renderer.render(this.scene, this.camera)
    this.animationFrameId = requestAnimationFrame(this.animate)
  }

  public dispose() {
    if (!this.initialized) return

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('mousemove', this.handleMouseMove)

    if (this.renderer) {
      this.renderer.dispose()
    }

    if (this.particlesGeometry) {
      this.particlesGeometry.dispose()
    }

    if (this.controls) {
      this.controls.dispose()
    }
  }
}
