import { onMounted, onUnmounted } from 'vue'

interface SEOOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  keywords?: string
}

export const useSEO = (options: SEOOptions = {}) => {
  const defaultTitle = 'Vayme'
  const defaultDescription =
    'Spara pengar genom att få offerter från flera verkstäder samtidigt. Välj sedan det bästa alternativet.'
  const defaultImage = 'https://vayme.se/seo_image.png'
  const defaultUrl = 'https://vayme.se'

  const title = options.title || defaultTitle
  const description = options.description || defaultDescription
  const image = options.image || defaultImage
  const url = options.url || defaultUrl
  const keywords = options.keywords || 'bilverkstad, bilservice, reparation, offert, vayme'

  let originalTitle = ''
  const createdElements: HTMLElement[] = []
  const modifiedElements = new Map<HTMLElement, string>()

  const setMetaTag = (name: string, content: string, property = false) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
    let element = document.querySelector(selector) as HTMLMetaElement

    if (!element) {
      element = document.createElement('meta')
      if (property) {
        element.setAttribute('property', name)
      } else {
        element.setAttribute('name', name)
      }
      document.head.appendChild(element)
      createdElements.push(element)
    } else {
      if (!modifiedElements.has(element)) {
        modifiedElements.set(element, element.getAttribute('content') || '')
      }
    }

    element.setAttribute('content', content)
  }

  const setLinkTag = (rel: string, href: string) => {
    let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement

    if (!element) {
      element = document.createElement('link')
      element.setAttribute('rel', rel)
      document.head.appendChild(element)
      createdElements.push(element)
    } else {
      if (!modifiedElements.has(element)) {
        modifiedElements.set(element, element.getAttribute('href') || '')
      }
    }

    element.setAttribute('href', href)
  }

  onMounted(() => {
    originalTitle = document.title

    document.title = title

    setMetaTag('description', description)
    setMetaTag('keywords', keywords)
    setMetaTag('robots', 'index, follow')

    setMetaTag('og:title', title, true)
    setMetaTag('og:description', description, true)
    setMetaTag('og:image', image, true)
    setMetaTag('og:url', url, true)
    setMetaTag('og:type', 'website', true)

    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', title)
    setMetaTag('twitter:description', description)
    setMetaTag('twitter:image', image)

    setLinkTag('canonical', url)
  })

  onUnmounted(() => {
    document.title = originalTitle

    createdElements.forEach((element) => {
      element.remove()
    })

    modifiedElements.forEach((originalValue, element) => {
      if (originalValue) {
        element.setAttribute('content', originalValue)
      }
    })
  })

  return {
    title,
    description,
    image,
    url
  }
}
