<template>
  <section class="py-20 bg-primary/5">
    <div class="container">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          Ready to Create Amazing Animated Icons?
        </h2>
        <p class="text-lg text-muted-foreground mb-8">
          Join thousands of designers and developers who are creating stunning animations with AnimIconAI.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/signup">
            <button class="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-600 flex items-center gap-2">
              Get Started for Free <arrow-right-icon class="h-4 w-4" />
            </button>
          </router-link>
          <router-link to="/explore">
            <button class="px-6 py-3 border rounded-md hover:bg-muted">
              Explore Examples
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ArrowRightIcon } from 'lucide-vue'

export default {
  name: 'CTA',
  components: {
    ArrowRightIcon
  }
}
</script> 