<template>
  <div class="container mx-auto py-12">
    <!-- Header Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Create Your Animated Icon</h1>
      <p class="text-xl text-muted-foreground">Transform your ideas into beautiful animated icons with AI</p>
    </div>

    <!-- Input Section -->
    <div class="max-w-2xl mx-auto mb-12">
      <div class="flex gap-3">
        <input
          v-model="prompt"
          type="text"
          placeholder="Describe your icon (e.g., 'a bouncing heart with sparkles')"
          class="flex-1 h-12 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          :disabled="isGenerating"
        />
        <button
          @click="generateIcon"
          :disabled="!prompt || isGenerating"
          class="px-6 h-12 rounded-lg bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <loader-icon v-if="isGenerating" class="animate-spin h-5 w-5" />
          <wand-icon v-else class="h-5 w-5" />
          {{ isGenerating ? 'Generating...' : 'Generate' }}
        </button>
      </div>
    </div>

    <!-- Preview Section -->
    <div class="max-w-2xl mx-auto">
      <div v-if="isGenerating || generatedIcon" class="border rounded-xl p-8 bg-card">
        <!-- Loading State -->
        <div v-if="isGenerating" class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p class="text-muted-foreground">Creating your icon...</p>
        </div>

        <!-- Generated Icon -->
        <div v-else-if="generatedIcon" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Your Generated Icon</h3>
            <div class="flex gap-3">
              <button
                @click="editIcon"
                class="p-2 rounded-lg hover:bg-muted flex items-center gap-2"
                title="Edit Icon"
              >
                <edit-icon class="h-5 w-5" />
              </button>
              <button
                @click="downloadIcon"
                class="p-2 rounded-lg hover:bg-muted flex items-center gap-2"
                title="Download Icon"
              >
                <download-icon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="flex justify-center">
            <div class="w-48 h-48 rounded-xl bg-muted flex items-center justify-center relative overflow-hidden">
              <lottie-player
                ref="lottiePlayer"
                background="transparent"
                speed="1"
                class="w-full h-full"
                style="max-width: 100%; max-height: 100%;"
                loop
                autoplay
              ></lottie-player>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { WandIcon, LoaderIcon, EditIcon, DownloadIcon } from 'lucide-vue'
import '@lottiefiles/lottie-player'
import axios from 'axios'

export default {
  name: 'Create',
  components: {
    WandIcon,
    LoaderIcon,
    EditIcon,
    DownloadIcon
  },
  data() {
    return {
      prompt: '',
      isGenerating: false,
      generatedIcon: false,
      error: null,
      currentAnimation: null
    }
  },
  methods: {
    async generateIcon() {
      if (!this.prompt) return

      this.isGenerating = true
      this.error = null

      try {
        const response = await axios.post('http://localhost:3000/generate', {
          prompt: this.prompt
        })

        console.log('API Response:', response.data)

        // Update the Lottie player with the new animation data
        if (this.$refs.lottiePlayer) {
          try {
            // If API returns direct animation data
            if (typeof response.data === 'object') {
              this.currentAnimation = response.data
              await this.$refs.lottiePlayer.load(response.data)
            } 
            // If API returns a path to the JSON file
            else if (typeof response.data === 'string') {
              const animationPath = response.data.startsWith('/') 
                ? `http://localhost:3000${response.data}`
                : `http://localhost:3000/${response.data}`
              await this.$refs.lottiePlayer.load(animationPath)
              this.currentAnimation = animationPath
            } else {
              throw new Error('Invalid response format from API')
            }
            this.generatedIcon = true
          } catch (error) {
            console.error('Error loading animation:', error)
            throw new Error('Failed to load the generated animation')
          }
        }
      } catch (error) {
        console.error('Error generating icon:', error)
        this.error = error.message || 'Failed to generate icon. Please try again.'
      } finally {
        this.isGenerating = false
      }
    },
    editIcon() {
      // Store current icon data in state management if needed
      this.$router.push({
        name: 'edit',
        params: { 
          animation: this.currentAnimation,
          prompt: this.prompt
        }
      })
    },
    async downloadIcon() {
      try {
        // If we have direct animation data
        if (typeof this.currentAnimation === 'object') {
          const jsonString = JSON.stringify(this.currentAnimation, null, 2)
          const blob = new Blob([jsonString], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          this.triggerDownload(url, 'icon.json')
        }
        // If we have a URL
        else if (typeof this.currentAnimation === 'string') {
          const response = await axios.get(this.currentAnimation, { responseType: 'blob' })
          const url = URL.createObjectURL(response.data)
          this.triggerDownload(url, 'icon.json')
        }
      } catch (error) {
        console.error('Error downloading icon:', error)
        this.error = 'Failed to download icon. Please try again.'
      }
    },
    triggerDownload(url, filename) {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
}
</script>

<style scoped>
.input-container:focus-within .placeholder {
  display: none;
}
</style> 