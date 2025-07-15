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
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="infographic in infographics"
        :key="infographic.id"
        class="border rounded-lg bg-white overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Preview Image -->
        <div
          class="h-48 bg-gray-50 flex items-center justify-center cursor-pointer"
          @click="openPreview(infographic)"
        >
          <img
            v-if="infographic.imageUrl"
            :src="`${$options.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}${infographic.imageUrl}`"
            :alt="infographic.title"
            class="w-full h-full object-contain p-4"
          />
          <file-icon v-else class="h-12 w-12 text-gray-400" />
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

    <!-- Preview Modal -->
    <infographic-preview-modal
      :show="showPreview"
      :infographic="selectedInfographic"
      @close="closePreview"
      @infographic-updated="handleInfographicUpdate"
      @show-notification="showNotification"
    />

    <!-- Notification -->
    <div
      v-if="notification"
      :class="[
        'fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-opacity',
        notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      ]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import {
  SearchIcon,
  FileIcon,
  ClockIcon,
  AlertCircleIcon
} from 'lucide-vue'
import InfographicPreviewModal from '@/components/InfographicPreviewModal.vue'
import axios from 'axios'
import { debounce } from 'lodash'

export default {
  name: 'Explore',
  components: {
    SearchIcon,
    FileIcon,
    ClockIcon,
    AlertCircleIcon,
    InfographicPreviewModal
  },
  data() {
    return {
      infographics: [],
      loading: true,
      error: null,
      searchQuery: '',
      currentPage: 1,
      totalPages: 1,
      showPreview: false,
      selectedInfographic: null,
      notification: null
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
    openPreview(infographic) {
      this.selectedInfographic = infographic
      this.showPreview = true
    },
    closePreview() {
      this.showPreview = false
      this.selectedInfographic = null
    },
    handleInfographicUpdate(updatedInfographic) {
      // Update the infographic in the list
      const index = this.infographics.findIndex(i => i.id === updatedInfographic.id)
      if (index !== -1) {
        this.infographics[index] = {
          ...this.infographics[index],
          ...updatedInfographic
        }
      }
      // Update the selected infographic in the preview
      if (this.selectedInfographic?.id === updatedInfographic.id) {
        this.selectedInfographic = {
          ...this.selectedInfographic,
          ...updatedInfographic
        }
      }
    },
    showNotification({ type, message }) {
      this.notification = { type, message }
      setTimeout(() => {
        this.notification = null
      }, 3000)
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