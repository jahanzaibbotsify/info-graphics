<template>
  <footer class="border-t mt-auto">
    <div class="container mx-auto h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <router-link to="/" class="flex items-center gap-2">
          <img src="/logo.png" alt="Infogiraffe Art" class="object-contain" style="max-width: 100px;"  />
        </router-link>
        <span class="text-sm text-muted-foreground">© {{ new Date().getFullYear() }}</span>
      </div>
      
      <nav class="flex items-center gap-6">
        <a 
          href="/privacy" 
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Privacy
        </a>
        <a 
          href="/terms" 
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Terms
        </a>
        <!-- <a 
          href="https://twitter.com/Infogiraffe Art" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Twitter
        </a>
        <a 
          href="https://github.com/Infogiraffe Art" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          GitHub
        </a> -->
      </nav>
    </div>
  </footer>
</template>

<script>
import { SparklesIcon } from 'lucide-vue'

export default {
  name: 'Footer',
  components: {
    SparklesIcon
  }
}
</script> 