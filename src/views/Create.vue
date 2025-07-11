<template>
  <div class="container mx-auto py-12">
    <!-- Header Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Create AI-Powered Infographics</h1>
      <p class="text-xl text-muted-foreground">Transform your ideas into beautiful infographics with AI</p>
    </div>

    <!-- Input Section -->
    <div class="max-w-4xl mx-auto mb-12">
      <div class="space-y-4">
        <div class="space-y-3">
          <label class="block text-sm font-medium text-foreground">
            Infographic Information
          </label>
          <textarea
            v-model="infographicInfo"
            placeholder="Describe the topic and data for your infographic. Include any statistics, key points, or information you want to visualize. For example: 'Climate change statistics showing temperature rise over the last 50 years, renewable energy adoption rates, and key environmental impacts.'"
            class="w-full h-32 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            :disabled="isGenerating"
          ></textarea>
        </div>
      <div class="flex gap-3">
        <button
          type="button"
            @click.prevent="generateInfographic"
            :disabled="!infographicInfo || isGenerating"
            class="w-full h-12 rounded-lg bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <loader-icon v-if="isGenerating" class="animate-spin h-5 w-5" />
          <wand-icon v-else class="h-5 w-5" />
          {{ isGenerating ? 'Generating...' : 'Generate' }}
        </button>
      </div>
        <!-- Infographic Suggestions -->
        <div class="flex flex-wrap gap-2">
        <span class="text-sm text-muted-foreground">Try:</span>
        <button
            v-for="suggestion in infographicSuggestions"
          :key="suggestion"
            @click="infographicInfo = suggestion"
          class="text-sm px-3 py-1 rounded-full bg-muted hover:bg-primary/10 transition-colors"
        >
          {{ suggestion }}
        </button>
        </div>
      </div>
    </div>

    <!-- Preview Section -->
    <div class="max-w-4xl mx-auto">
      <div class="border rounded-xl p-8 bg-card">
        <!-- Loading State -->
        <div v-if="isGenerating" class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p class="text-muted-foreground">Creating your infographic...</p>
        </div>

        <!-- Infographic Preview -->
        <div v-else-if="infographicHtml || currentInfographicImage" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Your Generated Infographic</h3>
            <div class="flex gap-3">
              <button
                v-if="currentInfographicImage"
                @click="downloadCurrentImage"
                class="p-2 rounded-lg hover:bg-muted flex items-center gap-2 transition-colors"
                title="Download Image"
              >
                <download-icon class="h-5 w-5" />
                <span class="text-sm">Image</span>
              </button>
              <!-- <button
                @click="downloadInfographic"
                class="p-2 rounded-lg hover:bg-muted flex items-center gap-2 transition-colors"
                title="Download HTML"
              >
                <download-icon class="h-5 w-5" />
                <span class="text-sm">HTML</span>
              </button> -->
            </div>
          </div>

          <div class="w-full border rounded-lg overflow-hidden bg-white">
            <!-- Show image if available, otherwise show HTML -->
            <div v-if="currentInfographicImage" class="flex justify-center p-4">
              <img 
                :src="currentInfographicImage" 
                alt="Generated Infographic" 
                class="max-w-full h-auto rounded-lg shadow-sm"
                style="max-height: 600px;"
              />
            </div>
            <div v-else-if="infographicHtml" v-html="infographicHtml" class="infographic-preview"></div>
          </div>

          <!-- Update Prompt Area -->
          <div v-if="currentInfographicImage || infographicHtml" class="mt-6 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium">Update Infographic</h4>
              <div v-if="isUpdating" class="text-sm text-gray-500">
                <span class="animate-pulse">Updating...</span>
              </div>
            </div>
            <div class="space-y-3">
              <textarea
                v-model="updatePrompt"
                placeholder="Describe what you want to update in this infographic (e.g., 'Make the title larger and change the main chart color to blue')"
                class="w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-vertical"
                :disabled="isUpdating"
                rows="3"
              ></textarea>
              <div class="flex justify-end">
                <button
                  @click="handleUpdate"
                  class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!updatePrompt.trim() || isUpdating"
                >
                  <refresh-cw-icon v-if="isUpdating" class="h-4 w-4 animate-spin" />
                  <wand-icon v-else class="h-4 w-4" />
                  {{ isUpdating ? 'Updating...' : 'Update Infographic' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
          <div class="text-red-500 mb-4">
            <x-circle-icon class="h-16 w-16" />
          </div>
          <p class="text-muted-foreground">{{ error }}</p>
        </div>

        <!-- Initial State -->
        <div v-else class="flex flex-col items-center justify-center py-12">
          <p class="text-muted-foreground">
            Describe your topic to create an infographic
          </p>
        </div>
      </div>
    </div>

    <!-- Stored Content Section -->
    <div class="max-w-4xl mx-auto mt-16">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold">Explore Infographics</h2>
        <!-- Search Bar -->
        <div class="relative w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search infographics..."
            class="w-full h-10 px-4 pr-10 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="handleSearch"
          />
          <button
            @click="handleSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-muted transition-colors"
            title="Search"
          >
            <search-icon class="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <!-- Loading Skeleton -->
      <div v-if="isLoadingContent" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="border rounded-xl p-4 bg-card animate-pulse">
          <div class="w-full h-48 rounded-lg bg-muted mb-4"></div>
          <div class="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>

      <!-- No Results State -->
      <div v-else-if="!isLoadingContent && storedInfographics.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="text-muted-foreground mb-4">
          <search-x-icon class="h-16 w-16" />
        </div>
        <p class="text-muted-foreground">No infographics found</p>
      </div>

      <!-- Infographics Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(infographic, index) in storedInfographics" :key="index" class="border rounded-xl p-4 bg-card">
          <div class="w-full h-48 rounded-lg bg-muted flex items-center justify-center relative overflow-hidden mb-3">
            <!-- Show image if available, otherwise show HTML thumbnail -->
            <div v-if="infographic.imageUrl" class="w-full h-full flex items-center justify-center">
              <img 
                :src="`${$options.VUE_APP_BACKEND_URL || 'https://infographics.saasbakers.com/api'}${infographic.imageUrl}`" 
                :alt="infographic.title" 
                class="max-w-full max-h-full object-contain rounded"
                @error="handleImageError($event, infographic)"
              />
            </div>
            <!-- <div v-else v-html="infographic.htmlContent" class="infographic-thumbnail"></div> -->
          </div>
          <div class="space-y-2">
            <h4 class="font-medium text-sm truncate">{{ infographic.title }}</h4>
            <p class="text-xs text-gray-600 line-clamp-2">{{ infographic.userInfo }}</p>
            <div class="flex gap-1">
                <button
                @click="openInfographicPreview(infographic)"
                class="p-1.5 rounded-lg hover:bg-muted flex items-center justify-center transition-colors flex-1 text-xs"
                title="View Infographic"
                >
                <eye-icon class="h-4 w-4 mr-1" />
                View
                </button>
                <button
                v-if="infographic.imageUrl"
                @click="downloadInfographicImage(infographic)"
                class="p-1.5 rounded-lg hover:bg-muted flex items-center justify-center transition-colors flex-1 text-xs"
                title="Download Image"
                >
                <download-icon class="h-4 w-4 mr-1" />
                Image
                </button>
                <!-- <button
                @click="downloadStoredInfographic(infographic)"
                class="p-1.5 rounded-lg hover:bg-muted flex items-center justify-center transition-colors flex-1 text-xs"
                title="Download HTML"
                >
                <download-icon class="h-4 w-4 mr-1" />
                HTML
                </button> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center space-x-4">
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span class="text-gray-600">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
      </div>
    </div>

    <!-- Add Pricing Modal -->
    <PricingModal
      :show="showPricingModal"
      @close="showPricingModal = false"
      @show-auth="showAuthModal = true"
    />

    <!-- Add Infographic Preview Modal -->
    <InfographicPreviewModal
      :show="showInfographicPreviewModal"
      :infographic="selectedInfographic"
      @close="closeInfographicPreview"
    />

    <!-- Add Auth Modal -->
    <AuthModal 
      :show="showAuthModal" 
      @close="showAuthModal = false" 
      @auth="onAuth" 
    />
  </div>
</template>

<script>
import {
  WandIcon,
  LoaderIcon,
  XCircleIcon,
  DownloadIcon,
  SearchIcon,
  SearchXIcon,
  EyeIcon,
  RefreshCwIcon
} from 'lucide-vue'
import axios from 'axios'
import PricingModal from '@/components/PricingModal.vue'
import InfographicPreviewModal from '@/components/InfographicPreviewModal.vue'
import AuthModal from '@/components/AuthModal.vue'

export default {
  name: 'Create',
  components: {
    WandIcon,
    LoaderIcon,
    XCircleIcon,
    DownloadIcon,
    SearchIcon,
    SearchXIcon,
    EyeIcon,
    RefreshCwIcon,
    PricingModal,
    InfographicPreviewModal,
    AuthModal
  },
  data() {
    return {
      infographicInfo: '',
      isGenerating: false,
      error: null,
      infographicHtml: null,
      storedInfographics: [],
      isLoadingContent: false,
      currentPage: 1,
      totalPages: 1,
      totalInfographics: 0,
      searchQuery: '',
      showPricingModal: false,
      showInfographicPreviewModal: false,
      selectedInfographic: null,
      showAuthModal: false,
      infographicSuggestions: [
        'Climate change statistics and environmental impact data',
        'Social media usage trends and demographics',
        'Technology adoption rates and digital transformation',
        'Health and wellness statistics for modern lifestyle'
      ],
      currentInfographicImage: null,
      currentInfographicImageFilename: null,
      isUpdating: false,
      updatePrompt: '',
      currentInfographicId: null
    }
  },
  mounted() {
    this.fetchStoredInfographics()
  },
  methods: {
    async generateInfographic() {
      if (!this.infographicInfo || this.isGenerating) {
        return
      }

      this.isGenerating = true
      this.error = null
      this.infographicHtml = null
      this.currentInfographicImage = null
      this.currentInfographicImageFilename = null
      this.currentInfographicId = null

      try {
        // Make the API call to generate the infographic
        const response = await axios.post(`${process.env.VUE_APP_BACKEND_URL}/generate-infographic`, {
          userInfo: this.infographicInfo
        })
        
        // Store the HTML content
        console.log('response from generate infographic: ', response.data);
        this.infographicHtml = response.data.data.htmlContent;
        this.currentInfographicId = response.data.data.id;

        // If image was generated, display the image instead of HTML
        if (response.data.data.imageGenerated && response.data.data.imageUrl) {
          this.currentInfographicImage = `${process.env.VUE_APP_BACKEND_URL}${response.data.data.imageUrl}`;
          this.currentInfographicImageFilename = response.data.data.imageFilename;
        }

        // Refresh the stored infographics list
        await this.fetchStoredInfographics();

      } catch (error) {
        console.error('Error:', error)
        if (error.response?.status === 429) {
          // Rate limit exceeded
          this.showPricingModal = true;
          this.error = error.response.data.message;
        } else {
          this.error = error.message || 'Failed to generate infographic'
        }
      } finally {
        this.isGenerating = false
      }
    },

    async handleUpdate() {
      if (!this.updatePrompt.trim() || this.isUpdating || !this.currentInfographicId) return;
      
      this.isUpdating = true;
      try {
        const response = await axios.put(
          `${process.env.VUE_APP_BACKEND_URL || 'https://infographics.saasbakers.com/api'}/infographics/${this.currentInfographicId}`,
          {
            updatePrompt: this.updatePrompt.trim()
          }
        );

        if (response.data?.data) {
          // Update the current infographic
          this.infographicHtml = response.data.data.htmlContent;
          this.currentInfographicImage = response.data.data.imageUrl ? 
            `${process.env.VUE_APP_BACKEND_URL || 'https://infographics.saasbakers.com/api'}${response.data.data.imageUrl}` : 
            null;
          this.updatePrompt = ''; // Clear the prompt

          // Show success message
          if (this.$toast) {
            this.$toast.success('Infographic updated successfully!');
          } else {
            console.log('Infographic updated successfully!');
          }
          
          // Refresh the stored infographics list
          await this.fetchStoredInfographics();
        }
      } catch (error) {
        console.error('Error updating infographic:', error);
        const errorMessage = error.response?.data?.error || 'Failed to update infographic';
        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error(errorMessage);
        }
      } finally {
        this.isUpdating = false;
      }
    },

    async downloadInfographic() {
      try {
        if (!this.infographicHtml) {
          throw new Error('Infographic not loaded')
        }

        // Create blob and download
        const blob = new Blob([this.infographicHtml], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        
        // Create and trigger download
        const link = document.createElement('a')
        link.href = url
        link.download = `infographic-${Date.now()}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading HTML:', error)
        this.error = 'Failed to download infographic'
      }
    },

    async handleSearch() {
      this.currentPage = 1;
      await this.fetchStoredInfographics();
    },

    async fetchStoredInfographics() {
      this.isLoadingContent = true;
      try {
        const searchParam = this.searchQuery.trim() ? `&q=${encodeURIComponent(this.searchQuery)}` : '';
        const url = this.searchQuery.trim() 
          ? `${process.env.VUE_APP_BACKEND_URL}/infographics/search?page=${this.currentPage}${searchParam}`
          : `${process.env.VUE_APP_BACKEND_URL}/infographics?page=${this.currentPage}`;
        
        const response = await axios.get(url);
        this.storedInfographics = response.data.infographics;
        console.log('storedInfographics: ', this.storedInfographics);
        this.totalPages = response.data.pagination.totalPages;
        this.totalInfographics = response.data.pagination.totalInfographics;
      } catch (error) {
        console.error('Error fetching stored infographics:', error);
        this.storedInfographics = [];
        this.totalPages = 1;
        this.totalInfographics = 0;
      } finally {
        this.isLoadingContent = false;
      }
    },

    async downloadStoredInfographic(infographic) {
      try {
        // Create blob and download
        const blob = new Blob([infographic.htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        
        // Create and trigger download
        const link = document.createElement('a')
        link.href = url
        link.download = `infographic-${Date.now()}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading infographic:', error)
      }
    },

    async handlePageChange(newPage) {
      this.currentPage = newPage;
      await this.fetchStoredInfographics();
      
      // Scroll to top of the content section
      const exploreSection = document.querySelector('.max-w-4xl.mt-16');
      if (exploreSection) {
        exploreSection.scrollIntoView({ behavior: 'smooth' });
      }
    },

    openInfographicPreview(infographic) {
      this.selectedInfographic = infographic;
      this.showInfographicPreviewModal = true;
    },

    closeInfographicPreview() {
      this.showInfographicPreviewModal = false;
      this.selectedInfographic = null;
    },

    onAuth({ user, token }) {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('jwt', token)
      this.showAuthModal = false
    },

    async downloadCurrentImage() {
      try {
        if (!this.currentInfographicImageFilename) {
          throw new Error('Current infographic image not available')
        }

        // Use the download endpoint
        const link = document.createElement('a')
        link.href = `${process.env.VUE_APP_BACKEND_URL}/download/${this.currentInfographicImageFilename}`
        link.download = `infographic-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading current image:', error)
        this.error = 'Failed to download current image'
      }
    },

    handleImageError(event, infographic) {
      // Hide the broken image and show HTML thumbnail as fallback
      event.target.style.display = 'none';
      const parent = event.target.parentElement;
      if (parent) {
        parent.innerHTML = `<div class="infographic-thumbnail">${infographic.htmlContent}</div>`;
      }
    },

    async downloadInfographicImage(infographic) {
      try {
        if (!infographic.imageFilename) {
          throw new Error('Infographic image not available')
        }

        // Use the download endpoint
        const link = document.createElement('a')
        link.href = `${process.env.VUE_APP_BACKEND_URL}/download/${infographic.imageFilename}`
        link.download = `${infographic.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'infographic'}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading infographic image:', error)
        this.error = 'Failed to download infographic image'
      }
    }
  }
}
</script> 

<style scoped>
.infographic-preview {
  transform: scale(1);
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.infographic-thumbnail {
  transform: scale(0.25);
  transform-origin: top left;
  width: 400%;
  height: 400%;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style> 