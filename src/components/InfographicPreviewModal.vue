<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] mx-4 overflow-auto">
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
            <!-- <p class="text-sm text-gray-600 mt-1">{{ infographic?.userInfo || '' }}</p> -->
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex space-x-1 border-b border-gray-200">
          <button
            @click="activeTab = 'preview'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
              activeTab === 'preview' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
          >
            <div class="flex items-center gap-2">
              <eye-icon class="w-4 h-4" />
              Preview
            </div>
          </button>
          <button
            @click="activeTab = 'chat'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
              activeTab === 'chat' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            ]"
          >
            <!-- <div class="flex items-center gap-2">
              <message-circle-icon class="w-4 h-4" />
              Chat with AI
            </div> -->
          </button>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-hidden">
          <!-- Preview Tab -->
          <div v-if="activeTab === 'preview'" class="w-full h-[60vh] border rounded-lg overflow-auto bg-gray-50">
            <!-- Show image if available, otherwise show HTML -->
            <div v-if="infographic?.imageUrl" class="w-full h-full flex items-center justify-center p-4">
              <img 
                :src="`${$options.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}${infographic.imageUrl}`" 
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

          <!-- Chat Tab -->
          <div v-else-if="activeTab === 'chat'" class="h-[60vh]">
            <chat-interface 
              :infographic="infographic" 
              @infographic-updated="handleInfographicUpdated"
            />
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { XIcon, DownloadIcon, RefreshCwIcon, WandIcon, EyeIcon, MessageCircleIcon } from 'lucide-vue'
import axios from 'axios'
import ChatInterface from './ChatInterface.vue'

export default {
  name: 'InfographicPreviewModal',
  components: {
    XIcon,
    DownloadIcon,
    RefreshCwIcon,
    WandIcon,
    EyeIcon,
    MessageCircleIcon,
    ChatInterface
  },
  data() {
    return {
      updatePrompt: '',
      isUpdating: false,
      activeTab: 'preview'
    }
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
        if (!this.infographic?.imageUrl) {
          throw new Error('No image to download')
        }

        const imageUrl = `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}${this.infographic.imageUrl}`;
        
        // Use the download endpoint instead of direct image URL
        const link = document.createElement('a')
        link.href = `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/download/${this.infographic.imageFilename || 'infographic.png'}`
        link.download = `${this.infographic.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'infographic'}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading image:', error)
      }
    },
    async handleUpdate() {
      if (!this.updatePrompt.trim() || this.isUpdating) return;
      
      this.isUpdating = true;
      try {
        const response = await axios.put(
          `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/infographics/${this.infographic._id}`,
          {
            updatePrompt: this.updatePrompt.trim()
          }
        );

        if (response.data?.data) {
          // Update the local infographic data
          this.$emit('infographic-updated', response.data.data);
          this.updatePrompt = ''; // Clear the prompt
          
          // Show success message
          this.$emit('show-notification', {
            type: 'success',
            message: 'Infographic updated successfully!'
          });
        }
      } catch (error) {
        console.error('Error updating infographic:', error);
        this.$emit('show-notification', {
          type: 'error',
          message: error.response?.data?.error || 'Failed to update infographic'
        });
      } finally {
        this.isUpdating = false;
      }
    },
    handleImageError(event) {
      // Hide the broken image and show HTML content as fallback
      const parent = event.target.closest('.w-full.h-full');
      if (parent && this.infographic?.htmlContent) {
        parent.innerHTML = `<div class="infographic-content p-4">${this.infographic.htmlContent}</div>`;
      }
    },

    handleInfographicUpdated(updatedInfographic) {
      // Update the infographic data and refresh the preview
      this.$emit('infographic-updated', updatedInfographic);
      
      // Switch to preview tab to show the updated infographic
      this.activeTab = 'preview';
    },

    handleImageDownload() {
      try {
        if (!this.infographic?.imageUrl) {
          throw new Error('No image to download')
        }

        // Use the download endpoint instead of direct image URL
        const link = document.createElement('a')
        link.href = `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/download/${this.infographic.imageFilename || 'infographic.png'}`
        link.download = `${this.infographic.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'infographic'}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading image:', error)
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

/* Add styles for the update prompt area */
textarea {
  resize: vertical;
  min-height: 6rem;
  max-height: 12rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 