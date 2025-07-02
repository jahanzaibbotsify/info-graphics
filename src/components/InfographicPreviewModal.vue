<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden">
      <!-- Close button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
        title="Close"
      >
        <x-icon class="h-5 w-5" />
      </button>

      <!-- Content -->
      <div class="space-y-4 h-full">
        <!-- Header -->
        <div class="flex justify-between items-start pr-12">
          <div>
            <h3 class="text-lg font-semibold">{{ infographic?.title || 'Infographic Preview' }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ infographic?.userInfo || '' }}</p>
          </div>
        </div>

        <!-- Infographic Content -->
        <div class="flex-1 overflow-hidden">
          <div class="w-full h-[60vh] border rounded-lg overflow-auto bg-gray-50">
            <!-- Show image if available, otherwise show HTML -->
            <div v-if="infographic?.imageUrl" class="w-full h-full flex items-center justify-center p-4">
              <img 
                :src="`${$options.VUE_APP_BACKEND_URL || 'https://infographics.saasbakers.com/api'}${infographic.imageUrl}`" 
                :alt="infographic.title"
                class="max-w-full max-h-full object-contain rounded shadow-sm"
                @error="handleImageError"
              />
            </div>
            <div v-else-if="infographic?.htmlContent" v-html="infographic.htmlContent" class="infographic-content"></div>
            <div v-else class="flex items-center justify-center h-full text-gray-500">
              No content available
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            v-if="infographic?.imageUrl"
            @click="handleImageDownload"
            class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
          >
            <download-icon class="h-4 w-4" />
            Download Image
          </button>
          <!-- <button
            @click="handleDownload"
            class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
          >
            <download-icon class="h-4 w-4" />
            Download HTML
          </button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { XIcon, DownloadIcon } from 'lucide-vue'

export default {
  name: 'InfographicPreviewModal',
  components: {
    XIcon,
    DownloadIcon
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    infographic: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleDownload() {
      try {
        if (!this.infographic?.htmlContent) {
          throw new Error('No content to download')
        }

        const blob = new Blob([this.infographic.htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `infographic-${this.infographic.title?.replace(/[^a-zA-Z0-9]/g, '-') || Date.now()}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading infographic:', error)
      }
    },
    handleImageDownload() {
      try {
        if (!this.infographic?.imageUrl) {
          throw new Error('No image to download')
        }

        const imageUrl = `${process.env.VUE_APP_BACKEND_URL || 'https://infographics.saasbakers.com/api'}${this.infographic.imageUrl}`;
        
        // Use the download endpoint instead of direct image URL
        const link = document.createElement('a')
        link.href = `${process.env.VUE_APP_BACKEND_URL || 'https://infographics.saasbakers.com/api'}/download/${this.infographic.imageFilename || 'infographic.png'}`
        link.download = `${this.infographic.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'infographic'}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading image:', error)
      }
    },
    handleImageError(event) {
      // Hide the broken image and show HTML content as fallback
      const parent = event.target.closest('.w-full.h-full');
      if (parent && this.infographic?.htmlContent) {
        parent.innerHTML = `<div class="infographic-content p-4">${this.infographic.htmlContent}</div>`;
      }
    }
  }
}
</script>

<style scoped>
.infographic-content {
  width: 100%;
  min-height: 100%;
}

/* Override infographic styles to fit in modal */
.infographic-content :deep(body) {
  margin: 0;
  padding: 0;
}

.infographic-content :deep(.infographic-container) {
  margin: 0;
  box-shadow: none;
  border-radius: 0;
}
</style> 