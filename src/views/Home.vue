<template>
  <div class="flex flex-col items-center">
    <Hero />
    <Features />
    <HowItWorks />
    <Pricing />
    <FAQ />
    <CTA />
  </div>
</template>

<script>
import Hero from '@/components/Hero.vue'
import Features from '@/components/Features.vue'
import HowItWorks from '@/components/HowItWorks.vue'
import Pricing from '@/components/Pricing.vue'
import FAQ from '@/components/FAQ.vue'
import CTA from '@/components/CTA.vue'

export default {
  name: 'Home',
  components: {
    Hero,
    Features,
    HowItWorks,
    Pricing,
    FAQ,
    CTA
  }
}
</script> 