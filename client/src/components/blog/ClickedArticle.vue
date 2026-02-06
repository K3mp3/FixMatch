<script setup lang="ts">
import type { IArticleData } from '@/models/IArticleData'
import { fetchEditorContent } from '@/services/admin'
import Cookies from 'js-cookie'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import LandingFooter from '../footer/LandingFooter.vue'
import LandingNav from '../nav/LandingNav.vue'

const isCookieAccepted = ref(false)
const route = useRoute()

const currentArticle = ref<IArticleData | null>(null)
const latestArticle = ref<IArticleData | null>(null)
const secondLatestArticle = ref<IArticleData | null>(null)
const remainingArticles = ref<IArticleData[]>([])

const newsTitle = ref('')
const newsImageUrl = ref('')
const isArticleView = ref(false)

if (Cookies.get('acceptedCookies') === 'true') isCookieAccepted.value = true

// Function to extract title from HTML content
function extractTitle(content: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  const titleElement =
    doc.querySelector('h2 strong') || doc.querySelector('h2') || doc.querySelector('p strong')
  return titleElement ? titleElement.textContent || 'News Title' : 'News Title'
}

function formatUrlSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Function to find article by slug
function findArticleBySlug(articles: IArticleData[], slug: string): IArticleData | null {
  return (
    articles.find((article) => {
      const articleSlug = formatUrlSlug(extractTitle(article.content))
      return articleSlug === slug
    }) || null
  )
}

onMounted(async () => {
  try {
    // Check if we're in article view by parsing the current URL
    const pathname = window.location.hash
    const articleSlug = pathname.split('/news/')[1]
    isArticleView.value = !!articleSlug

    const response = await fetchEditorContent()
    if (response?.data?.length > 0) {
      const sortedArticles = [...response.data].sort(
        (a, b) => b.createdAt._seconds - a.createdAt._seconds
      )

      // If we are in article view, find the specific article
      if (isArticleView.value && articleSlug) {
        currentArticle.value = findArticleBySlug(sortedArticles, articleSlug)

        if (!currentArticle.value) {
          console.error('Article not found:', articleSlug)
        }
      }

      // Set the latest article
      latestArticle.value = sortedArticles[0]

      // Set the second latest article if available
      if (sortedArticles.length >= 2) {
        secondLatestArticle.value = sortedArticles[1]
      }

      // Set remaining articles (exclude first two)
      if (sortedArticles.length > 2) {
        remainingArticles.value = sortedArticles.slice(2)
      }

      // Set image URL and title for the featured article (latest one)
      if (latestArticle.value?.imageUrl) {
        newsImageUrl.value = latestArticle.value.imageUrl
      }

      if (latestArticle.value?.content) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(latestArticle.value.content, 'text/html')
        const titleElement =
          doc.querySelector('h2 strong') || doc.querySelector('h2') || doc.querySelector('p strong')
        if (titleElement) newsTitle.value = titleElement.textContent || 'Senaste nytt'
      }
    }
  } catch (error) {
    console.error('Error fetching news content:', error)
  }
})
</script>

<template>
  <header class="flex flex-col gap-24 lg:gap-36 items-center">
    <nav class="w-full fixed z-10">
      <LandingNav />
    </nav>
  </header>

  <main class="p-4 flex flex-col gap-24 sm:gap-20 lg:gap-28 items-center bg-sky-white lg:mt-24">
    <!-- Single Article View -->
    <div v-if="isArticleView && currentArticle" class="w-full max-w-5xl mt-16">
      <div class="mb-8">
        <h2 class="text-3xl font-bold mb-8 text-secondary">
          {{ extractTitle(currentArticle.content) }}
        </h2>
        <div class="mb-6">
          <img
            v-if="currentArticle.imageUrl"
            :src="`https://monkfish-app-77769.ondigitalocean.app${currentArticle.imageUrl}`"
            :alt="extractTitle(currentArticle.content)"
            class="w-full max-h-96 object-cover shadow-lg"
          />
        </div>
        <!-- Render article content with proper styling -->
        <p class="news-content text-secondary" v-html="currentArticle.content"></p>
      </div>
    </div>

    <!-- News Listing View -->
    <template v-if="!isArticleView">
      <!-- Featured Article (Second Latest) -->
      <div v-if="secondLatestArticle" class="my-8 w-full max-w-5xl">
        <div class="relative overflow-hidden shadow-xl">
          <RouterLink :to="`/news/${formatUrlSlug(extractTitle(secondLatestArticle.content))}`">
            <img
              v-if="secondLatestArticle.imageUrl"
              :src="`https://monkfish-app-77769.ondigitalocean.app${secondLatestArticle.imageUrl}`"
              :alt="extractTitle(secondLatestArticle.content)"
              class="w-full h-80 object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end"
            >
              <div class="p-6 text-white">
                <h2 class="text-2xl md:text-3xl font-bold">
                  {{ extractTitle(secondLatestArticle.content) }}
                </h2>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Remaining Articles in Smaller Format -->
      <div class="flex flex-col gap-6 w-full max-w-5xl">
        <div v-for="article in remainingArticles" :key="article.articleId">
          <RouterLink :to="`/news/${formatUrlSlug(extractTitle(article.content))}`">
            <div class="w-full mb-2 h-[1px] bg-sky-gray"></div>
            <div class="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-8">
              <div class="relative overflow-hidden shadow-md mb-3">
                <img
                  v-if="article.imageUrl"
                  :src="`https://monkfish-app-77769.ondigitalocean.app${article.imageUrl}`"
                  :alt="extractTitle(article.content)"
                  class="w-full h-48 object-cover"
                />
              </div>
              <h2 class="text-lg lg:text-xl font-semibold text-secondary">
                {{ extractTitle(article.content) }}
              </h2>
            </div>
            <div class="w-full h-[1px] bg-sky-gray"></div>
          </RouterLink>
        </div>
      </div>
    </template>
  </main>

  <footer class="px-4 mt-16 sm:mt-20 lg:mt-28">
    <LandingFooter />
  </footer>
</template>

<style scoped>
:deep(.news-content h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

:deep(.news-content p) {
  margin-bottom: 1rem;
  line-height: 1.6;
}

:deep(.news-content strong) {
  font-weight: 700;
}

:deep(.news-content em) {
  font-style: italic;
}
</style>
