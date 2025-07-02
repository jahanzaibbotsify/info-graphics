<template>
  <section class="py-20 bg-muted/30">
    <div class="container">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Everything You Need to Create Amazing Animations
        </h2>
        <p class="text-lg text-muted-foreground">
          Our powerful platform combines AI technology with intuitive tools to help you create stunning animated icons in minutes.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(feature, index) in features" 
          :key="index" 
          class="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div class="mb-4">
            <component :is="feature.icon" class="h-10 w-10 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
          <p class="text-muted-foreground">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { 
  SparklesIcon, 
  SlidersIcon, 
  DownloadIcon, 
  ClockIcon, 
  PackageIcon, 
  PaletteIcon 
} from 'lucide-vue'

export default {
  name: 'Features',
  components: {
    SparklesIcon,
    SlidersIcon,
    DownloadIcon,
    ClockIcon,
    PackageIcon,
    PaletteIcon
  },
  data() {
    return {
      features: [
        {
          icon: 'sparkles-icon',
          title: 'AI-Powered Generation',
          description: 'Transform text prompts into beautiful animated icons using GPT-4 and DALL-E 3 technology.'
        },
        {
          icon: 'sliders-icon',
          title: 'Advanced Customization',
          description: 'Fine-tune animations with intuitive controls for colors, timing, easing, and more.'
        },
        {
          icon: 'download-icon',
          title: 'Multiple Export Formats',
          description: 'Download your animations as Lottie JSON, GIF, MP4, or SVG for use anywhere.'
        },
        {
          icon: 'clock-icon',
          title: 'Real-Time Preview',
          description: 'See your animated icons come to life instantly as you make adjustments.'
        },
        {
          icon: 'package-icon',
          title: 'Animation Library',
          description: 'Save your creations to your personal library for easy access and reuse.'
        },
        {
          icon: 'palette-icon',
          title: 'Style Variations',
          description: 'Apply different design styles from flat to neumorphic, outlined to 3D.'
        }
      ]
    }
  }
}
</script> 