<template>
  <div class="container mx-auto py-12">
    <!-- Header Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Create AI-Powered Infographics</h1>
      <p class="text-xl text-muted-foreground">Transform your ideas into beautiful infographics with AI</p>
    </div>

    <!-- Chat Interface Section -->
    <div class="max-w-4xl mx-auto">
      <div class="bg-white border rounded-xl shadow-sm overflow-hidden">
        <!-- Chat Header -->
        <div class="bg-gradient-to-r from-primary to-primary/80 text-white p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <wand-icon class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-semibold">AI Infographic Creator</h3>
              <p class="text-white/80 text-sm">Chat with AI to create stunning infographics</p>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50" ref="chatContainer">
          <!-- Welcome Message -->
          <div v-if="chatMessages.length === 0" class="flex gap-3">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <wand-icon class="w-4 h-4 text-white" />
      </div>
            <div class="bg-white rounded-lg rounded-tl-none p-4 shadow-sm max-w-md">
              <p class="text-gray-800 mb-2">
                👋 Hi! I'm your AI assistant. I can help you create beautiful infographics. Just tell me what you'd like to visualize!
              </p>
              <div class="mt-3 space-y-2">
                <p class="text-xs text-gray-500 font-medium">Try saying:</p>
                <div class="flex flex-wrap gap-1">
        <button
            v-for="suggestion in infographicSuggestions"
          :key="suggestion"
                    @click="sendSuggestion(suggestion)"
                    class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
        >
          {{ suggestion }}
        </button>
        </div>
        </div>
      </div>
    </div>

          <!-- Chat Messages -->
          <div v-for="message in chatMessages" :key="message.id" class="flex gap-3" :class="message.role === 'user' ? 'justify-end' : ''">
            <!-- AI Avatar -->
            <div v-if="message.role === 'assistant'" class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <wand-icon class="w-4 h-4 text-white" />
        </div>

            <!-- Message Content -->
            <div class="max-w-[80%]" :class="message.role === 'user' ? 'order-first' : ''">
              <div 
                class="rounded-lg p-3 shadow-sm"
                :class="{
                  'bg-primary text-white rounded-br-none': message.role === 'user',
                  'bg-white rounded-tl-none': message.role === 'assistant' && !message.isError && !message.isSuggestion,
                  'bg-red-50 border border-red-200 rounded-tl-none': message.role === 'assistant' && message.isError,
                  'bg-blue-50 border border-blue-200 rounded-tl-none': message.role === 'assistant' && message.isSuggestion
                }"
              >
                <!-- Loading indicator for generating messages -->
                <div v-if="message.isGenerating" class="flex items-center gap-2 text-gray-600">
                  <loader-icon class="w-4 h-4 animate-spin" />
                  <span class="text-sm">{{ message.content }}</span>
                </div>
                
                <!-- Regular message content -->
                <div v-else>
                  <!-- Error message styling -->
                  <div v-if="message.isError" class="text-red-700">
                    {{ message.content }}
                  </div>
                  
                  <!-- Suggestion message styling -->
                  <div v-else-if="message.isSuggestion" class="text-blue-700">
                    <div v-html="message.content.replace(/\n/g, '<br>')"></div>
                  </div>
                  
                  <!-- Regular message -->
                  <span v-else>{{ message.content }}</span>
            </div>
          </div>

              <!-- AI Message with Infographic -->
              <div v-if="message.infographic" class="mt-3">
                <div class="bg-gray-50 rounded-lg p-3 border">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-gray-600">{{ message.infographic.title }}</span>
                    <div class="flex items-center gap-2">
                      <!-- Update Badge -->
                      <span 
                        v-if="message.isUpdate || isUpdatedInfographic(message.infographic.id)"
                        class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium"
                      >
                        Updated
                      </span>
                      <button
                        @click="downloadInfographicFromMessage(message.infographic)"
                        class="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center gap-1"
                      >
                        <download-icon class="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div class="rounded-md overflow-hidden bg-gray-50 flex justify-center">
              <img 
                      :src="message.infographic.imageUrl" 
                      :alt="message.infographic.title"
                      class="max-w-full h-auto rounded transition-all duration-300"
                      style="max-height: 300px;"
                      @error="handleImageError"
              />
            </div>
                </div>
          </div>

              <div class="text-xs text-gray-500 mt-1" :class="message.role === 'user' ? 'text-right' : ''">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>

            <!-- User Avatar -->
            <div v-if="message.role === 'user'" class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
              <user-icon class="w-4 h-4 text-white" />
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex gap-3">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <wand-icon class="w-4 h-4 text-white" />
            </div>
            <div class="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="p-4 border-t bg-white">
          <div class="flex gap-3">
            <textarea
              v-model="currentMessage"
              @keydown.enter.prevent="handleSendMessage"
              placeholder="Describe the infographic you want to create..."
              class="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows="2"
              :disabled="isTyping || isGenerating"
            ></textarea>
            <button
              @click="handleSendMessage"
              :disabled="!currentMessage.trim() || isTyping || isGenerating"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <send-icon class="w-4 h-4" />
            </button>
          </div>
          <div v-if="isGenerating" class="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <loader-icon class="w-3 h-3 animate-spin" />
            <span>Processing your request...</span>
        </div>
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
                :src="`${$options.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}${infographic.imageUrl}`" 
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
  RefreshCwIcon,
  UserIcon,
  SendIcon
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
    UserIcon,
    SendIcon,
    PricingModal,
    InfographicPreviewModal,
    AuthModal
  },
  data() {
    return {
      // Chat interface data
      chatMessages: [],
      currentMessage: '',
      isTyping: false,
      isGenerating: false,
      messageId: 0,
      
      // Existing infographics data
      storedInfographics: [],
      isLoadingContent: false,
      currentPage: 1,
      totalPages: 1,
      totalInfographics: 0,
      searchQuery: '',
      
      // Modal states
      showPricingModal: false,
      showInfographicPreviewModal: false,
      selectedInfographic: null,
      showAuthModal: false,
      
      // Error handling
      error: null,
      
      // Suggestions for chat
      infographicSuggestions: [
        "Technology adoption rates and digital transformation",
        "Climate change statistics and environmental data",
        "Social media usage trends and demographics",
        "Health and wellness statistics for modern lifestyle",
        "Global economic indicators and market trends",
        "Renewable energy adoption and sustainability metrics",
        "Remote work statistics and productivity data",
        "AI and machine learning industry growth",
        "E-commerce sales trends and consumer behavior",
        "Education technology usage and learning outcomes"
      ]
    }
  },
  mounted() {
    this.fetchStoredInfographics()
    
    // Auto-focus the chat input when component mounts
    this.$nextTick(() => {
      const textarea = this.$el.querySelector('textarea')
      if (textarea) {
        textarea.focus()
      }
    })
  },
  methods: {
    async handleSendMessage() {
      if (!this.currentMessage.trim() || this.isTyping || this.isGenerating) return

      const userMessage = {
        id: this.messageId++,
        role: 'user',
        content: this.currentMessage.trim(),
        timestamp: new Date()
      }

      this.chatMessages.push(userMessage)
      const userPrompt = this.currentMessage.trim()
      this.currentMessage = ''
      this.isTyping = true

      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom()
      })

      try {
        // Check if this might be an update to existing image
        const hasExistingImages = this.chatMessages.some(msg => msg.infographic && msg.infographic.id)
        const modificationKeywords = [
          'change', 'modify', 'update', 'edit', 'alter', 'adjust', 'revise',
          'make it', 'turn it', 'convert', 'transform', 'switch',
          'different color', 'new color', 'other color', 'another style',
          'more', 'less', 'bigger', 'smaller', 'brighter', 'darker',
          'add', 'remove', 'replace', 'include', 'exclude',
          'instead of', 'rather than', 'better', 'improve',
          'fix', 'correct', 'enhance', 'upgrade'
        ]
        const isLikelyUpdate = hasExistingImages && modificationKeywords.some(keyword => 
          userPrompt.toLowerCase().includes(keyword)
        )

        // Create AI response message first
        const aiMessage = {
          id: this.messageId++,
          role: 'assistant',
          content: isLikelyUpdate 
            ? "I'll update your infographic based on your request. Let me process the changes..." 
            : "I'll create an infographic for you. Let me process your request...",
          timestamp: new Date(),
          isGenerating: true,
          infographic: null
        }

        this.chatMessages.push(aiMessage)
        this.isTyping = false
        this.isGenerating = true

        // Scroll to bottom after adding AI message
        this.$nextTick(() => {
          this.scrollToBottom()
        })

        // Generate the infographic with chat context
        const response = await axios.post(`${process.env.VUE_APP_BACKEND_URL}/chat/generate-infographic`, {
          userInfo: userPrompt,
          chatHistory: this.chatMessages.slice(0, -1) // Pass previous messages for context
        })
        
        // Update the AI message with results
        aiMessage.isGenerating = false
        
        if (response.data.isUpdate) {
          aiMessage.content = "I've updated your infographic! Here's the improved version:"
          aiMessage.isUpdate = true
          
          // Find and update the existing infographic in previous messages
          for (let i = this.chatMessages.length - 2; i >= 0; i--) {
            if (this.chatMessages[i].infographic && this.chatMessages[i].infographic.id === response.data.data.id) {
              // Update the existing message's infographic
              this.chatMessages[i].infographic = {
                id: response.data.data.id,
                title: response.data.data.title,
                imageUrl: `${process.env.VUE_APP_BACKEND_URL}${response.data.data.imageUrl}`,
                imageFilename: response.data.data.imageFilename
              }
              // Add timestamp to track when it was updated
              this.chatMessages[i].updatedAt = new Date()
              break
            }
          }
          
          // Also add the updated infographic to the current AI message for convenience
          aiMessage.infographic = {
            id: response.data.data.id,
            title: response.data.data.title,
            imageUrl: `${process.env.VUE_APP_BACKEND_URL}${response.data.data.imageUrl}`,
            imageFilename: response.data.data.imageFilename
          }
        } else {
          aiMessage.content = "I've created your infographic! Here it is:"
          aiMessage.isUpdate = false
        }
        
        if (response.data.data.imageGenerated && response.data.data.imageUrl) {
          aiMessage.infographic = {
            id: response.data.data.id,
            title: response.data.data.title,
            imageUrl: `${process.env.VUE_APP_BACKEND_URL}${response.data.data.imageUrl}`,
            imageFilename: response.data.data.imageFilename
          }
        }

        // Refresh the stored infographics list
        await this.fetchStoredInfographics()

      } catch (error) {
        console.error('Error generating infographic:', error)
        this.isTyping = false
        
        // Update the AI message with error
        const lastMessage = this.chatMessages[this.chatMessages.length - 1]
        if (lastMessage.role === 'assistant') {
          lastMessage.isGenerating = false
          
          // Handle different types of errors
          if (error.response?.status === 400 && error.response?.data?.type === 'invalid_request') {
            // Invalid request (like "make pizza")
            lastMessage.content = `❌ ${error.response.data.error}`
            lastMessage.isError = true
            
            // Add helpful suggestions
            setTimeout(() => {
              const suggestionMessage = {
                id: this.messageId++,
                role: 'assistant',
                content: `💡 **Try these instead:**\n\n• "Create a technology adoption statistics infographic"\n• "Show social media usage trends for 2025"\n• "Generate health and wellness data visualization"\n• "Climate change statistics and environmental data"\n• "Business analytics dashboard with KPIs"`,
                timestamp: new Date(),
                isSuggestion: true
              }
              this.chatMessages.push(suggestionMessage)
              this.$nextTick(() => {
                this.scrollToBottom()
              })
            }, 1000)
            
          } else if (error.response?.status === 429) {
            // Rate limit error
            lastMessage.content = 'I\'ve reached the rate limit. Please upgrade for unlimited generations.'
            this.showPricingModal = true
        } else {
            // Generic error
            lastMessage.content = 'Sorry, I encountered an error creating your infographic. Please try again with a data visualization request.'
          }
        }
      } finally {
        this.isGenerating = false
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },

    sendSuggestion(suggestion) {
      this.currentMessage = suggestion
      this.handleSendMessage()
    },

    scrollToBottom() {
      const container = this.$refs.chatContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    downloadInfographicFromMessage(infographic) {
      try {
        const link = document.createElement('a')
        link.href = `${process.env.VUE_APP_BACKEND_URL}/download/${infographic.imageFilename}`
        link.download = `${infographic.title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading infographic:', error)
      }
    },

    handleImageError(event) {
      console.error('Failed to load image:', event.target.src)
      event.target.style.display = 'none'
    },

    // handleImageLoad(event) {
    //   // Add a subtle animation effect when images load
    //   if (event && event.target) {
    //     event.target.style.opacity = '0'
    //     setTimeout(() => {
    //       if (event.target) {
    //         event.target.style.opacity = '1'
    //       }
    //     }, 100)
    //   }
    // },

    isUpdatedInfographic(infographicId) {
      // Check if this infographic ID appears multiple times in chat history
      // indicating it has been updated
      const messagesWithThisId = this.chatMessages.filter(msg => 
        msg.infographic && msg.infographic.id === infographicId
      )
      return messagesWithThisId.length > 1
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