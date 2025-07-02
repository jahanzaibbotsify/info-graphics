<template>
  <section class="py-20">
    <div class="container">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          How It Works
        </h2>
        <p class="text-lg text-muted-foreground">
          Creating beautiful animated icons has never been easier
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <pencil-icon class="h-8 w-8 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2">1. Describe Your Icon</h3>
          <p class="text-muted-foreground">
            Enter a detailed description of the animated icon you want to create
          </p>
        </div>
        
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <settings-icon class="h-8 w-8 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2">2. Customize</h3>
          <p class="text-muted-foreground">
            Adjust colors, timing, and animation style to match your needs
          </p>
        </div>
        
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <download-icon class="h-8 w-8 text-primary" />
          </div>
          <h3 class="text-xl font-semibold mb-2">3. Download</h3>
          <p class="text-muted-foreground">
            Export your animated icon in multiple formats for any use case
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { PencilIcon, SettingsIcon, DownloadIcon } from 'lucide-vue'

export default {
  name: 'HowItWorks',
  components: {
    PencilIcon,
    SettingsIcon,
    DownloadIcon
  }
}
</script> 