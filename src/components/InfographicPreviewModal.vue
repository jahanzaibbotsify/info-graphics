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
            <p class="text-sm text-gray-600 mt-1">{{ infographic?.description || infographic?.userInfo || '' }}</p>
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
            <div v-if="infographic?.imageUrl" class="infographic-content">
              <img 
                :src="infographic.imageUrl" 
                :alt="infographic.title || 'Infographic'"
                class="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg"
                @load="onImageLoad"
                @error="onImageError"
              />
            </div>
            <div v-else class="infographic-content flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">No image available</p>
              </div>
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
          <!-- <button
            v-if="infographic?.imageUrl && !infographic?.finalized"
            @click="handleFinalize"
            class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
          >
            <wand-icon class="h-4 w-4" />
            Finalize for Download
          </button> -->
          <button
            v-if="infographic?.imageUrl"
            @click="handleDownload"
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
    async handleFinalize() {
      try {
        if (!this.infographic?.id) {
          throw new Error('No infographic to finalize')
        }

        // Call the finalize API
        const response = await axios.post(
          `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/infographics/${this.infographic.id}/finalize`
        )
        
        if (response.data.data) {
          // Update the local infographic data
          this.$emit('infographic-updated', {
            ...this.infographic,
            finalized: true,
            finalizedAt: response.data.data.finalizedAt
          })
          
          // Show success message
          this.$emit('show-notification', {
            type: 'success',
            message: 'Infographic finalized successfully! It will now appear in the explore section.'
          })
          
          // Close the modal
          this.$emit('close')
        }
      } catch (error) {
        console.error('Error finalizing infographic:', error)
        this.$emit('show-notification', {
          type: 'error',
          message: error.response?.data?.error || 'Failed to finalize infographic'
        })
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
    onImageLoad() {
      // Image loaded successfully
      console.log('Infographic image loaded');
    },
    onImageError(event) {
      // Handle image loading error
      console.error('Failed to load infographic image');
      event.target.style.display = 'none';
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