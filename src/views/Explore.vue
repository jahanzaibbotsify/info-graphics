<template>
  <div class="container py-10">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Your Infographics</h1>
        <p class="text-gray-600 mt-2">Browse and manage your generated infographics</p>
      </div>
      <div class="flex gap-4">
        <div class="relative">
          <search-icon class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search infographics..."
            class="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            @input="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <alert-circle-icon class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to load infographics</h3>
      <p class="text-gray-600">{{ error }}</p>
      <button
        @click="fetchInfographics"
        class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!infographics.length" class="text-center py-12">
      <file-icon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No infographics found</h3>
      <p class="text-gray-600">
        {{ searchQuery ? 'No results match your search.' : 'Start by creating your first infographic!' }}
      </p>
      <router-link
        to="/create"
        v-if="!searchQuery"
        class="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Create Infographic
      </router-link>
    </div>

    <!-- Infographics Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="infographic in infographics"
        :key="infographic.id"
        class="border rounded-lg bg-white overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Preview Image -->
        <div
          class="h-48 bg-gray-50 flex items-center justify-center relative group"
        >
          <img
            v-if="infographic.imageUrl"
            :src="`${$options.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}${infographic.imageUrl}`"
            :alt="infographic.title"
            class="w-full h-full object-contain p-4"
          />
          <file-icon v-else class="h-12 w-12 text-gray-400" />
          
          <!-- Action Buttons Overlay -->
          <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              @click="viewImage(infographic)"
              class="px-3 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <eye-icon class="h-4 w-4" />
              View
            </button>
            <button
              @click="downloadImage(infographic)"
              class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <download-icon class="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="p-4">
          <h3 class="font-semibold text-gray-900 truncate">{{ infographic.title }}</h3>
          <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ infographic.userInfo }}</p>
          <div class="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <clock-icon class="h-4 w-4" />
            {{ formatDate(infographic.createdAt) }}
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

    <!-- Image View Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-semibold">{{ selectedImage?.title }}</h3>
          <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-full">
            <x-icon class="h-5 w-5" />
          </button>
        </div>
        
        <!-- Modal Content -->
        <div class="p-4 overflow-y-auto" style="max-height: calc(90vh - 120px);">
          <!-- Image Display -->
          <div class="flex justify-center mb-6">
            <img
              v-if="selectedImage?.imageUrl"
              :src="`${$options.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}${selectedImage.imageUrl}`"
              :alt="selectedImage.title"
              class="max-w-full h-auto rounded-lg shadow-lg"
              style="max-height: 500px;"
            />
          </div>
          
          <!-- Image Info -->
          <div class="space-y-4">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Title</h4>
              <p class="text-gray-700">{{ selectedImage?.title }}</p>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Prompt</h4>
              <div class="text-gray-700">
                <p v-if="!showFullPrompt && selectedImage?.userInfo?.length > 150">
                  {{ selectedImage.userInfo.substring(0, 150) }}...
                  <button 
                    @click="togglePrompt"
                    class="text-primary hover:text-primary/80 font-medium ml-2"
                  >
                    Read more
                  </button>
                </p>
                <p v-else-if="showFullPrompt">
                  {{ selectedImage?.userInfo }}
                  <button 
                    @click="togglePrompt"
                    class="text-primary hover:text-primary/80 font-medium ml-2"
                  >
                    Read less
                  </button>
                </p>
                <p v-else>{{ selectedImage?.userInfo }}</p>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Created</h4>
              <p class="text-gray-700">{{ formatDate(selectedImage?.createdAt) }}</p>
            </div>
          </div>
          
          <!-- Modal Actions -->
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              @click="downloadImage(selectedImage)"
              class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <download-icon class="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {
  SearchIcon,
  FileIcon,
  ClockIcon,
  AlertCircleIcon,
  EyeIcon,
  DownloadIcon,
  XIcon
} from 'lucide-vue'
import axios from 'axios'
import { debounce } from 'lodash'

export default {
  name: 'Explore',
  components: {
    SearchIcon,
    FileIcon,
    ClockIcon,
    AlertCircleIcon,
    EyeIcon,
    DownloadIcon,
    XIcon
  },
  data() {
    return {
      infographics: [],
      loading: true,
      error: null,
      searchQuery: '',
      currentPage: 1,
      totalPages: 1,
      showModal: false,
      selectedImage: null,
      showFullPrompt: false
    }
  },
  created() {
    this.fetchInfographics()
    this.handleSearch = debounce(this.fetchInfographics, 300)
  },
  methods: {
    async fetchInfographics() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/infographics`,
          {
            params: {
              page: this.currentPage,
              q: this.searchQuery,
              finalized: 'true' // Only fetch finalized infographics for explore section
            }
          }
        )
        this.infographics = response.data.infographics
        this.totalPages = response.data.pagination.totalPages
      } catch (error) {
        console.error('Error fetching infographics:', error)
        this.error = error.response?.data?.error || 'Failed to load infographics'
      } finally {
        this.loading = false
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
      this.fetchInfographics()
    },
    viewImage(infographic) {
      this.selectedImage = infographic
      this.showModal = true
      this.showFullPrompt = false
    },
    closeModal() {
      this.showModal = false
      this.selectedImage = null
      this.showFullPrompt = false
    },
    downloadImage(infographic) {
      try {
        if (!infographic?.imageFilename) return

        const link = document.createElement('a')
        link.href = `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/download/${infographic.imageFilename}`
        link.download = `${infographic.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'image'}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading image:', error)
      }
    },
    togglePrompt() {
      this.showFullPrompt = !this.showFullPrompt
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
</style> 