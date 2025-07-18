<template>
  <div class="container mx-auto py-12 px-4">
    <!-- Header Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Create AI-Powered Images</h1>
      <p class="text-xl text-muted-foreground">Transform your ideas into beautiful images with AI</p>
    </div>

    <!-- Prompt Input Section -->
    <div class="max-w-3xl mx-auto mb-12">
      <div class="bg-white border rounded-xl shadow-sm p-6">
        <div class="flex flex-col gap-4">
          <label class="text-lg font-medium text-gray-800">Describe your image:</label>
          <div class="relative">
            <textarea
              v-model="prompt"
              placeholder="Describe the image you want to create... (e.g., 'A modern infographic showing smartphone usage statistics with colorful charts')"
              class="w-full h-24 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              :disabled="isGenerating"
            ></textarea>
          </div>
          
          <!-- Factual Prompt Suggestions -->
          <div class="mt-3">
            <p class="text-sm font-medium text-gray-700 mb-3">💡 Try these factual prompts:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                v-for="suggestion in promptSuggestions"
                :key="suggestion"
                @click="selectSuggestion(suggestion)"
                class="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                :disabled="isGenerating"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
          
          <button
            @click="generateImage"
            :disabled="!prompt.trim() || isGenerating"
            class="w-full h-12 rounded-lg bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
            <loader-icon v-if="isGenerating" class="animate-spin h-5 w-5" />
            <wand-icon v-else class="h-5 w-5" />
            {{ isGenerating ? 'Generating...' : 'Generate Image' }}
        </button>
        </div>
      </div>
    </div>

    <!-- Generated Image Section -->
    <div v-if="isGenerating || generatedImage" class="max-w-3xl mx-auto mb-16">
      <div class="bg-white border rounded-xl shadow-sm p-6">
        <h3 class="text-xl font-semibold mb-4">Generated Image</h3>
        
        <!-- Loading State -->
        <div v-if="isGenerating" class="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <div class="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p class="text-muted-foreground">Creating your image...</p>
        </div>

        <!-- Generated Image Display -->
        <div v-else-if="generatedImage" class="space-y-4">
          <div class="flex justify-center bg-gray-50 rounded-lg p-4">
            <img 
              :src="generatedImage.imageUrl" 
              :alt="generatedImage.title"
              class="max-w-full h-auto rounded-lg shadow-sm"
              style="max-height: 500px;"
                      @error="handleImageError"
              />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">{{ generatedImage.title }}</h4>
              <p class="text-sm text-gray-600">{{ generatedImage.userInfo }}</p>
            </div>
            <button
              @click="downloadImage"
              class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <download-icon class="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Explore Section -->
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4">Explore Recent Images</h2>
        <p class="text-xl text-muted-foreground">See what others have created</p>
      </div>

        <!-- Search Bar -->
      <div class="max-w-md mx-auto mb-8">
        <div class="relative">
          <search-icon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search images..."
            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            @input="handleSearch"
          />
        </div>
      </div>
      
      <!-- Loading State for Explore -->
      <div v-if="loadingExplore" class="flex justify-center py-12">
        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>

      <!-- Error State for Explore -->
      <div v-else-if="exploreError" class="text-center py-12">
        <alert-circle-icon class="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-red-900 mb-2">Error loading images</h3>
        <p class="text-red-600">{{ exploreError }}</p>
      </div>

      <!-- Empty State for Explore -->
      <div v-else-if="!exploreImages.length" class="text-center py-12">
        <file-icon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No images found</h3>
        <p class="text-gray-600">
          {{ searchQuery ? 'No results match your search.' : 'Be the first to create an image!' }}
        </p>
            </div>
            
      <!-- Images Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="image in exploreImages"
          :key="image.id"
          class="border rounded-lg bg-white overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          @click="openImagePreview(image)"
        >
          <!-- Preview Image -->
          <div class="h-48 bg-gray-50 flex items-center justify-center">
            <img
              v-if="image.imageUrl"
              :src="`${$options.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}${image.imageUrl}`"
              :alt="image.title"
              class="w-full h-full object-contain p-4"
            />
            <file-icon v-else class="h-12 w-12 text-gray-400" />
          </div>

          <!-- Info -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 truncate">{{ image.title }}</h3>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ image.userInfo }}</p>
            <div class="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <clock-icon class="h-4 w-4" />
              {{ formatDate(image.createdAt) }}
              </div>
            </div>
          </div>
        </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8">
          <button
          v-for="page in totalPages"
          :key="page"
          @click="changePage(page)"
          :class="[
            'px-3 py-1 rounded',
            currentPage === page
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          >
          {{ page }}
          </button>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="showPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-semibold">{{ selectedImage?.title }}</h3>
          <button @click="closePreview" class="p-2 hover:bg-gray-100 rounded-full">
            <x-icon class="h-5 w-5" />
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-4 overflow-y-auto" style="max-height: calc(90vh - 120px);">
          <div class="flex justify-center mb-4">
            <img
              v-if="selectedImage?.imageUrl"
              :src="`${$options.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}${selectedImage.imageUrl}`"
              :alt="selectedImage.title"
              class="max-w-full h-auto rounded-lg"
              style="max-height: 500px;"
    />
          </div>
          <div class="text-center">
            <h4 class="font-medium text-gray-900 mb-2">{{ selectedImage?.title }}</h4>
            <p class="text-gray-600 mb-4">{{ selectedImage?.userInfo }}</p>
            <div class="flex justify-center gap-4 text-sm text-gray-500">
              <span>Created: {{ formatDate(selectedImage?.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { WandIcon, LoaderIcon, DownloadIcon, SearchIcon, FileIcon, ClockIcon, AlertCircleIcon, XIcon } from 'lucide-vue'
import axios from 'axios'

export default {
  name: 'Create',
  components: {
    WandIcon,
    LoaderIcon,
    DownloadIcon,
    SearchIcon,
    FileIcon,
    ClockIcon,
    AlertCircleIcon,
    XIcon
  },
  data() {
    return {
      prompt: '',
      isGenerating: false,
      generatedImage: null,
      error: null,
      
      // Explore section data
      exploreImages: [],
      loadingExplore: true,
      exploreError: null,
      searchQuery: '',
      currentPage: 1,
      totalPages: 1,
      
      // Preview modal
      showPreview: false,
      selectedImage: null,
      
      // Factual prompt suggestions
      promptSuggestions: [
        'Smartphone usage statistics by age group with pie charts and percentages',
        'Social media platform comparison showing user engagement metrics',
        'Climate change data visualization with temperature trends over decades'
      ]
    }
  },
  created() {
    this.fetchExploreImages()
    this.handleSearch = this.debounce(this.fetchExploreImages, 300)
  },
  methods: {
    async generateImage() {
      if (!this.prompt.trim()) return

      this.isGenerating = true
      this.error = null

      try {
        const response = await axios.post(
          `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/infographics/generate-infographic`,
          {
            userInfo: this.prompt.trim()
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
          }
        )

        this.generatedImage = response.data.data
        
        // Refresh explore images to show the new one
        this.fetchExploreImages()
        
        // Clear prompt for next generation
        this.prompt = ''

      } catch (error) {
        console.error('Error generating image:', error)
        this.error = error.response?.data?.error || 'Failed to generate image. Please try again.'
        
        // Handle authentication required
        if (error.response?.status === 401) {
          this.error = 'Please sign in to generate images.'
        }
      } finally {
        this.isGenerating = false
      }
    },

    selectSuggestion(suggestion) {
      this.prompt = suggestion
    },

    async downloadImage() {
      if (!this.generatedImage?.imageFilename) return

      try {
        const link = document.createElement('a')
        link.href = `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/download/${this.generatedImage.imageFilename}`
        link.download = `${this.generatedImage.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'image'}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading image:', error)
      }
    },

    async fetchExploreImages() {
      this.loadingExplore = true
      this.exploreError = null
      
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/infographics`,
          {
            params: {
              page: this.currentPage,
              q: this.searchQuery,
              finalized: 'true' // Only fetch finalized images
      }
          }
        )
        
        this.exploreImages = response.data.infographics
        this.totalPages = response.data.pagination.totalPages
      } catch (error) {
        console.error('Error fetching explore images:', error)
        this.exploreError = error.response?.data?.error || 'Failed to load images'
      } finally {
        this.loadingExplore = false
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    changePage(page) {
      this.currentPage = page
      this.fetchExploreImages()
    },

    openImagePreview(image) {
      this.selectedImage = image
      this.showPreview = true
    },

    closePreview() {
      this.showPreview = false
      this.selectedImage = null
    },

    handleImageError(event) {
      console.error('Failed to load image')
      event.target.style.display = 'none'
    },

    // Utility function for debouncing
    debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }
  }
}
</script> 

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-muted-foreground {
  color: #6b7280;
}
</style> 