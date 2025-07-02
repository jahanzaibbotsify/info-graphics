<template>
  <section class="py-20">
    <div class="container">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <p class="text-lg text-muted-foreground">
          Everything you need to know about AnimIconAI
        </p>
      </div>
      
      <div class="max-w-3xl mx-auto">
        <div v-for="(item, index) in faqItems" :key="index" class="mb-4">
          <div 
            class="flex justify-between items-center p-4 cursor-pointer bg-card border rounded-lg"
            @click="toggleItem(index)"
          >
            <h3 class="text-lg font-medium">{{ item.question }}</h3>
            <chevron-down-icon 
              class="h-5 w-5 transition-transform duration-200" 
              :class="{'transform rotate-180': item.isOpen}"
            />
          </div>
          
          <div 
            v-if="item.isOpen" 
            class="p-4 pt-2 bg-card border-l border-r border-b rounded-b-lg mt-[-1px]"
          >
            <p class="text-muted-foreground">{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ChevronDownIcon } from 'lucide-vue'

export default {
  name: 'FAQ',
  components: {
    ChevronDownIcon
  },
  data() {
    return {
      faqItems: [
        {
          question: 'What is AnimIconAI?',
          answer: 'AnimIconAI is an AI-powered platform that allows you to create beautiful animated icons from text descriptions. Our technology combines the power of AI with intuitive design tools to help you create professional animations in seconds.',
          isOpen: true
        },
        {
          question: 'How does the AI generation work?',
          answer: 'Our AI system uses advanced machine learning models to understand your text descriptions and convert them into animated icons. It has been trained on thousands of professional animations to generate high-quality results.',
          isOpen: false
        },
        {
          question: 'What file formats can I export?',
          answer: 'You can export your animated icons in multiple formats including Lottie JSON (for web), GIF, MP4, and SVG. Different plans offer different export options.',
          isOpen: false
        },
        {
          question: 'Can I use the icons commercially?',
          answer: 'Yes! All icons you create with AnimIconAI are yours to use for personal or commercial projects. Our Pro and Enterprise plans include commercial licensing.',
          isOpen: false
        },
        {
          question: 'Do you offer custom solutions for teams?',
          answer: 'Absolutely! Our Enterprise plan is designed for teams and organizations that need custom solutions. Contact our sales team to discuss your specific requirements.',
          isOpen: false
        }
      ]
    }
  },
  methods: {
    toggleItem(index) {
      this.faqItems[index].isOpen = !this.faqItems[index].isOpen
    }
  }
}
</script> 