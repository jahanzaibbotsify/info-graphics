<template>
  <section class="relative py-24 md:py-32 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0"></div>
    
    <div class="container relative z-10">
      <div class="flex flex-col items-center text-center max-w-4xl mx-auto">
        <div class="transition-all duration-600">
          <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Create Beautiful Animated Icons with AI
          </h1>
          
          <p class="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            Transform your ideas into stunning animated icons in seconds with our AI-powered platform.
          </p>
        </div>
        
        <div class="transition-all duration-600 delay-300 relative w-full max-w-4xl mx-auto bg-card rounded-xl shadow-xl overflow-hidden">
          <div class="top-0 left-0 right-0 h-10 bg-muted flex items-center px-4">
            <div class="flex gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          <div class="pt-10 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col">
              <div class="p-4 border rounded-lg bg-muted/50 mb-4">
                <p class="text-sm text-left font-medium">Your prompt:</p>
                <div class="relative mt-2">
                  <div class="h-10 border rounded-md flex items-center px-3 bg-background relative">
                    <input
                      type="text"
                      v-model="userPrompt"
                      :placeholder="'Create ' + prompt"
                      class="w-full bg-transparent outline-none"
                      @focus="isPaused = true"
                      @blur="isPaused = false"
                    />
                    <span v-if="!userPrompt" class="absolute pointer-events-none">
                      <span>Create&nbsp;</span>
                      <span class="text-primary font-medium">{{ prompt }}</span>
                      <span class="animate-pulse ml-1">|</span>
                    </span>
                    <button 
                      @click="generateIcon"
                      class="absolute right-3 text-primary hover:text-primary-600 transition-colors"
                      title="Generate Icon"
                    >
                      <sparkles-icon class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              
          </div>
            
            <div class="flex flex-col justify-center items-center border rounded-lg p-8 bg-background">
              <div class="w-32 h-32 rounded-xl bg-muted flex items-center justify-center relative overflow-hidden">
                <div v-if="isGenerating" class="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full"></div>
                <div v-else-if="generatedIcon" class="w-full h-full flex items-center justify-center">
                  <lottie-animation
                    ref="lottieAnimation"
                    :animationData="currentAnimation"
                    :loop="true"
                    :autoPlay="true"
                    class="w-full h-full"
                    @error="handleAnimationError"
                  />
                </div>
                <div v-else class="text-muted-foreground text-sm">
                  Icon Preview
                </div>
              </div>
              
              <!-- Download Button -->
              <div v-if="generatedIcon" class="mt-4">
                <button
                  @click="handleDownload"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  title="Download Icon"
                >
                  <download-icon class="h-5 w-5" />
                  <span>Download</span>
                </button>
              </div>
              
              <p class="text-sm text-muted-foreground mt-4">
                <span v-if="isGenerating">Generating...</span>
                <span v-else-if="error" class="text-red-500">{{ error }}</span>
                <span v-else-if="generatedIcon">Generated Icon</span>
                <span v-else>Enter a prompt to generate</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { SparklesIcon, ArrowRightIcon, DownloadIcon } from 'lucide-vue'
import LottieAnimation from 'lottie-web-vue'
import axios from 'axios'

export default {
  name: 'Hero',
  components: {
    SparklesIcon,
    ArrowRightIcon,
    DownloadIcon,
    LottieAnimation
  },
  data() {
    return {
      prompt: 'a spinning gear',
      userPrompt: '',
      isPaused: false,
      isGenerating: false,
      generatedIcon: false,
      error: null,
      currentAnimation: null,
      prompts: [
        'a spinning gear',
        'a bouncing ball',
        'a loading circle',
        'a beating heart',
        'a notification bell'
      ]
    }
  },
  mounted() {
    this.startPromptCycle()
  },
  beforeDestroy() {
    clearInterval(this.promptInterval)
  },
  methods: {
    startPromptCycle() {
      this.promptInterval = setInterval(() => {
        if (!this.isPaused) {
          this.prompt = this.prompts[Math.floor(Math.random() * this.prompts.length)]
        }
      }, 3000)
    },
    async generateIcon() {
      // Validate prompt
      let finalPrompt = this.userPrompt || this.prompt
      if (!finalPrompt) {
        this.error = 'Please enter a prompt or wait for a suggestion'
        return
      }

      // Add "Create" prefix only if user hasn't already included it
      if (!finalPrompt.toLowerCase().startsWith('create')) {
        finalPrompt = 'Create ' + finalPrompt
      }

      if (this.isGenerating) return
      
      this.isGenerating = true
      this.error = null
      
      try {
        const response = await axios.post('http://localhost:3000/generate', {
          prompt: finalPrompt
        })
        
        if (!response.data) {
          throw new Error('No animation data received')
            } 

        this.currentAnimation = response.data
        this.generatedIcon = true
        
      } catch (error) {
        console.error('Error generating icon:', error)
        this.error = error.response?.data?.error || error.message || 'Failed to generate icon'
        this.generatedIcon = false
      } finally {
        this.isGenerating = false
      }
    },
    handleAnimationError(error) {
      console.error('Animation error:', error)
      this.error = 'Failed to load animation'
    },
    async handleDownload() {
      try {
        if (!this.currentAnimation) {
          throw new Error('No animation to download')
        }

        const jsonString = JSON.stringify(this.currentAnimation, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `icon-${Date.now()}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading icon:', error)
        this.error = 'Failed to download icon'
      }
    }
  }
}
</script>

<style scoped>
.animate-typing {
  animation: typing 1.5s infinite;
  opacity: 0.7;
}

@keyframes typing {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.3; }
}
</style> 