<template>
  <div class="flex flex-col h-full bg-white rounded-lg border">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <bot-icon class="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 class="font-medium text-gray-900">AI Assistant</h3>
          <p class="text-sm text-gray-500">Chat to modify your infographic</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Online</span>
      </div>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" ref="chatContainer">
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <bot-icon class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="text-sm text-blue-800">
              Hi! I'm your AI assistant. I can help you modify your infographic. Just tell me what changes you'd like to make!
            </p>
            <div class="mt-2 space-y-1">
              <p class="text-xs text-blue-600 font-medium">Try saying:</p>
              <ul class="text-xs text-blue-600 space-y-1">
                <li>• "Change the title to something more catchy"</li>
                <li>• "Make the chart colors more vibrant"</li>
                <li>• "Add more data points to the graph"</li>
                <li>• "Update the statistics with latest numbers"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Messages -->
      <div v-for="message in messages" :key="message.id" class="flex gap-3" :class="message.role === 'user' ? 'flex-row-reverse' : ''">
        <!-- Avatar -->
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="message.role === 'user' ? 'bg-gray-500' : 'bg-primary'">
          <user-icon v-if="message.role === 'user'" class="w-4 h-4 text-white" />
          <bot-icon v-else class="w-4 h-4 text-white" />
        </div>

        <!-- Message Content -->
        <div class="flex-1 max-w-xs" :class="message.role === 'user' ? 'text-right' : ''">
          <div class="rounded-lg p-3 text-sm" :class="message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'">
            <p>{{ message.content }}</p>
            <div v-if="message.role === 'assistant' && message.isModifying" class="mt-2 flex items-center gap-2 text-xs opacity-75">
              <loader-icon class="w-3 h-3 animate-spin" />
              <span>Applying changes...</span>
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-1" :class="message.role === 'user' ? 'text-right' : ''">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isTyping" class="flex gap-3">
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <bot-icon class="w-4 h-4 text-white" />
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="p-4 border-t bg-gray-50">
      <div class="flex gap-3">
        <textarea
          v-model="currentMessage"
          @keydown.enter.prevent="handleSendMessage"
          placeholder="Describe what you'd like to change about your infographic..."
          class="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          rows="1"
          :disabled="isTyping || isProcessing"
        ></textarea>
        <button
          @click="handleSendMessage"
          :disabled="!currentMessage.trim() || isTyping || isProcessing"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <send-icon class="w-4 h-4" />
        </button>
      </div>
      <div v-if="isProcessing" class="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <loader-icon class="w-3 h-3 animate-spin" />
        <span>Processing your request...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { BotIcon, UserIcon, SendIcon, LoaderIcon } from 'lucide-vue'
import axios from 'axios'

export default {
  name: 'ChatInterface',
  components: {
    BotIcon,
    UserIcon,
    SendIcon,
    LoaderIcon
  },
  props: {
    infographic: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      messages: [],
      currentMessage: '',
      isTyping: false,
      isProcessing: false,
      messageId: 0
    }
  },
  methods: {
    async handleSendMessage() {
      if (!this.currentMessage.trim() || this.isTyping || this.isProcessing) return

      const userMessage = {
        id: this.messageId++,
        role: 'user',
        content: this.currentMessage.trim(),
        timestamp: new Date()
      }

      this.messages.push(userMessage)
      const userPrompt = this.currentMessage.trim()
      this.currentMessage = ''
      this.isTyping = true

      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom()
      })

      try {
        // Send chat message to backend
        const response = await axios.post(
          `${process.env.VUE_APP_BACKEND_URL || 'https://infogiraffe.art/api'}/infographics/${this.infographic.id}/chat`,
          {
            message: userPrompt,
            chatHistory: this.messages.slice(0, -1) // Exclude the current user message
          }
        )

        this.isTyping = false
        this.isProcessing = true

        // Add AI response
        const aiMessage = {
          id: this.messageId++,
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
          isModifying: response.data.isModifying || false
        }

        this.messages.push(aiMessage)

        // If the AI is making modifications, update the infographic
        if (response.data.isModifying && response.data.updatedInfographic) {
          // Emit event to parent to update the infographic
          this.$emit('infographic-updated', response.data.updatedInfographic)
          
          // Update the message to show completion
          setTimeout(() => {
            aiMessage.isModifying = false
            aiMessage.content += ' ✓ Changes applied successfully!'
          }, 2000)
        }

      } catch (error) {
        console.error('Error sending chat message:', error)
        this.isTyping = false
        this.isProcessing = false
        
        // Add error message
        const errorMessage = {
          id: this.messageId++,
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date()
        }
        this.messages.push(errorMessage)
      } finally {
        this.isProcessing = false
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
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
    }
  },

  mounted() {
    // Auto-focus the input when component mounts
    this.$nextTick(() => {
      const textarea = this.$el.querySelector('textarea')
      if (textarea) {
        textarea.focus()
      }
    })
  }
}
</script>

<style scoped>
/* Custom scrollbar for chat container */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Textarea auto-resize */
textarea {
  min-height: 40px;
  max-height: 120px;
  resize: none;
  overflow-y: auto;
}

/* Animation for typing indicator */
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}

/* Custom animation delays */
.animate-bounce:nth-child(1) {
  animation-delay: 0s;
}
.animate-bounce:nth-child(2) {
  animation-delay: 0.2s;
}
.animate-bounce:nth-child(3) {
  animation-delay: 0.4s;
}
</style> 