<script setup lang="ts">
import type { IPdfResponse } from '@/models/IPDFResponse'
import { fetchPdfFile } from '@/services/userContact'
import { computed, onMounted, ref } from 'vue'
import LoadingSpinner from '../assets/LoadingSpinner.vue'

const props = defineProps<{
  pdfFileName: string
}>()

const emit = defineEmits<{
  (e: 'closePDF'): void
}>()

const isPdfLoaded = ref(false)
const pdfData = ref<IPdfResponse | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')

const pdfUrl = computed(() => {
  if (!pdfData.value?.data) return ''
  return `data:application/pdf;base64,${pdfData.value.data}`
})

const fetchPdf = async () => {
  try {
    isLoading.value = true
    const response = await fetchPdfFile(props.pdfFileName)

    if (response && response.status === 200 && response.data) {
      // Store the PDF data
      pdfData.value = response.data
      isPdfLoaded.value = true
    } else {
      errorMessage.value = 'Kunde inte ladda PDF-filen'
      isPdfLoaded.value = false
    }
  } catch (error) {
    console.error('Error fetching PDF:', error)
    errorMessage.value = 'Ett fel uppstod vid hämtning av PDF'
    isPdfLoaded.value = false
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPdf()
})
</script>

<template>
  <div class="spinner-component" v-if="isLoading">
    <LoadingSpinner />
    <!-- Spinner by: https://codepen.io/jkantner/pen/QWrLOXW -->
  </div>

  <section class="w-screen h-screen fixed bg-main z-30 top-0 left-0 flex flex-col gap-8 p-4">
    <div class="w-full max-w-[900px] m-auto">
      <button
        type="button"
        class="btn-back-light"
        @click="emit('closePDF')"
        aria-label="Gå tillbaka"
      >
        <fontAwesome :icon="['fas', 'chevron-left']" />
      </button>
    </div>

    <div class="pdf-container">
      <!-- Add #toolbar=0&navpanes=0 to hide sidebar and toolbar -->
      <iframe
        v-if="pdfData?.data"
        :src="pdfUrl + '#toolbar=0&navpanes=0&scrollbar=0'"
        class="pdf-viewer"
        type="application/pdf"
      >
        <div class="fallback">
          <p>
            PDF kan inte visas.
            <a :href="pdfUrl" :download="pdfData.name || 'document.pdf'" class="download-link">
              Ladda ner istället
            </a>
          </p>
        </div>
      </iframe>
      <div v-else class="no-pdf">Ingen PDF tillgänglig</div>
    </div>
  </section>
</template>

<style scoped>
.pdf-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  aspect-ratio: 1/2;
  background: #f1f1f1;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
}

.no-pdf,
.fallback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}

.download-link {
  color: var(--sky-green);
  margin-left: 8px;
  text-decoration: none;
}

.download-link:hover {
  text-decoration: underline;
}
</style>
