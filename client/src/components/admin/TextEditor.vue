<script setup lang="ts">
import { saveEditorContent } from '@/services/admin'
import Editor from '@tinymce/tinymce-vue'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'
import SignedInNav from '../nav/SignedInNav.vue'

const TINYMCE_KEY = import.meta.env.VITE_TINYMCE_KEY

const editorContent = ref('')

const showFileSizeError = ref(false)
const showFileTypeError = ref(false)

const articleId = ref(uuidv4())

const image = ref<File | null>(null)

const editorConfig = {
  toolbar_mode: 'sliding',
  plugins:
    'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
  toolbar:
    'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
  height: 500,
  skin: 'oxide-dark',
  content_css: 'dark'
}

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  showFileSizeError.value = false

  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      showFileTypeError.value = true
      input.value = ''
      image.value = null
      return
    }

    if (file.size > 1024 * 1024) {
      showFileSizeError.value = true
      input.value = ''
      image.value = null
      return
    }

    image.value = input.files[0]
  } else {
    image.value = null
  }
}

async function saveContent() {
  try {
    if (!editorContent.value) {
      return
    }
    const formData = new FormData()
    formData.append('content', editorContent.value)
    formData.append('articleId', articleId.value)

    if (image.value) formData.append('image', image.value)

    const response = await saveEditorContent(formData)
  } catch (error) {
    console.log('Error saving content')
  }
}
</script>

<template>
  <SignedInNav :admin="true" highlight="editor" />

  <main
    class="p-16 h-screen flex flex-col items-start justify-center gap-12 mb-24 w-full lg:w-[calc(100%-205px)] xl:w-[calc(100%-250px)] 2xl:w-[calc(100%-300px)] absolute right-0"
  >
    <div class="editor-container w-full max-w-[1200px]">
      <Editor
        v-model="editorContent"
        :api-key="TINYMCE_KEY"
        :init="{
          editorConfig
        }"
      />
    </div>

    <label class="flex flex-col gap-1">
      <span>Bild</span>
      <input
        type="file"
        accept="image/jpeg, image/jpg, image/png, image/webp, .jpg, .jpeg, .png, .webp"
        @change="handleFileUpload"
        ref="fileInput"
      />

      <p
        v-if="showFileSizeError"
        class="text-warning-orange font-text-light flex gap-2 items-center"
      >
        <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />
        Filen är för stor. Maximal filstorlek är 1 MB.
      </p>

      <p
        v-if="showFileTypeError"
        class="text-warning-orange font-text-light flex gap-2 items-center"
      >
        <fontAwesome :icon="['fas', 'triangle-exclamation']" class="text-warning-orange" />
        Endast jpeg, jpg, png, och webp är tillåtna.
      </p>
    </label>

    <button type="button" @click="saveContent" class="main-btn max-w-[200px]">Spara</button>
  </main>
</template>
